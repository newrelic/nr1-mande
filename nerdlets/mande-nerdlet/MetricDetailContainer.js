import React from 'react'

import { Stack, StackItem } from 'nr1'
import { Metric, BlankMetric } from '../../components/metric/Metric'

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

  console.info('MetricDetailContainer metrics', metrics)
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
        <StackItem className="detail-metrics">
          <Stack fullWidth={true}>{metrics}</Stack>
        </StackItem>
        <StackItem className="detail-detail">
          {stack.detailView && stack.detailView(props)}
          {!stack.detailView && <div />}
        </StackItem>
      </Stack>
    </Stack>
  )
    // <Stack
    //   directionType={Stack.DIRECTION_TYPE.VERTICAL}
    //   gapType={Stack.GAP_TYPE.SMALL}
    //   className="detail-panel"
    // >
      // <StackItem grow className="detail-title">
      //   <span onClick={props.click} className="breadcrumb">
      //     KPIs
      //   </span>
      //   <span>></span>
      //   <span className="breadcrumb">{props.stack.title}</span>
      // </StackItem>
      // <Stack className="detail-container">
      //   <StackItem grow className="detail-filter containing">
      //     <p className="stackItem-title">FILTER PLACEHOLDER</p>
      //   </StackItem>
      //   <Stack
      //     directionType={Stack.DIRECTION_TYPE.VERTICAL}
      //     grow
      //     className="detail-content"
      //   >
      //     <StackItem className="detail-metrics containing">
      //       <Stack fullWidth={true}>{metrics}</Stack>
      //     </StackItem>
      //     <StackItem className="detail-detail containing">
      //       <p className="stackItem-title">DETAILS PLACEHOLDER</p>
      //     </StackItem>
      //   </Stack>
      // </Stack>
    // </Stack>
  
}

export default metricDetailContainer
