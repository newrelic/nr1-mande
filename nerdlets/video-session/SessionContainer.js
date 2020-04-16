import React from 'react'
import { Grid, GridItem, HeadingText } from 'nr1'
import SessionDetail from '../../components/session-detail/SessionDetail'
import TimelineDetail from '../../components/timeline/TimelineDetail'
import { formatSinceAndCompare } from '../../utils/query-formatter'

const sessionContainer = props => {
  const { timeRange } = props.launcherUrlState
  const { accountId, session, stack } = props.nerdletUrlState

  const duration = formatSinceAndCompare(timeRange)

  return (
    <Grid>
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
          stack={stack}
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
