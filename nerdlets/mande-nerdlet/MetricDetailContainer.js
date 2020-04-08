import React from 'react'
import { cloneDeep } from 'lodash'
import { Stack, StackItem } from 'nr1'
import { Metric } from '../../components/metric/Metric'
import FilterStack from '../../components/metric-filter/FilterStack'
import filterFactory from '../../components/metric-filter/FilterFactory'

export default class MetricDetailContainer extends React.Component {
  state = {
    activeAttributes: [],
  }

  onAttributeToggle = (attribute, value, add) => {
    let clonedActiveAttributes = []
    if (this.state.activeAttributes)
      clonedActiveAttributes = cloneDeep(this.state.activeAttributes)

    if (add) {
      clonedActiveAttributes.push({ attribute, value })
      this.setState({ activeAttributes: clonedActiveAttributes })
      return
    }

    let updatedActiveAttributes = []
    if (!add) {
      updatedActiveAttributes = clonedActiveAttributes.filter(
        active => !(active.attribute === attribute && active.value === value)
      )
      this.setState({ activeAttributes: updatedActiveAttributes })
    }
  }

  onEventSelectorToggle = eventSelector => {
    console.log('toggled eventSelector')
  }

  detailView = filters => {
    const { stack, activeMetric } = this.props
    if (activeMetric && stack.detailView) return stack.detailView(this.props, filters)
    if (stack.overview) return stack.overview(this.props, filters)
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
    const { activeAttributes } = this.state

    const filters = filterFactory(activeAttributes)

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
                    filters={filters}
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
        <Stack
          grow
          fullHeight
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          className="detail-filter"
        >
          <FilterStack
            grow
            fullHeight
            active={true}
            activeAttributes={this.state.activeAttributes}
            attributeToggle={this.onAttributeToggle}
          />
          <FilterStack
            active={false}
            accountId={accountId}
            duration={duration}
            stack={stack}
            activeAttributes={this.state.activeAttributes}
            attributeToggle={this.onAttributeToggle}
          />
        </Stack>
        <Stack
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          grow
          className="detail-content"
        >
          <StackItem className="detail-kpis">
            <Stack fullWidth={true}>{metrics}</Stack>
          </StackItem>
          <StackItem className="detail-main">{this.detailView(filters)}</StackItem>
        </Stack>
      </Stack>
    )
  }
}
