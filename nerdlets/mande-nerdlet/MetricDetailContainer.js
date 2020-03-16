import React from 'react'

import { Stack, StackItem } from 'nr1'
import { Metric } from '../../components/metric/Metric'
import { render } from 'react-dom'

export default class MetricDetailContainer extends React.Component {
  detailView = () => {
    const { stack, activeMetric } = this.props
    if (activeMetric && stack.detailView) return stack.detailView(this.props)
    if (stack.overview) return stack.overview(this.props)
    return <div />
  }

  render() {
    const {
      stack,
      accountId,
      duration,
      threshold,
      activeMetric,
      toggleMetric,
    } = this.props

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
                    selected={activeMetric === metric.title}
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
          <StackItem className="detail-main">{this.detailView()}</StackItem>
        </Stack>
      </Stack>
    )
  }
}
