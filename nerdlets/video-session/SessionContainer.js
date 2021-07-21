import React from 'react'
import { Grid, GridItem, HeadingText } from 'nr1'
import SessionDetail from './components/session-detail/SessionDetail'
import TimelineDetail from './components/timeline/TimelineDetail'
import { loadMetricsConfigs } from '../shared/utils/metric-config-loader'
import { formatSinceAndCompare } from '../shared/utils/query-formatter'

export default class sessionContainer extends React.Component {
  state = {}

  async componentDidMount() {
    const { nerdletUrlState: {accountId} = {} } = this.props
    const videoConfig = await loadMetricsConfigs(accountId, 'Video')
    this.setState({videoConfig})
  }

  render() {
    const { timeRange } = this.props.launcherUrlState
    const { accountId, session } = this.props.nerdletUrlState
    const duration = formatSinceAndCompare(timeRange)
    const { videoConfig } = this.state

    return (
      <Grid style={{ paddingLeft: '1rem' }}>
        <GridItem columnSpan={12}>
          <header className="header">
            <HeadingText type={HeadingText.TYPE.HEADING_3}>
              View Id {session}
            </HeadingText>
          </header>
        </GridItem>
        <GridItem columnSpan={4} className="sessionColumn">
          {videoConfig ? <SessionDetail
            accountId={accountId}
            session={session}
            stack={videoConfig}
            duration={duration}
          /> : null}
        </GridItem>
        <GridItem columnSpan={8}>
          <TimelineDetail
            accountId={accountId}
            session={session}
            duration={duration}
          />
        </GridItem>
      </Grid>
    )
  }
}
