import React from 'react'

import {
  Grid,
  GridItem,
  AreaChart,
  ScatterChart,
  LineChart,
  BillboardChart,
  BarChart,
  HeatmapChart,
  navigation,
} from 'nr1'
import { dateFormatter } from '../../utils/date-formatter'

const videoDetail = props => {
  const { accountId, duration, stack, activeMetric, filters } = props
  const since = ` SINCE ${duration} MINUTES AGO`
  const compare = ` COMPARE WITH ${duration} MINUTES AGO`
  const formattedDuration = dateFormatter(duration)

  const clicks = [
    {
      name: 'openSession',
      handler: ({ data, metadata }) => {
        console.log('data and metadata on click', data, metadata)

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

    console.info('videoDetail.query', query)
    return query
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
        return <BillboardChart accountId={accountId} query={getQuery(config)} />
      case 'heatmap':
        return <HeatmapChart accountId={accountId} query={getQuery(config)} />
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
                    <div className="chart-subtitle">
                      Since {formattedDuration} ago
                    </div>
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
  )
}

export default videoDetail
