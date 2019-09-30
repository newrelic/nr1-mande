import React, { Component } from 'react';
import { Stack, StackItem, Spinner, BlockText, NrqlQuery } from 'nr1';
import Gauge from '../gauge';
import SessionColors from '../gauge/colors';

export default class Timeline extends Component {
  constructor(props) {
    super(props);
  }

  _buildGauge(eventType, data) {
    const eventStream = [];
    let prevEvent = null;
    data[0].data.forEach(result => {
      if (!prevEvent) {
        prevEvent = result;
      }
      const value = result.timestamp - prevEvent.timestamp;
      eventStream.push({
        label: SessionColors.getLabel(eventType, prevEvent),
        value: value > 0 ? value : 1,
        color: SessionColors.getColor(eventType, prevEvent),
        timeSinceLoad: result.timeSinceLoad,
      });
      prevEvent = result;
    });
    return eventStream;
  }

  render() {
    const { accountId, session, eventType, durationInMinutes } = this.props;
    const query = `SELECT * from ${eventType} WHERE session = '${session}' ORDER BY timestamp ASC LIMIT 1000 since ${durationInMinutes} minutes ago`;
    return (
      <div>
        {session ? (
          <Stack
            className="gaugeStack"
            directionType={Stack.DIRECTION_TYPE.VERTICAL}
          >
            <StackItem className="gaugeStackItem sessionSectionBase">
              <NrqlQuery accountId={accountId} query={query}>
                {({ data, error, loading }) => {
                  if (loading) return <Spinner fillContainer />;
                  if (error) return <BlockText>{error.message}</BlockText>;

                  const stream = this._buildGauge(eventType, data);
                  return <Gauge data={stream} height={25} showLegend={true} />;
                }}
              </NrqlQuery>
            </StackItem>
          </Stack>
        ) : (
          <div className="no-session">
            <p className="head">Select a session to review a timeline</p>
            <p className="msg">
              When you select a session (in the column on the left) you will be
              able to review a visual timeline for it here.
            </p>
          </div>
        )}
      </div>
    );
  }
}
