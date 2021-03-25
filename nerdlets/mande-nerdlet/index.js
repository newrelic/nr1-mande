import React from 'react'
import { PlatformStateContext, NerdletStateContext, nerdlet } from 'nr1'
import MandeContainer from './MandeContainer'
import { FacetFilterProvider } from '../shared/context/FacetFilterContext'

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
              <FacetFilterProvider>
                <MandeContainer
                  launcherUrlState={launcherUrlState}
                  nerdletUrlState={nerdletUrlState}
                />
              </FacetFilterProvider>
            )}
          </NerdletStateContext.Consumer>
        )}
      </PlatformStateContext.Consumer>
    )
  }
}
