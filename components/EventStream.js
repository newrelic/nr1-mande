import React from 'react';
import PropTypes from 'prop-types';
import { NrqlQuery, Spinner, Button, Icon, Stack, StackItem } from 'nr1';
import Moment from 'react-moment';
import EventCategories from '../utils/categories';
import eventStreamPlaceholder from '../nerdlets/assets/event-stream-placeholder.png';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class EventStream extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expandedTimelineItem: null,
    };
    this.handleTimelineItemClick = this.handleTimelineItemClick.bind(this);
  }

  handleTimelineItemClick(e) {
    e.preventDefault();
    let timelineItemId = e.currentTarget.getAttribute('data-timeline-item-id');
    if (timelineItemId == this.state.expandedTimelineItem) {
      this.setState(state => ({
        expandedTimelineItem: null,
      }));
    } else {
      this.setState(state => ({
        expandedTimelineItem: timelineItemId,
      }));
    }
  }

  _buildStreamTimeline(event) {
    let timeline = Object.keys(event);
    timeline = timeline.sort();
    let data = [];
    // console.log(timeline)
    timeline.forEach((attr, i) => {
      if (event[attr]) {
        data.push(
          <li key={i} className="timeline-item-contents-item">
            <span className="key">{attr}</span>
            <span className="value">{event[attr]}</span>
          </li>
        );
      }
    });
    return data;
  }
  _buildStream(pageAction, data) {
    const sessionEvents = [];
    data[0].data.forEach((event, i) => {
      const sessionCategory = EventCategories.setCategory(pageAction, event);
      const date = new Date(event.timestamp);
      // eslint-disable-next-line prettier/prettier
      let open =
        this.state.expandedTimelineItem == i ? 'timeline-item-expanded' : '';
      const streamTimeline = this._buildStreamTimeline(event);

      sessionEvents.push(
        <div
          key={i}
          data-timeline-item-id={i}
          onClick={this.handleTimelineItemClick}
          className={`timeline-item ${sessionCategory.class} ${open}`}
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
                  type={sessionCategory.icon}
                  color={sessionCategory.color}
                ></Icon>
              </div>
              <div className="timeline-item-title">{sessionCategory.label}</div>
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
      );
    });
    return sessionEvents;
  }

  render() {
    const { accountId, session, eventType, durationInMinutes } = this.props;
    const query = `SELECT * from ${eventType} WHERE session = '${session}' ORDER BY timestamp ASC LIMIT 1000 since ${durationInMinutes} minutes ago`;

    return (
      <div className="eventStreamSectionBase sessionSectionBase">
        {session ? (
          <NrqlQuery accountId={accountId} query={query}>
            {({ data, error, loading }) => {
              if (loading) return <Spinner />;
              if (error) return 'ERROR';

              const stream = this._buildStream(eventType, data);
              return <div className="timeline-container">{stream}</div>;
            }}
          </NrqlQuery>
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
              <p className="emptyStateHeader">
                Select a session to review a timeline
              </p>
            </StackItem>
            <StackItem>
              <p className="emptyStateDescription">
                When you select a session (in the column on the left) you will
                be able to review a visual timeline for it here.
              </p>
            </StackItem>
          </Stack>
        )}
      </div>
    );
  }
}
