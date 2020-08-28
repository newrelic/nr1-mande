import React from 'react'
import { Stack, StackItem, HeadingText, navigation } from 'nr1'
import SearchBar from './components/search-bar/SearchBar'
import SessionContainer from './components/session/SessionContainer'
import { formatSinceAndCompare } from '../../utils/query-formatter'

export default class FindUserContainer extends React.Component {
  state = {
    user: '',
  }

  onSelectUser = async user => {
    if (user === null) this.setState({ user })
    if (user && this.state.user !== user) this.setState({ user })
  }

  compressViews = views => {
    let compressed = []
    views.forEach(view => {
      view.details.forEach(d => {
        const viewId = view.id
        const found = compressed.find(c => c.id === viewId)

        if (found) {
          found.kpiCount += 1
          found.kpis.push({
            defId: d.def.id,
            defTitle: d.def.title,
            value: d.value,
            qualityScore: d.qualityScore,
          })
        } else {
          compressed.push({
            id: viewId,
            qualityScore: view.qualityScore,
            kpis: [
              {
                defId: d.def.id,
                defTitle: d.def.title,
                value: d.value,
                qualityScore: d.qualityScore,
              },
            ],
            kpiCount: 1,
          })
        }
      })
    })

    return compressed
  }

  onChooseSession = (item, scope) => {
    console.debug(`handleChooseSession triggered`, item, scope)

    const { accountId, user } = this.props.nerdletUrlState
    scope = scope ? scope : 'all'

    let views = []
    if (scope !== 'all') views = item[scope]

    navigation.openStackedNerdlet({
      id: 'user-video-view',
      urlState: {
        accountId: accountId,
        user: user,
        session: { id: item.session, qualityScore: item.qualityScore },
        views: this.compressViews(item.views),
        scope,
      },
    })
  }

  render() {
    console.info('**** findUserContainer.render')
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
              user={user}
              chooseSession={this.onChooseSession}
            />
          </StackItem>
        )}
      </Stack>
    )
  }
}
