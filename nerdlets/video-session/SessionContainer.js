import React from 'react'
import { Grid, GridItem, HeadingText } from 'nr1'
import SessionDetail from './components/session-detail/SessionDetail'
import TimelineDetail from './components/timeline/TimelineDetail'
import videoConfig from '../shared/config/VideoConfig'
import { formatSinceAndCompare } from '../shared/utils/query-formatter'

const sessionContainer = props => {
  const { timeRange } = props.launcherUrlState
  const { accountId, session } = props.nerdletUrlState
  const duration = formatSinceAndCompare(timeRange)

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
        <SessionDetail
          accountId={accountId}
          session={session}
          stack={videoConfig}
          duration={duration}
        />
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

export default sessionContainer
