import React from 'react'
import { Grid, GridItem, HeadingText } from 'nr1'
import EventStream from '../../components/event-stream/EventStream'
import Timeline from '../../components/timeline'
import SessionDetail from '../../components/session-detail/SessionDetail'

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
        <SessionDetail accountId={accountId} session={session} stack={stack} />
      </GridItem>
      <GridItem columnSpan={8}>
        <Timeline
          accountId={accountId}
          session={session}
          eventType="PageAction, MobileVideo, RokuVideo"
          durationInMinutes={durationInMinutes}
          className="sessionColumn"
        />
        <EventStream
          accountId={accountId}
          session={session}
          eventType="PageAction, MobileVideo, RokuVideo "
          durationInMinutes={durationInMinutes}
          className="sessionColumn"
        />
      </GridItem>
    </Grid>
  )
}

export default sessionContainer
