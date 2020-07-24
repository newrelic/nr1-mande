import React from 'react'
import { Stack, StackItem, HeadingText } from 'nr1'
import SearchBar from './components/search-bar/SearchBar'
import SessionContainer from './components/session/SessionContainer'
import { formatSinceAndCompare } from '../../utils/query-formatter'

export default class FindUserContainer extends React.Component {
  state = {
    user: '',
  }

  onSelectUser = async user => {
    if (this.state.user !== user) this.setState({ user })
  }

  onChooseSession = (item, scope) => {
    scope = scope ? scope : 'all'
    console.info(`handleChooseSession triggered`, item, scope)
  }

  render() {
    const { user } = this.state
    const { timeRange } = this.props.launcherUrlState
    const { accountId } = this.props.nerdletUrlState
    const duration = formatSinceAndCompare(timeRange)

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
          <StackItem style={{ height: '100%' }}>
            <SessionContainer
              accountId={accountId}
              duration={duration}
              user={this.state.user}
              chooseSession={this.onChooseSession}
            />
          </StackItem>
        )}
      </Stack>
    )
  }
}
