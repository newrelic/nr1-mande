import React, { Component } from 'react'
import { Stack, StackItem, Spinner, BlockText, NrqlQuery } from 'nr1'
import Gauge from '../gauge'
import videoGroup from '../../utils/video-group-format'

export default class Timeline extends Component {
  constructor(props) {
    super(props)
  }

  _buildGauge(eventType, data) {
    console.debug('guage.buildGuage eventType data', eventType, data)

    const eventStream = []
    let prevEvent = null
    data[0].data.forEach(result => {
      if (!prevEvent) {
        prevEvent = result
      }
      const value = result.timestamp - prevEvent.timestamp
      const sessionGroup = videoGroup(prevEvent.actionName)

      eventStream.push({
        label: sessionGroup.timelineDisplay.label,
        value: value > 0 ? value : 1,
        color: sessionGroup.timelineDisplay.color,
        timeSinceLoad: result.timeSinceLoad,
      })
      prevEvent = result
    })
    return eventStream
  }

  render() {
    const { accountId, session, eventType, durationInMinutes } = this.props
    const query = `SELECT * from ${eventType} WHERE session = '${session}' ORDER BY timestamp ASC LIMIT 1000 since ${durationInMinutes} minutes ago`
    return (
      <div>
        <Stack
          className="gaugeStack"
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
        >
          <StackItem className="gaugeStackItem sessionSectionBase">
            {session ? (
              <NrqlQuery accountId={accountId} query={query}>
                {({ data, error, loading }) => {
                  if (loading) return <Spinner fillContainer />
                  if (error) return <BlockText>{error.message}</BlockText>

                  const stream = this._buildGauge(eventType, data)
                  return <Gauge data={stream} height={25} showLegend={true} />
                }}
              </NrqlQuery>
            ) : (
              <Stack
                fullWidth
                className="emptyState timelineEmptyState"
                directionType={Stack.DIRECTION_TYPE.VERTICAL}
                verticalType={Stack.VERTICAL_TYPE.CENTER}
                horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
              >
                <StackItem>
                  <p className="emptyStateHeader">Session breakdown</p>
                </StackItem>
                <StackItem>
                  <p className="emptyStateDescription">
                    Click one of the sessions to the left to view it’s breakdown
                    here
                  </p>
                </StackItem>
              </Stack>
            )}
          </StackItem>
        </Stack>
      </div>
    )
  }
}
