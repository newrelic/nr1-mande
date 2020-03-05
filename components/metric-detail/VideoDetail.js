import React from 'react'

import { AreaChart, PieChart, Grid, GridItem } from 'nr1'
import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format'
momentDurationFormatSetup(moment)

const metricDetail = props => {
  const { accountId, duration } = props

  const since = ` SINCE ${duration} MINUTES AGO`
  const compare = ` COMPARE WITH ${duration} MINUTES AGO`

  const timingsNrql =
    `SELECT filter(average(timeSinceLoad), WHERE actionName = 'CONTENT_REQUEST') as 'Time to Content Request', 
     average(timeSinceLoad) as 'Time to Player Ready',
     filter(average(timeSinceRequested)/1000, WHERE actionName='CONTENT_START') as 'Time To First Frame'
     FROM PageAction TIMESERIES` + since
  const countsNrql =
    `SELECT filter(count(*), WHERE actionName = 'CONTENT_REQUEST') as 'Total Requests', 
    filter(count(*), WHERE actionName = 'CONTENT_START') as 'Total Starts' 
    FROM PageAction TIMESERIES` + since
  const videoStartFailureNrql =
    `SELECT count(*) AS 'Failures Before Start' FROM PageAction, MobileVideo, RokuVideo  WHERE actionName = 'CONTEN_ERROR' and contentPlayhead = 0 TIMESERIES` +
    since
  const rebufferNrql =
    `SELECT filter(sum(timeSinceBufferBegin), WHERE actionName = 'CONTENT_BUFFER_END' and isInitialBuffering = 0) / filter(sum(playtimeSinceLastEvent), WHERE contentPlayhead is not null) as 'Rebuffer Ratio' FROM PageAction, MobileVideo, RokuVideo TIMESERIES` +
    since
  const interruptionNrql =
    `SELECT filter(count(*), where actionName = 'CONTENT_BUFFER_START') / filter(count(*), where actionName = 'CONTENT_START') AS 'Interruption Ratio' FROM PageAction, MobileVideo, RokuVideo TIMESERIES` +
    since

  const addChart = (colSpans, title, chart) => {
    return (
      <GridItem columnSpan={colSpans}>
        <div className="chart-container">
          <div className="chart-title">
            {title}
            <div className="chart-subtitle">Since {duration} minutes ago</div>
          </div>
          <div className="detail-chart">{chart}</div>
        </div>
      </GridItem>
    )
  }

  return (
    <div className="detail-grid">
      <Grid>
        {addChart(
          6,
          'Content Request vs Player Ready vs Video Start (Average in Seconds)',
          <AreaChart accountId={accountId} query={timingsNrql} />
        )}
        {addChart(
          6,
          'Total Requests vs Total Starts',
          <AreaChart accountId={accountId} query={countsNrql} />
        )}
        {addChart(
          4,
          'Video Failures Before Start',
          <AreaChart accountId={accountId} query={videoStartFailureNrql} />
        )}
        {addChart(
          4,
          'Rebuffer Ratio',
          <AreaChart accountId={accountId} query={rebufferNrql} />
        )}
        {addChart(
          4,
          'Interruption Ratio',
          <AreaChart accountId={accountId} query={interruptionNrql} />
        )}
      </Grid>
    </div>
  )
}

export default metricDetail
