import React from 'react';
import PropTypes from 'prop-types';
import { EntityByGuidQuery, Grid, GridItem } from 'nr1';
import SessionList from '../../components/session-list';
import SessionColors from '../../utils/colors';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class VideoSessionList extends React.Component {
  static propTypes = {
    entity: PropTypes.object,
    nr1: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      account_id: 1567277,
      eventType: 'PageAction',
      facet: {
        name: 'city',
        value: 'Singapore',
      },
      session: null,
      sessionEvents: null,
    };
    this.callbacks = {
      sessionClick: this.sessionClick.bind(this),
    };
    this.constructGauge = this._constructGauge.bind(this);
  }

  _constructGauge(data) {
    //console.log(data)
    const { eventType } = this.state;
    if (this.state.sessionEvents == null) {
      let prevItem = null;
      const sessionEvents = [];
      data[0].data.forEach(item => {
        if (prevItem) {
          sessionEvents.push({
            label: SessionColors.getLabel(eventType, prevItem),
            value: item.timestamp - prevItem.timestamp,
            color: SessionColors.getColor(eventType, prevItem),
          });
        }
        prevItem = item;
      });
      this.setState({ sessionEvents });
    }
  }

  sessionClick(series, chart) {
    //console.log([series, chart])
    console.log('session clicked');
    this.setState({ session: chart.metadata.name, sessionEvents: null });
  }

  _getWhereClause() {
    const { facet } = this.state;
    let where = ` WHERE ${facet.name} = '${facet.value}' `;
    return where;
  }

  render() {
    const { account_id, eventType, session, facet } = this.state;
    const { launcherUrlState, nerdletUrlState } = this.props;
    // const baseNrql = `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START')/uniqueCount(viewId))*100 as 'percentBuffering'`;
    const sessionNrql = `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START')/uniqueCount(viewId))*100 as 'percentBuffering' FROM PageAction SINCE 1 month ago FACET session `;
    // const sessionNrql = `${baseNrql} FROM ${eventType} ${this._getWhereClause()} FACET session SNICE 1 month ago limit 25`;

    return (
      <Grid>
        <GridItem columnSpan={6}>
          <SessionList
            account_id={account_id}
            query={sessionNrql}
            launcherUrlState={launcherUrlState}
            nerdletUrlState={nerdletUrlState}
            callbacks={this.callbacks}
            // title={`Sessions in ${facet.title}:${facet.value}`}
          />
        </GridItem>
        <GridItem columnSpan={6}>
          {console.log(nerdletUrlState)}
          {/* <div className="nr1-RedBox">1</div> */}
        </GridItem>
      </Grid>
    );
  }
}
