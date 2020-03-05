import React from 'react'

import { Stack, StackItem } from 'nr1'
import { Metric } from '../../components/metric/Metric'

const metricDetailContainer = props => {
  const { stack, accountId, duration, threshold } = props

  const metrics =
    stack.metrics &&
    stack.metrics
      .map(metric => {
        return [...Array(stack.metrics)].map((_, idx) => {
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

  return (
    <Stack className="detail-container">
      <StackItem grow className="detail-filter">
        <p className="stackItem-title">FILTER PLACEHOLDER</p>
      </StackItem>
      <Stack
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
        grow
        className="detail-content"
      >
        <StackItem className="detail-kpis">
          <Stack fullWidth={true}>{metrics}</Stack>
        </StackItem>
        <StackItem className="detail-main">
          {stack.detailView && stack.detailView(props)}
          {!stack.detailView && <div />}
        </StackItem>
      </Stack>
    </Stack>
  )
}

export default metricDetailContainer
