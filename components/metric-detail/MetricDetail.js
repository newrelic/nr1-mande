import React from 'react'
import { cloneDeep } from 'lodash'
import { Stack, StackItem } from 'nr1'
import { Metric } from '../metric/Metric'
import FilterStack from '../metric-filter/FilterStack'
import { formatFilters, formatFacets } from '../../utils/query-formatter'

export default class MetricDetail extends React.Component {
  state = {
    activeAttributes: [],
    facets: [],
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

  onFacetToggle = (attribute, add) => {
    const clonedFacets = [...this.state.facets]

    if (add) {
      clonedFacets.push(attribute)
      debugger
      this.setState({ facets: clonedFacets })
      return
    }

    let updatedFacets = []
    if (!add) {
      updatedFacets = clonedFacets.filter(cloned => cloned !== attribute)
      debugger
      this.setState({ facets: updatedFacets })
    }
  }

  onEventSelectorToggle = eventSelector => {
    console.log('toggled eventSelector')
  }

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
    } = this.props
    const { activeAttributes, facets } = this.state

    const filters = formatFilters(activeAttributes)
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
