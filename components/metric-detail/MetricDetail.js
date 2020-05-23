import React from 'react'
import { cloneDeep } from 'lodash'
import { Stack, StackItem } from 'nr1'
import { Metric } from '../metric/Metric'
import FilterStack from '../metric-sidebar/MetricSidebar'
import { formatFilters, formatFacets } from '../../utils/query-formatter'

export default class MetricDetail extends React.Component {

  detailView = (filters, facetClause) => {
    const { stack, activeMetric } = this.props
    if (activeMetric && stack.detailView)
      return stack.detailView(this.props, filters, facetClause)
    if (stack.overview) return stack.overview(this.props, filters, facetClause)
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
      activeFilters,
      facets,
    } = this.props

    const filters = formatFilters(activeFilters)
    const facetClause = formatFacets(facets)

    const metrics =
      stack.metrics &&
      stack.metrics
        .map(metric => {
          return [...Array(stack.metrics)].map((_, idx) => {
            return (
              <React.Fragment key={metric.title + idx}>
                {metric.query && (
                  <StackItem className="metric maximized">
                    <Metric
                      accountId={accountId}
                      metric={metric}
                      duration={duration}
                      threshold={threshold}
                      selected={activeMetric === metric.title}
                      click={toggleMetric}
                      filters={filters}
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
      <Stack className="detail-container">
        <Stack
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          grow
          className="detail-content"
        >
          <StackItem className="detail-kpis">{metrics}</StackItem>
          <StackItem className="detail-main">
            {this.detailView(filters, facetClause)}
          </StackItem>
        </Stack>
      </Stack>
    )
  }
}
