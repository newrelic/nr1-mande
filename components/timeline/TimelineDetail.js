import React from 'react'

import { NrqlQuery } from 'nr1'
import EventStream from './EventStream'
import Timeline from '../timeline/Timeline'

export default class TimelineDetail extends React.Component {
  state = {
    sessionData: [],
    loading: true,
  }

  getData = async () => {
    const { accountId, session, durationInMinutes } = this.props

    const query = `SELECT * from PageAction, MobileVideo, RokuVideo WHERE session = '${session}' ORDER BY timestamp ASC LIMIT 1000 since ${durationInMinutes} minutes ago`
    console.info('timelineDetail.query', query)

    const { data } = await NrqlQuery.query({ accountId, query })
    console.info('timelineDetail.data', data)

    let result = []
    if (data && data.chart.length > 0) result = data.chart[0].data

    return result
  }

  async componentDidMount() {
    const data = await this.getData()
    this.setState({ sessionData: data, loading: false })
  }

  render() {
    const { sessionData, loading } = this.state
    const eventType = 'PageAction, MobileVideo, RokuVideo'
    const className = 'sessionColumn'

    return (
      <React.Fragment>
        {/* <Timeline
          accountId={accountId}
          session={session}
          eventType={eventType}
          durationInMinutes={durationInMinutes}
          className={className}
        /> */}
        <Timeline data={sessionData} loading={loading} />
        <EventStream data={sessionData} loading={loading} />
      </React.Fragment>
    )
  }
}
