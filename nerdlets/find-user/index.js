import React from 'react'
import { PlatformStateContext, NerdletStateContext } from 'nr1'
import FindUserContainer from './FindUserContainer'

export default class Wrapper extends React.Component {
  render() {
    return (
      <PlatformStateContext.Consumer>
        {launcherUrlState => (
          <NerdletStateContext.Consumer>
            {nerdletUrlState => (
              <FindUserContainer
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
