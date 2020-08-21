import React from 'react'
import { Stack, StackItem, HeadingText } from 'nr1'
import SearchBar from './components/search-bar/SearchBar'
import SessionContainer from './components/session/SessionContainer'
import ViewContainer from './components/view/ViewContainer'
import { formatSinceAndCompare } from '../../utils/query-formatter'

export default class FindUserContainer extends React.Component {
  state = {
    user: '',
    session: null,
  }

  onSelectUser = async user => {
    if (user === null) this.setState({ user, session: null })
    if (user && this.state.user !== user) this.setState({ user })
  }

  onChooseSession = (item, scope) => {
    scope = scope ? scope : 'all'
    let views = []
    console.info(`handleChooseSession triggered`, item, scope)
    if (scope !== 'all') views = item[scope]

    this.setState({ session: { session: item, filter: views, scope } })
  }

  onClearSession = () => {
    console.info('findUserContainer.clearSession triggered')
    this.setState({ session: null })
  }

  render() {
    console.info('**** findUserContainer.render')
    const { user, session } = this.state
    const { timeRange } = this.props.launcherUrlState
    const { accountId } = this.props.nerdletUrlState
    const duration = formatSinceAndCompare(timeRange)

    console.info('>>>> findUserContainer.render session', session)

    return (
      <Stack
        fullWidth
        horizontalType={Stack.HORIZONTAL_TYPE.FILL}
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
        className="find-user-container"
      >
        <StackItem>
          <header className="nerdlet-header">
            <HeadingText type={HeadingText.TYPE.HEADING_3}>
              User Session Analysis
            </HeadingText>
          </header>
        </StackItem>

        <StackItem>
          <SearchBar
            accountId={accountId}
            duration={duration}
            selectUser={this.onSelectUser}
          />
        </StackItem>

        {!user && (
          <StackItem className="empty-state-container">
            <div className="empty-state">
              <HeadingText
                className="empty-state-header"
                type={HeadingText.TYPE.HEADING_3}
              >
                Search for a user to start
              </HeadingText>
              <div className="empty-state-desc">
                To get started, please search for and select an id in the search
                bar above
              </div>
            </div>
          </StackItem>
        )}

        {user && (
          <React.Fragment>
            {!session && (
              <StackItem style={{ height: '100%' }}>
                <SessionContainer
                  accountId={accountId}
                  duration={duration}
                  user={user}
                  chooseSession={this.onChooseSession}
                />
              </StackItem>
            )}

            {session && (
              <StackItem style={{ height: '100%' }}>
                <ViewContainer
                  accountId={accountId}
                  duration={duration}
                  user={user}
                  selected={session}
                  clearSession={this.onClearSession}
                />
              </StackItem>
            )}
          </React.Fragment>
        )}
      </Stack>
    )
  }
}
