import React from 'react';
import PropTypes from 'prop-types';
import {
  EntityByGuidQuery,
  Grid,
  GridItem,
  Stack,
  StackItem,
  HeadingText,
} from 'nr1';
import SessionList from '../../components/session-list';
import EventStream from '../../components/EventStream';
import Timeline from '../../components/timeline';
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
      session: null,
      sessionEvents: null,
    };
    // console.log('props', props);
    this.callbacks = {
      sessionClick: this.sessionClick.bind(this),
    };
    this.constructGauge = this._constructGauge.bind(this);
  }

  _constructGauge(data) {
    //console.log(data)
    const { eventType } = this.props.nerdletUrlState;
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

  sessionClick(chart) {
    this.setState({ session: chart.metadata.name, sessionEvents: null });
  }

  _getWhereClause() {
    const { facet } = this.props.nerdletUrlState;
    let where = ` WHERE ${facet.name} = '${facet.value}' `;
    return where;
  }

  render() {
    const { session } = this.state;
    const { launcherUrlState, nerdletUrlState } = this.props;
    const { accountId, eventType, facet } = nerdletUrlState;
    const baseNrql = `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START')/uniqueCount(viewId))*100 as 'percentBuffering'`;
    const sessionNrql = `${baseNrql} FROM ${eventType} ${this._getWhereClause()} FACET session SINCE 1 month ago limit 25`;

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
        <GridItem columnSpan={6} className="column">
          <SessionList
            account_id={accountId}
            query={sessionNrql}
            launcherUrlState={launcherUrlState}
            nerdletUrlState={nerdletUrlState}
            callbacks={this.callbacks}
            title={`Sessions in ${facet.title}:${facet.value}`}
          />
        </GridItem>
        <GridItem columnSpan={6} className="column">
          <Timeline
            data={this.state.sessionEvents}
            session={this.state.session}
          />
          <EventStream
            accountId={accountId}
            session={session}
            eventType={eventType}
          />
        </GridItem>
      </Grid>
    );
  }
}
