import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  GridItem,
  HeadingText,
} from 'nr1';
import SessionList from '../../components/session-list';
import EventStream from '../../components/EventStream';
import Timeline from '../../components/timeline';
import { generateQueries } from '../../utils/kpi-queries';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class VideoSessionList extends React.Component {
  static propTypes = {
    entity: PropTypes.object,
    nr1: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      session: null,
      sessionEvents: null,
    };
    // console.log('props', props);
    this.callbacks = {
      sessionClick: this.sessionClick.bind(this),
    };
  }

  sessionClick(chart) {
    this.setState({ session: chart.metadata.name });
  }

  _getWhereClause() {
    const { facet } = this.props.nerdletUrlState;
    let where = ` WHERE ${facet.name} = '${facet.value}' `;
    return where;
  }

  render() {
    const { session } = this.state;
    const { launcherUrlState, nerdletUrlState } = this.props;
    const { timeRange: { duration }} =  launcherUrlState;
    const { accountId, eventType, facet, whereClause, selectedKpi } = nerdletUrlState;
    const durationInMinutes = duration / 1000 / 60;
    const queries = generateQueries(durationInMinutes, eventType, whereClause);
    const sessionNrql = `${queries.kpiQueries[selectedKpi]()} ${this._getWhereClause()} FACET session limit 25`;
    return (
      <Grid>
        <GridItem columnSpan={12}>
          <header className="header">
            <HeadingText type={HeadingText.TYPE.HEADING_1}>
              Select a session
            </HeadingText>
            <p className="subtitle">
              {facet.title}: {facet.value}
            </p>
          </header>
        </GridItem>
        <GridItem columnSpan={4} className="sessionColumn">
          <SessionList
            account_id={accountId}
            query={sessionNrql}
            launcherUrlState={launcherUrlState}
            nerdletUrlState={nerdletUrlState}
            callbacks={this.callbacks}
            title={`Sessions in ${facet.title}:${facet.value}`}
          />
        </GridItem>
        <GridItem columnSpan={8}>
          <Timeline
            accountId={accountId}
            session={session}
            eventType={eventType}
            durationInMinutes={durationInMinutes}
            className="sessionColumn"
          />
          <EventStream
            accountId={accountId}
            session={session}
            eventType={eventType}
            durationInMinutes={durationInMinutes}
            className="sessionColumn"
          />
        </GridItem>
      </Grid>
    );
  }
}
