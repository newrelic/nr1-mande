import React from 'react'
import { Stack, StackItem, HeadingText } from 'nr1'
import SearchBar from './components/search-bar/SearchBar'
import SessionContainer from './components/session/SessionContainer'
import { loadMetricsConfigs } from '../shared/utils/metric-config-loader'
import { formatSinceAndCompare } from '../shared/utils/query-formatter'
import {
  openUserVideoViews,
  openVideoSession,
} from '../shared/utils/navigation'

export default class FindUserContainer extends React.Component {
  state = {
    user: '',
  }

  async componentDidMount() {
    const { nerdletUrlState: {accountId} = {} } = this.props
    const videoConfig = await loadMetricsConfigs(accountId, 'Video')
    this.setState({videoConfig})
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
    const { accountId, user } = this.props.nerdletUrlState
    const { videoConfig } = this.state
    scope = scope ? scope : 'all'

    if (item.views.length === 1) {
      openVideoSession(accountId, item.views[0].id, (videoConfig || {}).title)
    } else {
      openUserVideoViews(
        accountId,
        user,
        { id: item.session, qualityScore: item.qualityScore },
        this.compressViews(item.views),
        scope
      )
    }
  }

  render() {
    const { user } = this.state
    const { timeRange } = this.props.launcherUrlState
    const { accountId } = this.props.nerdletUrlState
    const duration = formatSinceAndCompare(timeRange)
    const { videoConfig } = this.state

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
              videoConfig={videoConfig}
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
