import React from 'react'
import { Stack, StackItem, Link } from 'nr1'
import { Metric, BlankMetric } from '../metric/Metric'

const metricDashboard = props => {
  const {
    accountId,
    threshold,
    duration,
    metricConfigs,
    toggleMetric,
    toggleDetails,
  } = props

  const getMetricCategory = (key, config) => {
    const metrics = getMetrics(config)
    return (
      <Stack
        key={key}
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
        gapType={Stack.GAP_TYPE.MEDIUM}
        className="metricStack"
      >
        <StackItem className={'metricStack__title'}>
          <div
            onClick={() => toggleDetails(config.title)}
            className="title-content"
          >
            {config.title}
          </div>
        </StackItem>
        <div className="metric-block">
          {!metrics ? (
            <StackItem>
              <div></div>
            </StackItem>
          ) : (
            metrics
          )}
        </div>
      </Stack>
    )
  }

  const getMetrics = config => {
    let metrics =
      config.metrics &&
      config.metrics
        .map(metric => {
          return [...Array(config.metrics)].map((_, idx) => {
            return (
              <React.Fragment key={metric.title + idx}>
                {metric.query && (
                  <StackItem className="metric maximized">
                    <Metric
                      accountId={accountId}
                      metric={metric}
                      duration={duration}
                      threshold={threshold}
                      minify={false}
                      click={toggleMetric}
                    />
                  </StackItem>
                )}
              </React.Fragment>
            )
          })
        })
        .reduce((arr, val) => {
          return arr.concat(val)
        }, [])

    if (!metrics && threshold === 1)
      metrics = (
        <React.Fragment>
          <StackItem className={'metric maximized'}>
            <BlankMetric minified={false} />
          </StackItem>
        </React.Fragment>
      )

    return metrics
  }

  // convert metricConfigs into components
  const metricCategories = metricConfigs
    .map(config => {
      return [...Array(config)].map((_, idx) => {
        return getMetricCategory(config.title + idx, config)
      })
    })
    .reduce((arr, val) => {
      return arr.concat(val)
    }, [])

  return <div className="metric-stacks-grid">{metricCategories}</div>
}

export default metricDashboard
