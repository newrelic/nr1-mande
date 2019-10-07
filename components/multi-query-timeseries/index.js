import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NerdGraphQuery, LineChart, Spinner, HeadingText, BlockText } from 'nr1';
import { multiFacetChartTitles } from '../../utils/kpi-queries';
import ColorManager from '../../utils/color-manager';
import uuidv4 from 'uuid';

/**
 * Receive multiple queries.
 * Make sure the keyword Timeseries exists in each.
 * Execute them in a NerdGraph query.
 * Join the results.
 * Generate a LineChart
 */
export default class MultiQueryTimeseries extends Component {
  static propTypes = {
    accountId: PropTypes.number.isRequired,
    timeRange: PropTypes.object,
    queries: PropTypes.object.isRequired //array of named functions
  }

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

  _generateQuery() {
    const { queries, accountId } = this.props;
    const queryNames = Object.keys(queries);
    const query = `{
      actor {
        account(id: ${accountId}) {
          ${queryNames.map(key => {
            return ` ${key}: nrql ( query: "${queries[key](true, true)}" ) {
              results
            } `
          }).join(" ")}
        }
      }
    }`;
    //debug(query);
    return query;
  }

  _processData(data, queryNames) {
    const { timeRange: {duration}} = this.props;
    const durationInSeconds = duration / 1000;
    const lineChartData = [];
    queryNames.forEach(key => {
      if (data.actor.account[key] && data.actor.account[key].results) {
        const {results} = data.actor.account[key];
        const currentResults = results.filter(row => row.comparison == 'current');
        let previousResults = results.filter(row => row.comparison == 'previous');
        if (duration) {
          previousResults = previousResults.map((row, i) => {
            row.beginTimeSeconds = Number.parseInt(row.beginTimeSeconds) + durationInSeconds*2;
            return row;
          });
        }

        lineChartData.push({
          metadata: {
            id: `series-${key}-curr`,
            label: `Current ${multiFacetChartTitles[key]}`,
            color: this.colorManager.getColor(),
            viz: 'main',
            units: ['COUNT', 'TIMESTAMP']
          },
          data: currentResults.map(r => {
            return { y: r[key] > 0 ? r[key] : 0, x: r.beginTimeSeconds }
           })
        });
        lineChartData.push({
          metadata: {
            id: `series-${key}-prev`,
            label: `Previous ${multiFacetChartTitles[key]}`,
            color: this.colorManager.getColor(),
            viz: 'main',
            units: ['COUNT', 'TIMESTAMP']
          },
          data: previousResults.map(r => {
            return { y: r[key] > 0 ? r[key] : 0, x: r.beginTimeSeconds }
           })
        });
      }
    });
    return lineChartData;
  }

  render() {
    const { queries } = this.props;
    const queryNames = Object.keys(queries);
    return <NerdGraphQuery query={this._generateQuery()}>
      {(results) => {
        //console.debug(results);
        const { loading, error, data } = results;
        if (loading) {
          return <Spinner fillContainer />
        }
        if (error) {
          return <React.Fragment>
            <HeadingText>An error occurred</HeadingText>
            <BlockText>{error.message}</BlockText>
          </React.Fragment>
        }
        const lineChartData = this._processData(data, queryNames);
        if (lineChartData.length > 0) {
          //console.log("Line Chart Data", lineChartData);
          return <LineChart data={lineChartData} fullWidth />
        }
        return <React.Fragment>
          <HeadingText>No results found.</HeadingText>
        </React.Fragment>
      }}
    </NerdGraphQuery>
  }
}
