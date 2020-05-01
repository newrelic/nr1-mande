import React from 'react'

import { ChartGroup, AreaChart, LineChart, Grid, GridItem } from 'nr1'
import { dateFormatter } from '../../utils/date-formatter'

const videoOverview = props => {
  const {
    accountId,
    duration: { since, compare, timeRange },
    filters,
    facets,
  } = props

  const formattedDuration = dateFormatter(timeRange)

  const timingsNrql =
    `SELECT filter(average(timeSinceLoad), WHERE actionName = 'CONTENT_REQUEST') as 'Time to Content Request', 
     average(timeSinceLoad) as 'Time to Player Ready',
     filter(average(timeSinceRequested)/1000, WHERE actionName='CONTENT_START') as 'Time To First Frame'
     FROM PageAction TIMESERIES` + since
  const countsNrql =
    `SELECT filter(count(*), WHERE actionName = 'CONTENT_REQUEST') as 'Total Requests', 
    filter(count(*), WHERE actionName = 'CONTENT_START') as 'Total Starts' 
    FROM PageAction TIMESERIES` + since
  const videoErrorsNrql =
    `SELECT filter(count(*), WHERE actionName = 'CONTENT_ERROR') / filter(count(*), WHERE actionName = 'CONTENT_REQUEST') as 'Video Errors', 
    filter(count(*), WHERE actionName = 'CONTEN_ERROR' and contentPlayhead = 0) AS 'Failures Before Start' FROM PageAction, MobileVideo, RokuVideo TIMESERIES` +
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
            <div className="chart-subtitle">{formattedDuration}</div>
          </div>
          <div className="detail-chart medium">{chart}</div>
        </div>
      </GridItem>
    )
  }

  const addFiltersAndFacets = query => {
    if (filters) query += filters.single
    if (facets) query += `FACET ${facets}`

    // console.info('videoOverview.query', query)
    return query
  }

  return (
    <div className="detail-grid">
      <Grid spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}>
        <ChartGroup>
          {addChart(
            6,
            'Content Request vs Player Ready vs Video Start (Average in Seconds)',
            <AreaChart
              accountId={accountId}
              query={addFiltersAndFacets(timingsNrql)}
            />
          )}
          {addChart(
            6,
            'Total Requests vs Total Starts',
            <LineChart
              accountId={accountId}
              query={addFiltersAndFacets(countsNrql)}
            />
          )}
          {addChart(
            4,
            'Video Errors and Failures Before Start',
            <AreaChart
              accountId={accountId}
              query={addFiltersAndFacets(videoErrorsNrql)}
            />
          )}
          {addChart(
            4,
            'Rebuffer Ratio',
            <AreaChart
              accountId={accountId}
              query={addFiltersAndFacets(rebufferNrql)}
            />
          )}
          {addChart(
            4,
            'Interruption Ratio',
            <AreaChart
              accountId={accountId}
              query={addFiltersAndFacets(interruptionNrql)}
            />
          )}
        </ChartGroup>
      </Grid>
    </div>
  )
}

export default videoOverview
