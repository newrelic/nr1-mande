import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NerdGraphQuery, LineChart, Spinner, HeadingText, BlockText } from 'nr1';

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
    queries: PropTypes.array.isRequired //array of named functions
  }

  _generateQuery() {
    const { queries, accountId } = this.props;
    const queryNames = Object.keys(queries);
    return `{
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
  }

  render() {
    const { queries } = this.props;
    const queryNames = Object.keys(queries);
    return <NerdGraphQuery query={this._generateQuery()}>
      {(loading, error, data) => {
        if (loading) {
          return <Spinner fillContainer />
        }
        if (error) {
          return <React.Fragment>
            <HeadingText>An error occurred</HeadingText>
            <BlockText>{error.message}</BlockText>
          </React.Fragment>
        }
        const lineChartData = [];
        if (data) {
          console.log(data);
          queryNames.forEach(key => {
            lineChartData.push({
              metadata: data[key].results.data[0].metadata,
              data: data[key].results.data[0].data
            })
          });
          return <LineChart data={lineChartData} fullWidth />
        }
        return <React.Fragment>
          <HeadingText>No results found.</HeadingText>
        </React.Fragment>
      }}
    </NerdGraphQuery>
  }
}
