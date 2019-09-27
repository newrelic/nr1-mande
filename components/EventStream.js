import React from 'react';
import PropTypes from 'prop-types';
import { NrqlQuery, Spinner, Button, Icon } from 'nr1';
import Moment from 'react-moment';
import EventCategories from '../utils/categories';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class EventStream extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      expandedTimelineItem: 0,
    };
    this.handleTimelineItemClick = this.handleTimelineItemClick.bind(this);
  }

  handleTimelineItemClick(e) {
    e.preventDefault();
    let timelineItemId = e.currentTarget.getAttribute('data-timeline-item-id');
    this.setState(state => ({
      expandedTimelineItem: timelineItemId,
    }));
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
      const date = new Date(event.timestamp * 1000);
      // eslint-disable-next-line prettier/prettier
      let open = (this.state.expandedTimelineItem == i) ? 'timeline-item-expanded': '';
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
              <Moment format="MM/DD/YY" date={date} />
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

    if (!session) return <div>Please select a session.</div>;

    console.log(session, query);
    return (
      <NrqlQuery accountId={accountId} query={query}>
        {({ data, error, loading }) => {
          if (loading) return <Spinner />;
          if (error) return 'ERROR';
          console.log('data', data);
          const stream = this._buildStream(eventType, data);
          return (
            <div className="temporary-dummy-class-to-ensure-timeline-container-isnt-too-wide">
              <div className="timeline-container">{stream}</div>
            </div>
          );
        }}
      </NrqlQuery>
    );
  }
}
