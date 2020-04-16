import React from 'react'
import { uniq } from 'lodash'
import {
  Grid,
  GridItem,
  ChartGroup,
  AreaChart,
  ScatterChart,
  LineChart,
  BillboardChart,
  BarChart,
  HeatmapChart,
  HistogramChart,
  PieChart,
  navigation,
} from 'nr1'
import { dateFormatter } from '../../utils/date-formatter'
import { formatFacets } from '../../utils/query-formatter'

const videoDetail = props => {
  const {
    accountId,
    duration: { since, compare, timeRange },
    stack,
    activeMetric,
    filters,
    facets,
  } = props

  const formattedDuration = dateFormatter(timeRange)

  const clicks = [
    {
      name: 'openSession',
      handler: ({ data, metadata }) => {
        console.debug('data and metadata on click', data, metadata)

        navigation.openStackedNerdlet({
          id: 'video-session',
          urlState: {
            accountId,
            session: metadata.name,
            stack: stack,
          },
        })
      },
    },
  ]

  const getClick = name => {
    const click = clicks.filter(c => c.name === name)[0]
    if (!click) return () => {}
    else return click.handler
  }

  const getQuery = config => {
    let query = config.nrql
    if (config.useSince) query += since
    if (config.useCompare) query += compare
    if (filters) query += filters

    if (!config.noFacet) {
      if (config.facets && facets) query += `FACET ${getDedupedFacets(config)}`
      else {
        if (facets) query += `FACET ${facets}`
        if (config.facets) query += `FACET ${config.facets}`
      }
    }

    console.debug('videoDetail.query', query)
    return query
  }

  const getDedupedFacets = config => {
    let allFacets = []

    if (config.facets) allFacets = config.facets.split(',')
    if (facets) allFacets = allFacets.concat(facets.split(','))
    const formattedFacets = formatFacets(uniq(allFacets))

    return formattedFacets
  }

  const getChart = config => {
    switch (config.chartType) {
      case 'area':
        return <AreaChart accountId={accountId} query={getQuery(config)} />
      case 'bar':
        return (
          <BarChart
            accountId={accountId}
            query={getQuery(config)}
            onClickBar={getClick(config.click)}
          />
        )
      case 'billboard':
        // if (facets) return <PieChart accountId={accountId} query={getQuery(config)} />
        // else
        return <BillboardChart accountId={accountId} query={getQuery(config)} />
      case 'heatmap':
        return <HeatmapChart accountId={accountId} query={getQuery(config)} />
      case 'histogram':
        return <HistogramChart accountId={accountId} query={getQuery(config)} />
      case 'billboard':
        return <BillboardChart accountId={accountId} query={getQuery(config)} />
      case 'pie':
        return <PieChart accountId={accountId} query={getQuery(config)} />
      case 'line':
        return <LineChart accountId={accountId} query={getQuery(config)} />
      case 'scatter':
        return (
          <ScatterChart
            accountId={accountId}
            query={getQuery(config)}
            onClickScatter={getClick(config.click)}
          />
        )
      default:
        return <LineChart accountId={accountId} query={getQuery(config)} />
    }
  }

  const metric = stack.metrics.filter(m => m.title === activeMetric)
  const detailConfig = metric[0].detailConfig

  return (
    <ChartGroup>
      <div className="detail-grid">
        {detailConfig && (
          <Grid>
            {detailConfig.map((config, idx) => {
              return (
                <GridItem
                  key={config.title + idx}
                  columnStart={config.columnStart}
                  columnEnd={config.columnEnd}
                >
                  <div className="chart-container">
                    <div className="chart-title">
                      {config.title}
                      <div className="chart-subtitle">{formattedDuration}</div>
                    </div>
                    <div className={'detail-chart ' + config.chartSize}>
                      {getChart(config)}
                    </div>
                  </div>
                </GridItem>
              )
            })}
          </Grid>
        )}
      </div>
    </ChartGroup>
  )
}

export default videoDetail
