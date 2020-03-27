import React from 'react'
import { Grid, GridItem, HeadingText } from 'nr1'
import SessionDetail from '../../components/session-detail/SessionDetail'
import TimelineDetail from '../../components/timeline/TimelineDetail'

const sessionContainer = props => {
  const {
    timeRange: { duration },
  } = props.launcherUrlState

  const { accountId, session, stack } = props.nerdletUrlState

  const durationInMinutes = duration / 1000 / 60

  return (
    <Grid>
      <GridItem columnSpan={12}>
        <header className="header">
          <HeadingText type={HeadingText.TYPE.HEADING_3}>
            Viewing Session {session}
          </HeadingText>
        </header>
      </GridItem>
      <GridItem columnSpan={4} className="sessionColumn">
        <SessionDetail
          accountId={accountId}
          session={session}
          stack={stack}
          duration={durationInMinutes}
        />
      </GridItem>
      <GridItem columnSpan={8}>
        <TimelineDetail
          accountId={accountId}
          session={session}
          durationInMinutes={durationInMinutes}
        />
      </GridItem>
    </Grid>
  )
}

export default sessionContainer
