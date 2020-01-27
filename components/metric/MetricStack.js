import React from 'react'
import { BillboardChart, Stack, StackItem, Link } from 'nr1'
import Metric from './Metric'

const metricStack = props => {
  const { config } = props
  const since = ` SINCE ${props.duration} MINUTES AGO`
  const compare = ` COMPARE WITH ${props.duration} MINUTES AGO`

  const metrics = config.metrics
    .map(metric => {
      return [...Array(config.metrics)].map((_, idx) => {
        // return <metric key={metric.title + idx} title={metric.title} value={metric.value} />
        return (
          <React.Fragment key={metric.title + idx}>
            {metric.query && (
              <StackItem className="metric">
                <Metric
                  accountId={props.accountId}
                  metric={metric}
                  duration={props.duration}
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
