import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { BarChart, BlockText, HeadingText, NerdGraphQuery, Spinner } from 'nr1';
import ColorManager from '../../utils/color-manager';
import uuidv4 from 'uuid';

/**
 * Core concept for this component is a DefaultComponent that aligns multiple streams of data around a single Vizco chart based on a set of NRQL queries executed through GraphQL and delivered as one Vizco formatted data set.
 */
export default class MultiFacetChart extends Component {
  static propTypes = {
    facetClick: PropTypes.func.isRequired,
    facets: PropTypes.arrayOf(
      PropTypes.shape({
        valueAttr: PropTypes.string.isRequired,
        title: PropTypes.string,
        limit: PropTypes.number,
        onClick: PropTypes.func,
      })
    ),
    launcherUrlState: PropTypes.object,
    queryProps: PropTypes.shape({
      accountId: PropTypes.number.isRequired,
      compare: PropTypes.any,
      percentage: PropTypes.bool,
      valueAttr: PropTypes.string.isRequired, //what's the name of the value attribute in the query?
      sessionNrql: PropTypes.string,
      baseNrql: PropTypes.string.isRequired,
      eventType: PropTypes.string.isRequired,
      whereClause: PropTypes.string,
    }),
    title: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.colorManager = new ColorManager({
      persist: true,
      persistKey: `color-mgr-multifacet-chart-${uuidv4()}`,
      consistentBy: {
        facetName: true,
        facetValue: true,
        eventName: false,
      },
    });
  }

  _facetGraphqlNrql(facet, durationInMinutes) {
    return `${facet.valueAttr}: nrql (query: "${this._facetNrql(facet, durationInMinutes)}") {
      results
    }`;
  }

  _facetNrql(facet, durationInMinutes) {
    const { queryProps } = this.props;
    if (facet) {
      let compareStmt = '';
      // by default, a true value will compare with a day ago; but the prop can also contain a NRQL fragment
      if (queryProps.compare === true) {
        compareStmt = ' COMPARE WITH 1 DAY AGO ';
      } else if (queryProps.compare) {
        compareStmt = queryProps.compare;
      }
      const limit = facet.limit ? ` LIMIT ${facet.limit} ` : '';

      return `${queryProps.baseNrql} FROM ${queryProps.eventType} ${queryProps.whereClause} facet ${facet.valueAttr} ${limit} SINCE ${durationInMinutes} MINUTES AGO ${compareStmt}`;
    } else {
      return `${queryProps.baseNrql} FROM ${queryProps.eventType} ${queryProps.whereClause} SINCE ${durationInMinutes} MINUTES AGO`;
    }
  }

  _buildNerdGraphQuery() {
    const { facets, queryProps, launcherUrlState: { timeRange: { duration }} } = this.props;
    const durationInMinutes = duration / 1000 / 60;
    return `{
      actor {
        account(id: ${queryProps.accountId}) {
          ${queryProps.valueAttr}: nrql (query: "${this._facetNrql(null, durationInMinutes)}") {
              results
          }
          ${facets.map(facet => this._facetGraphqlNrql(facet, durationInMinutes))}
        }
      }
    }`;
  }

  _processData(data) {
    const { queryProps: { percentage }, facets } = this.props;
    const { queryProps } = this.props;
    const chartData = [];
    // foreach domain, look for it's data and add it.
    facets.forEach(facet => {
      if (data.actor.account[facet.valueAttr] && data.actor.account[facet.valueAttr].results) {
        data.actor.account[facet.valueAttr].results.forEach((row, index) => {
          const value = row[queryProps.valueAttr];
          const obj = {
            metadata: {
              id: `series-${index}-${facet.valueAttr}`,
              label: `${facet.title}: ${row['facet']}`,
              color: this.colorManager.getColor(),
              viz: 'main',
              units: [percentage ? 'percentage' : 'count', 'count'],
              facet: {
                title: facet.title,
                name: facet.valueAttr,
                value: row['facet'],
              },
            },
            data: [
              {
                y: value,
                x: index,
              },
            ],
          };
          if (facet.hasOwnProperty('onClick')) {
            obj.metadata.facetOnClick = facet.onClick;
          }
          chartData.push(obj);
        });
      }
    });
    chartData.sort((a, b) => {
      return a.data.y > b.data.y;
    });
    return chartData;
  }

  render() {
    const { title, facetClick } = this.props;
    const q = this._buildNerdGraphQuery();
    console.debug(q);
    return (<NerdGraphQuery query={q}>
      {({data, loading, error}) => {
        console.debug([data, loading, error]);
        if (loading) {
          return <Spinner fillContainer />
        }
        if (error) {
          return (<React.Fragment>
            <HeadingText type={HeadingText.TYPE.HEADING_4}>An error occurred</HeadingText>
            <BlockText>{error.message}</BlockText>
          </React.Fragment>)
        }
        //debugger;
        const results = this._processData(data);
        if (results) {
          return <div>
            <HeadingText>{title}</HeadingText>
            <BarChart data={results} onClickBar={facetClick} />
          </div>
        } else {
          return <BlockText type={BlockText.TYPE.PARAGRAPH}>No data found</BlockText>
        }
      }}
    </NerdGraphQuery>);
  }
}