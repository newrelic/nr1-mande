import React from 'react'

import { Stack, StackItem } from 'nr1'
import { Metric } from '../../components/metric/Metric'

const metricDetailContainer = props => {
  const {
    stack,
    accountId,
    duration,
    threshold,
    activeMetric,
    toggleMetric,
  } = props

  let selectedDetail = null

  const metrics =
    stack.metrics &&
    stack.metrics
      .map(metric => {
        return [...Array(stack.metrics)].map((_, idx) => {
          const selected = activeMetric === metric.title
          if (selected) selectedDetail = metric.detailView

          return (
            <React.Fragment key={metric.title + idx}>
              {metric.query && (
                <Metric
                  accountId={accountId}
                  metric={metric}
                  duration={duration}
                  threshold={threshold}
                  selected={selected}
                  click={toggleMetric}
                />
              )}
            </React.Fragment>
          )
        })
      })
      .reduce((arr, val) => {
        return arr.concat(val)
      }, [])

  const detailView = () => {
    if (selectedDetail) return selectedDetail(props)
    if (stack.detailView) return stack.detailView(props)
    return <div />
  }
  
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
          {detailView()}
          {/* {stack.detailView && stack.detailView(props)}
          {!stack.detailView && <div />} */}
        </StackItem>
      </Stack>
    </Stack>
  )
}

export default metricDetailContainer
