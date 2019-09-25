import React from 'react';
import PropTypes from 'prop-types';

import { Button, Icon } from 'nr1';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class EventStream extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expandedTimelineItem: 0
    };

    this.handleTimelineItemClick = this.handleTimelineItemClick.bind(this);
  }

  handleTimelineItemClick(e) {
    e.preventDefault()
    let timelineItemId = e.currentTarget.getAttribute('data-timeline-item-id')
    this.setState(state => ({
      expandedTimelineItem: timelineItemId
    }));
  }

  render() {
    return (
      <div className="temporary-dummy-class-to-ensure-timeline-container-isnt-too-wide">
        <div className="timeline-container">
          <div data-timeline-item-id="1" onClick={this.handleTimelineItemClick} className="timeline-item timeline-item-type-ad">
            <div className="timeline-item-timestamp">
              <span className="timeline-timestamp-date">9/14/19</span>
              <span className="timeline-timestamp-time">1:44:24 PM</span>
            </div>
            <div className="timeline-item-dot"></div>
            <div className="timeline-item-body">
              <div className="timeline-item-body-header">
                <div className="timeline-item-symbol">
                  <Icon className="timeline-item-symbol-icon" type={Icon.TYPE.INTERFACE__OPERATIONS__SHOW} color="#007e8a"></Icon>
                </div>
                <div className="timeline-item-title">AD_REQUEST</div>
                <Button
                  className="timeline-item-dropdown-arrow"
                  type={Button.TYPE.PLAIN_NEUTRAL}
                  iconType={Button.ICON_TYPE.INTERFACE__CHEVRON__CHEVRON_BOTTOM__V_ALTERNATE}
                ></Button>
              </div>
              <div className="timeline-item-contents-container">
                <ul className="timeline-item-contents">
                  <li className="timeline-item-contents-item">
                    <span className="key">actionName:</span>
                    <span className="value">108277857</span>
                  </li>
                  <li className="timeline-item-contents-item">
                    <span className="key">actionName:</span>
                    <span className="value">108277857</span>
                  </li>
                  <li className="timeline-item-contents-item">
                    <span className="key">actionName:</span>
                    <span className="value">108277857</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div data-timeline-item-id="2" onClick={this.handleTimelineItemClick} className="timeline-item timeline-item-expanded timeline-item-type-content">
            <div className="timeline-item-timestamp">
              <span className="timeline-timestamp-date">9/14/19</span>
              <span className="timeline-timestamp-time">1:44:24 PM</span>
            </div>
            <div className="timeline-item-dot"></div>
            <div className="timeline-item-body">
              <div className="timeline-item-body-header">
                <div className="timeline-item-symbol">
                  <Icon className="timeline-item-symbol-icon" type={Icon.TYPE.DOCUMENTS__DOCUMENTS__NOTES} color="#9C5400"></Icon>
                </div>
                <div className="timeline-item-title">CONTENT_GENERATION</div>
                <Button
                  className="timeline-item-dropdown-arrow"
                  type={Button.TYPE.PLAIN_NEUTRAL}
                  iconType={Button.ICON_TYPE.INTERFACE__CHEVRON__CHEVRON_BOTTOM__V_ALTERNATE}
                ></Button>
              </div>
              <div className="timeline-item-contents-container">
                <ul className="timeline-item-contents">
                  <li className="timeline-item-contents-item">
                    <span className="key">actionName:</span>
                    <span className="value">108277857</span>
                  </li>
                  <li className="timeline-item-contents-item">
                    <span className="key">actionName:</span>
                    <span className="value">108277857</span>
                  </li>
                  <li className="timeline-item-contents-item">
                    <span className="key">actionName:</span>
                    <span className="value">108277857</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div data-timeline-item-id="3" onClick={this.handleTimelineItemClick} className="timeline-item timeline-item-type-error">
            <div className="timeline-item-timestamp">
              <span className="timeline-timestamp-date">9/14/19</span>
              <span className="timeline-timestamp-time">1:44:24 PM</span>
            </div>
            <div className="timeline-item-dot"></div>
            <div className="timeline-item-body">
              <div className="timeline-item-body-header">
                <div className="timeline-item-symbol">
                  <Icon className="timeline-item-symbol-icon" type={Icon.TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__APPLICATION__S_ERROR} color="#bf0015"></Icon>
                </div>
                <div className="timeline-item-title">ERROR</div>
                <Button
                  className="timeline-item-dropdown-arrow"
                  type={Button.TYPE.PLAIN_NEUTRAL}
                  iconType={Button.ICON_TYPE.INTERFACE__CHEVRON__CHEVRON_BOTTOM__V_ALTERNATE}
                ></Button>
              </div>
              <div className="timeline-item-contents-container">
                <ul className="timeline-item-contents">
                  <li className="timeline-item-contents-item">
                    <span className="key">actionName:</span>
                    <span className="value">108277857</span>
                  </li>
                  <li className="timeline-item-contents-item">
                    <span className="key">actionName:</span>
                    <span className="value">108277857</span>
                  </li>
                  <li className="timeline-item-contents-item">
                    <span className="key">actionName:</span>
                    <span className="value">108277857</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div data-timeline-item-id="4" onClick={this.handleTimelineItemClick} className="timeline-item timeline-item-type-general">
            <div className="timeline-item-timestamp">
              <span className="timeline-timestamp-date">9/14/19</span>
              <span className="timeline-timestamp-time">1:44:24 PM</span>
            </div>
            <div className="timeline-item-dot"></div>
            <div className="timeline-item-body">
              <div className="timeline-item-body-header">
                <div className="timeline-item-symbol">
                </div>
                <div className="timeline-item-title">GENERAL</div>
                <Button
                  className="timeline-item-dropdown-arrow"
                  type={Button.TYPE.PLAIN_NEUTRAL}
                  iconType={Button.ICON_TYPE.INTERFACE__CHEVRON__CHEVRON_BOTTOM__V_ALTERNATE}
                ></Button>
              </div>
              <div className="timeline-item-contents-container">
                <ul className="timeline-item-contents">
                  <li className="timeline-item-contents-item">
                    <span className="key">actionName:</span>
                    <span className="value">108277857</span>
                  </li>
                  <li className="timeline-item-contents-item">
                    <span className="key">actionName:</span>
                    <span className="value">108277857</span>
                  </li>
                  <li className="timeline-item-contents-item">
                    <span className="key">actionName:</span>
                    <span className="value">108277857</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
