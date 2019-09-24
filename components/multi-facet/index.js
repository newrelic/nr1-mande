import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import _ from 'lodash';

import { BarChart, BlockText, NerdGraphQuery, Spinner } from 'nr1';

// import { DefaultWidget, GenericComponent, ColorManager } from '@datanerd/vizco';
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
    title: PropTypes.string.isRequired,
    refreshInterval: PropTypes.number,
  };

  static defaultProps = {
    refreshInterval: 15000,
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
    this.state = {
      data: null,
    };
  }

  _facetGraphqlNrql(facet) {
    return `${facet.valueAttr}: nrql (query: "${this._facetNrql(facet)}") {
      results
    }`;
  }

  _facetNrql(facet) {
    const duration = _.get(
      this.props,
      'launcherUrlState.timeRange.duration',
      1800000 // Initialize/default to 30 min
    );

    const durationInMinutes = duration / 1000 / 60;

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
    const { facets, queryProps } = this.props;
    return gql`{
      actor {
        account(id: ${queryProps.accountId}) {
          ${queryProps.valueAttr}: nrql (query: "${this._facetNrql()}") {
              results
          }
          ${facets.map(facet => this._facetGraphqlNrql(facet))}
        }
      }
    }`;
  }

  _refreshNerdGraph() {
    const { queryProps, facets } = this.props;
    const { percentage } = queryProps;
    const query = this._buildNerdGraphQuery();

    // console.log(query);

    NerdGraphQuery.query({ query }).then(res => {
      const { loading, data, errors } = res;

      /*
        there's a few things we need to find here:
        1) the max value for the chart range
        2) building out the data array
      */

      const chartData = [];
      // foreach domain, look for it's data and add it.
      facets.forEach(facet => {
        if (
          data.actor.account[facet.valueAttr] &&
          data.actor.account[facet.valueAttr].results
        ) {
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

      this.setState({ data: chartData }, () => {
        this.refreshTimer = setTimeout(() => {
          this._refreshNerdGraph();
        }, this.props.refreshInterval);
      });
    });
  }

  componentDidMount() {
    this._refreshNerdGraph();
  }

  shouldComponentUpdate(nextProps) {
    const duration = _.get(
      nextProps,
      'launcherUrlState.timeRange.duration',
      false
    );

    let durationChanged = false;
    if (duration) {
      durationChanged =
        this.props.launcherUrlState.timeRange.duration !==
        nextProps.launcherUrlState.timeRange.duration;
    }

    const nrqlChanged =
      this.props.queryProps.baseNrql !== nextProps.queryProps.baseNrql;
    const facetsChanged =
      nextProps.facets && this.props.facets.length !== nextProps.facets.length;

    if (durationChanged || nrqlChanged || facetsChanged) {
      clearTimeout(this.refreshTimer);
      this.setState({ data: null }, () => {
        this._refreshNerdGraph();
      });
    }

    return true;
  }

  componentWillUnmount() {
    clearTimeout(this.refreshTimer);
  }

  render() {
    const { data } = this.state;
    const { title, facetClick } = this.props;

    // TO DO - Format some with percentage
    // const { percentage } = queryProps;

    if (_.isNull(data)) {
      return <Spinner />;
    }

    if (_.isArray(data) && _.isEmpty(data)) {
      return (
        <BlockText type={BlockText.TYPE.PARAGRAPH}>No data found</BlockText>
      );
    }

    if (data) {
      return <BarChart title={title} data={data} onClickBar={facetClick} />;
    }
  }
}
