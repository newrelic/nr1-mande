import React from 'react';
import PropTypes from 'prop-types';

import gql from 'graphql-tag';

export default class VideoQosSessionNerdlet extends React.Component {
  static propTypes = {};

  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidUpdate() {}
  componentDidMount() {}

  render() {
    return (
      <>
        <h1>QOS Session</h1>
      </>
    );
  }
}
