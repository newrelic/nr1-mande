import React from 'react'
import { NrqlQuery, Spinner, Button, Icon, Stack, StackItem } from 'nr1'
import Moment from 'react-moment'
import videoGroup from './VideoGroup'

export default class EventStream extends React.Component {
  state = {
    expandedTimelineItem: null,
  }

  handleTimelineItemClick = e => {
    e.preventDefault()
    const { expandedTimelineItem } = this.state

    let timelineItemId = e.currentTarget.getAttribute('data-timeline-item-id')
    if (timelineItemId == expandedTimelineItem) {
      this.setState({ expandedTimelineItem: null })
    } else {
      this.setState({ expandedTimelineItem: timelineItemId })
    }
  }

  buildStreamTimeline = event => {
    let timeline = Object.keys(event)
    timeline = timeline.sort()
    let data = []

    timeline.forEach((attr, i) => {
      if (event[attr]) {
        data.push(
          <li key={i} className="timeline-item-contents-item">
            <span className="key">{attr}</span>
            <span className="value">{event[attr]}</span>
          </li>
        )
      }
    })
    return data
  }

  buildStream = (data, legend) => {
    const sessionEvents = []

    data.forEach((event, i) => {
      let legendItem = null
      for (let item of legend) {
        if (item.group.actionNames.includes(event.actionName)) {
          legendItem = item
          break
        }
      }

      const date = new Date(event.timestamp)
      let open =
        this.state.expandedTimelineItem == i ? 'timeline-item-expanded' : ''
      const streamTimeline = this.buildStreamTimeline(event)

      legendItem && legendItem.visible &&
        sessionEvents.push(
          <div
            key={i}
            data-timeline-item-id={i}
            onClick={this.handleTimelineItemClick}
            className={`timeline-item ${legendItem.group.eventDisplay.class} ${open}`}
          >
            <div className="timeline-item-timestamp">
              <span className="timeline-timestamp-date">
                <Moment format="MM/DD/YYYY" date={date} />
              </span>
              <span className="timeline-timestamp-time">
                <Moment format="h:mm:ss a" date={date} />
              </span>
            </div>
            <div className="timeline-item-dot"></div>
            <div className="timeline-item-body">
              <div className="timeline-item-body-header">
                <div className="timeline-item-symbol">
                  <Icon
                    className="timeline-item-symbol-icon"
                    type={legendItem.group.eventDisplay.icon}
                    color={legendItem.group.eventDisplay.color}
                  ></Icon>
                </div>
                <div className="timeline-item-title">{event.actionName}</div>
                <Button
                  className="timeline-item-dropdown-arrow"
                  type={Button.TYPE.PLAIN_NEUTRAL}
                  iconType={
                    Button.ICON_TYPE
                      .INTERFACE__CHEVRON__CHEVRON_BOTTOM__V_ALTERNATE
                  }
                ></Button>
              </div>
              <div className="timeline-item-contents-container">
                <ul className="timeline-item-contents">{streamTimeline}</ul>
              </div>
            </div>
          </div>
        )
    })
    return sessionEvents
  }

  render() {
    const { data, loading, legend } = this.props

    console.debug('eventstream data', data)

    const stream = this.buildStream(data, legend)

    const eventContent = loading ? (
      <Spinner />
    ) : !loading && stream.length > 0 ? (
      <div className="timeline-container">{stream}</div>
    ) : (
      <Stack
        fullWidth
        fullHeight
        className="emptyState eventStreamEmptyState"
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
        horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
        verticalType={Stack.VERTICAL_TYPE.CENTER}
      >
        <StackItem>
          <p className="emptyStateHeader">Event Stream data not available.</p>
        </StackItem>
      </Stack>
    )

    return (
      <div className="eventStreamSectionBase sessionSectionBase">
        {eventContent}
      </div>
    )
  }
}
