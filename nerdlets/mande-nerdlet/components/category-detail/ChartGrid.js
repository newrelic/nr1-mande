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
  FunnelChart,
} from 'nr1'
import { dateFormatter } from '../../../shared/utils/date-formatter'
import { formatFacets } from '../../../shared/utils/query-formatter'
import { getHook } from '../../../shared/config/Hooks'

const chartGrid = props => {
  const {
    accountId,
    duration: { since, compare, timeRange },
    filters,
    facets,
    chartDefs,
  } = props

  const formattedDuration = dateFormatter(timeRange)

  const getQuery = config => {
    let query = config.nrql
    if (config.useSince) query += since
    if (config.useCompare) query += compare
    if (filters) query += filters.single

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
            onClickBar={
              config.click ? getHook(config.click).bind(props) : () => null
            }
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
      case 'funnel':
        return <FunnelChart accountId={accountId} query={getQuery(config)} />
      case 'scatter':
        return (
          <ScatterChart
            accountId={accountId}
            query={getQuery(config)}
            onClickScatter={
              config.click ? getHook(config.click).bind(props) : () => null
            }
          />
        )
      default:
        return <LineChart accountId={accountId} query={getQuery(config)} />
    }
  }

  return (
    <ChartGroup>
      <div className="detail-grid">
        {chartDefs && (
          <Grid spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}>
            {chartDefs.map((chart, idx) => {
              return (
                <GridItem
                  key={chart.title + idx}
                  columnStart={chart.columnStart}
                  columnEnd={chart.columnEnd}
                >
                  <div className="chart-container">
                    <div className="chart-title">
                      {chart.title}
                      <div className="chart-subtitle">{formattedDuration}</div>
                      <div className="chart-title-tooltip">{chart.title}</div>
                    </div>
                    <div className={'detail-chart ' + chart.chartSize}>
                      {getChart(chart)}
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

export default chartGrid
