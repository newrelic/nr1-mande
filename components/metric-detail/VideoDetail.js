import React from 'react'

import { AreaChart, PieChart, Stack, StackItem } from 'nr1'

const metricDetail = props => {
  const { accountId, duration } = props

  const since = ` SINCE ${duration} MINUTES AGO`
  const compare = ` COMPARE WITH ${duration} MINUTES AGO`

  const timeToFirstFrame =
    `SELECT filter(average(timeSinceRequested)/1000, WHERE actionName='CONTENT_START') as 'Seconds To First Frame', 
    filter(count(*), WHERE actionName = 'CONTENT_REQUEST') as 'Total Requests' FROM PageAction TIMESERIES` +
    since

  const genericQuery =
    'SELECT count(*) FROM PageAction FACET actionName' + since

  console.info('timeToFirstFrame', timeToFirstFrame)

  return (
    <Stack directionType={Stack.DIRECTION_TYPE.HORIZONTAL} fullWidth={true}>
      <StackItem className="chart-container">
        <AreaChart
          className="detail-chart"
          accountId={accountId}
          query={timeToFirstFrame}
        />
      </StackItem>
      <StackItem className="chart-container">
        <PieChart
          className="detail-chart pie-chart"
          accountId={accountId}
          query={genericQuery}
        />
      </StackItem>
    </Stack>
  )
}

export default metricDetail
