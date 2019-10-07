import React, { Component } from 'react';
import { Stack, StackItem } from 'nr1';

export default class EventStream extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { data } = this.props;
    return (
      <div>
        {data ? (
          <Stack directionType={Stack.DIRECTION_TYPE.VERTICAL}>
            <StackItem>Event Stream</StackItem>
          </Stack>
        ) : (
          <div className="no-session">
            <p className="head">Session Breakdown</p>
            <p className="msg">
              Click one of the sessions to the left to view it's breakdown here
            </p>
          </div>
        )}
      </div>
    );
  }
}
