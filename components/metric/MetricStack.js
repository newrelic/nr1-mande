import React from 'react'
import { Stack, StackItem, Link } from 'nr1'
import { Metric, BlankMetric } from './Metric'

const metricStack = props => {
  const { config, accountId, duration, threshold } = props

  let metrics =
    config.metrics &&
    config.metrics
      .map(metric => {
        return [...Array(config.metrics)].map((_, idx) => {
          return (
            <React.Fragment key={metric.title + idx}>
              {metric.query && (
                <Metric
                  accountId={accountId}
                  metric={metric}
                  duration={duration}
                  threshold={threshold}
                />
              )}
            </React.Fragment>
          )
        })
      })
      .reduce((arr, val) => {
        return arr.concat(val)
      }, [])

  if (!metrics && threshold === 'All')
    metrics = (
      <React.Fragment>
        <StackItem className="metric">
          <BlankMetric />
        </StackItem>
      </React.Fragment>
    )

  return (
    <React.Fragment>
      <Stack
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
        gapType={Stack.GAP_TYPE.MEDIUM}
        className="metricStack"
      >
        <StackItem className="metric title">
          {config.navigateTo && (
            <span>
              <Link to={config.navigateTo}>{config.title}</Link>
            </span>
          )}
          {!config.navigateTo && config.title}
        </StackItem>
        {metrics}
      </Stack>
    </React.Fragment>
  )
}

export default metricStack
