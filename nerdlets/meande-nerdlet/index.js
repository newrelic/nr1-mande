import React from 'react';
import PropTypes from 'prop-types';
import EventStream from '../../components/EventStream';

import { Button, Icon } from 'nr1';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class Meande extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  //   openMediaSessionExplorer() {
  //     const { entity } = this.props;
  //     navigation.openStackedNerdlet({
  //       id: 'media-session-explorer',
  //       urlState: {
  //         pageUrl,
  //         entityGuid: entity.guid,
  //       },
  //     });
  //   }

  render() {
    return (
      <div>
        <EventStream />
      </div>
    );
  }
}
