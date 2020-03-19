import React from 'react'
import { PlatformStateContext, NerdletStateContext } from 'nr1'
import MandeContainer from './MandeContainer'

export default class Wrapper extends React.Component {
  render() {
    return (
      <PlatformStateContext.Consumer>
        {launcherUrlState => (
          <NerdletStateContext.Consumer>
            {nerdletUrlState => (
              <MandeContainer
                launcherUrlState={launcherUrlState}
                nerdletUrlState={nerdletUrlState}
              />
            )}
          </NerdletStateContext.Consumer>
        )}
      </PlatformStateContext.Consumer>
    )
  }
}
