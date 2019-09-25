import React, { Component } from 'react';
import { Stack, StackItem } from 'nr1';

export default class Timeline extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { data } = this.props;
    return (
      <div>
        {data ? (
          <Stack directionType={Stack.DIRECTION_TYPE.VERTICAL}>
            <StackItem>Timeline</StackItem>
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
