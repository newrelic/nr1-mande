import React from 'react'
import { Stack, StackItem, HeadingText } from 'nr1'
import SearchBarContainer from './SearchBarContainer'
import { formatSinceAndCompare } from '../../utils/query-formatter'

export default class FindUserContainer extends React.Component {
  state = {
    user: '',
  }

  onSelectUser = async => {}

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
          <header className="header">
            <HeadingText type={HeadingText.TYPE.HEADING_3}>
              User Session Analysis
            </HeadingText>
          </header>
        </StackItem>

        <StackItem>
          <SearchBarContainer accountId={accountId} duration={duration} />
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
                To get started, please search for and select an id in the
                search bar above
              </div>
            </div>
          </StackItem>
        )}
      </Stack>
    )
  }
}
