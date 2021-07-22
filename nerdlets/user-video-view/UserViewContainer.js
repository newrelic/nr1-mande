import React from 'react'
import { Stack, StackItem, HeadingText } from 'nr1'
import { formatSinceAndCompare } from '../shared/utils/query-formatter'
import { dateFormatter } from '../shared/utils/date-formatter'
import QosKpiGrid from '../shared/components/qos/QosKpiGrid'
import { loadMetricsConfigs } from '../shared/utils/metric-config-loader'
import ViewTable from './components/view/ViewTable'

export default class UserViewContainer extends React.Component {
  state = {}

  collectViewKpis = (views, videoConfig) => {
    let kpis = []
    views.forEach(view => {

      view.kpis.forEach(k => {
        const config = videoConfig.metrics.find(m => m.id === k.defId)
        const metricName = k.defTitle
        const found = kpis.find(k => k.name === metricName)

        if (found) {
          found.viewCount += 1
          found.value += k.value
        } else {
          kpis.push({
            defId: k.defId,
            name: metricName,
            threshold: config.threshold,
            viewCount: 1,
            value: k.value,
          })
        }
      })
    })

    return kpis
  }

  async componentDidMount() {
    const { nerdletUrlState: {accountId} = {} } = this.props
    const videoConfig = await loadMetricsConfigs(accountId, 'Video')
    this.setState({videoConfig})
  }

  render() {
    const { timeRange } = this.props.launcherUrlState
    const {
      accountId,
      user,
      session,
      views,
      scope,
    } = this.props.nerdletUrlState
    const duration = formatSinceAndCompare(timeRange)
    const { videoConfig } = this.state

    return (
      <>
        {session && (
          <Stack
            fullWidth
            horizontalType={Stack.HORIZONTAL_TYPE.FILL}
            directionType={Stack.DIRECTION_TYPE.VERTICAL}
            style={{ height: '100%' }}
            className="user-view-container"
          >
            <div className="session-container">
              <StackItem className="view-header">
                <HeadingText
                  className="panel-header"
                  type={HeadingText.TYPE.HEADING_4}
                >
                  Views for Session <strong>{session.id}</strong>
                  <div className="date-header">{dateFormatter(timeRange)}</div>
                </HeadingText>
              </StackItem>

              {videoConfig ? <QosKpiGrid
                qualityScore={session.qualityScore}
                kpis={this.collectViewKpis(views, videoConfig)}
                threshold={videoConfig.qualityScore.threshold}
              /> : null}

              <div className="session-table">
                <ViewTable
                  videoConfig={videoConfig}
                  accountId={accountId}
                  duration={duration}
                  session={session}
                  views={views}
                  scope={scope}
                />
              </div>
            </div>
          </Stack>
        )}
      </>
    )
  }
}
