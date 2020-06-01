import React from 'react'
import { Stack, StackItem } from 'nr1'
import { isEqual } from 'lodash'
import { Metric } from '../metric/Metric'
import { loadMetricsForConfig } from '../../utils/metric-data-loader'

export default class MetricDetail extends React.Component {
  state = {
    metricDefs: [],
  }

  loadMetricData = async () => {
    console.debug('>>>> metricDetail.loadMetricData')

    const { accountId, duration, stack, activeFilters } = this.props
    let metricDefs = await loadMetricsForConfig(
      stack,
      duration,
      accountId,
      activeFilters
    )

    this.setState({ metricDefs })
  }
  detailView = (filters, facetClause) => {
    const { stack, activeMetric } = this.props
    if (activeMetric && stack.detailView)
      return stack.detailView(this.props, filters, facetClause)
    if (stack.overview) return stack.overview(this.props, filters, facetClause)
    return <div />
  }

  async componentDidMount() {
    console.debug('**** metricDetail.componentDidMount')

    await this.loadMetricData()

    const { stack, metricRefreshInterval } = this.props
    this.interval = setInterval(async () => {
      console.debug('**** metricDetail.interval reset metrics to loading')

      let loadingMetrics = []
      loadingMetrics = loadingMetrics.concat(
        stack.metrics.map(metric => {
          return { def: metric, category: stack.title, loading: true }
        })
      )

      this.setState({ metricDefs: loadingMetrics })

      console.debug('**** metricDetail.interval reset metrics to loaded')
      await this.loadMetricData()
    }, metricRefreshInterval)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(this.props, nextProps)) {
      console.debug('**** metricDetail.componentShouldUpdate props mismatch')
      return true
    }

    if (!isEqual(this.state, nextState)) {
      console.debug('**** metricDetail.componentShouldUpdate state mismatch')
      return true
    }

    return false
  }

  async componentDidUpdate(prevProps) {
    console.debug('**** metricDetail.componentDidUpdate')

    if (
      !isEqual(prevProps.activeFilters, this.props.activeFilters) ||
      prevProps.duration !== this.props.duration ||
      prevProps.stack !== this.props.stack ||
      prevProps.accountId !== this.props.accountId
    ) {
      console.debug(
        '**** metricDetail.componentDidUpdate triggering data refresh'
      )
      await this.loadMetricData()
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    const {
      accountId,
      duration,
      threshold,
      activeMetric,
      toggleMetric,
      activeFilters,
      facets,
    } = this.props
    const { metricDefs } = this.state

    console.debug('**** metricDetail.render')

    const metrics =
      metricDefs &&
      metricDefs.map((metricDef, idx) => {
        return (
          <React.Fragment key={metricDef.def.title + idx}>
            {metricDef && (
              <StackItem className="metric maximized">
                <Metric
                  accountId={accountId}
                  metric={metricDef}
                  duration={duration}
                  threshold={threshold}
                  selected={activeMetric === metricDef.def.title}
                  click={toggleMetric}
                  filters={activeFilters}
                />
              </StackItem>
            )}
          </React.Fragment>
        )
      })

    return (
      <Stack className="detail-container">
        <Stack
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          grow
          className="detail-content"
        >
          <StackItem className="detail-kpis">{metrics}</StackItem>
          <StackItem className="detail-main">
            {this.detailView(activeFilters, facets)}
          </StackItem>
        </Stack>
      </Stack>
    )
  }
}
