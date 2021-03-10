import React from 'react'
import { PlatformStateContext, NerdletStateContext, nerdlet } from 'nr1'
import MandeContainer from './MandeContainer'

export default class Wrapper extends React.Component {
  componentDidMount() {
    nerdlet.setConfig({
      accountPicker: true,
    })
  }

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
