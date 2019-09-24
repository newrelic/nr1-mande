import React from 'react';
import { PlatformStateContext, NerdletStateContext } from 'nr1';
import VideoSessionList from './session-list';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class Wrapper extends React.Component {
  render() {
    return (
      <PlatformStateContext.Consumer>
        {launcherUrlState => (
          <NerdletStateContext.Consumer>
            {nerdletUrlState => (
              <VideoSessionList
                launcherUrlState={launcherUrlState}
                nerdletUrlState={nerdletUrlState}
              />
            )}
          </NerdletStateContext.Consumer>
        )}
      </PlatformStateContext.Consumer>
    );
  }
}
