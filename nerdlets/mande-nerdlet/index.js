import React from 'react'
import {
  PlatformStateContext,
  NerdletStateContext,
  nerdlet,
  NerdGraphQuery,
  Spinner,
} from 'nr1'
import MandeContainer from './MandeContainer'
import { FacetFilterProvider } from '../shared/context/FacetFilterContext'
import descriptor from '../../nr1.json'

export default class Wrapper extends React.Component {
  async componentDidMount() {
    nerdlet.setConfig({
      accountPicker: true,
    })
  }

  render() {
    const uuid = descriptor.id
    const query = `{
      actor {
        nerdpacks {
          nerdpack(id: "${uuid}") {
            accountId
          }
        }
      }
    }`

    return (
      <PlatformStateContext.Consumer>
        {launcherUrlState => (
          <NerdGraphQuery query={query}>
            {({ loading, error, data }) => {
              if (loading) {
                return <Spinner />
              }

              if (error) {
                return (
                  <div className="empty-state">
                    <div className="empty-state-header">An Error Occurred</div>
                    <div className="empty-state-desc">
                      Sorry, an error occurred while loading the nerdpack:
                    </div>
                    <div>{error}</div>
                  </div>
                )
              }

              if (data) {
                if (
                  data.actor.nerdpacks.nerdpack.accountId === launcherUrlState.accountId
                ) {
                  return (
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
                  )
                } else {
                  return (
                    <div className="empty-state">
                      <div className="empty-state-header">Access Denied</div>
                      <div className="empty-state-desc">
                        Sorry, the selected account doesn't have access to this
                        nerdpack.
                      </div>
                    </div>
                  )
                }
              } else {
                return (
                  <div className="empty-state">
                    <div className="empty-state-desc">
                      We weren't able to load the data
                    </div>
                  </div>
                )
              }
            }}
          </NerdGraphQuery>
        )}
      </PlatformStateContext.Consumer>
    )
  }
}
