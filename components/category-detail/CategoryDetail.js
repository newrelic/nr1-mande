import React from 'react'
import { Stack, StackItem } from 'nr1'
import { isEqual } from 'lodash'
import { Metric } from '../metric/Metric'
import ChartGrid from './ChartGrid'
import { loadMetricsForConfig } from '../../utils/metric-data-loader'

export default class CategoryDetail extends React.Component {
  state = {
    metricDefs: [],
  }

  loadMetricData = async () => {
    console.debug('>>>> categoryDetail.loadMetricData')

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
    const { accountId, duration, stack, activeMetric } = this.props
    let view = <div />
    if (activeMetric) {
      const metric = stack.metrics.filter(m => m.title === activeMetric)
      const detailConfig = metric[0].detailConfig

      if (detailConfig)
        view = (
          <ChartGrid
            accountId={accountId}
            duration={duration}
            stack={stack}
            activeMetric={activeMetric}
            filters={filters}
            facets={facetClause}
            chartDefs={detailConfig}
          />
        )
    } else if (stack.overviewConfig)
      view = (
        <ChartGrid
          accountId={accountId}
          duration={duration}
          filters={filters}
          facets={facetClause}
          chartDefs={stack.overviewConfig}
        />
      )

    console.debug('categoryDetail.detailView view', view)
    return view
  }

  async componentDidMount() {
    console.debug('**** categoryDetail.componentDidMount')

    await this.loadMetricData()

    const { stack, metricRefreshInterval } = this.props
    this.interval = setInterval(async () => {
      console.debug('**** categoryDetail.interval reset metrics to loading')

      let loadingMetrics = []
      loadingMetrics = loadingMetrics.concat(
        stack.metrics.map(metric => {
          return { def: metric, category: stack.title, loading: true }
        })
      )

      this.setState({ metricDefs: loadingMetrics })

      console.debug('**** categoryDetail.interval reset metrics to loaded')
      await this.loadMetricData()
    }, metricRefreshInterval)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(this.props, nextProps)) {
      console.debug('**** categoryDetail.componentShouldUpdate props mismatch')
      return true
    }

    if (!isEqual(this.state, nextState)) {
      console.debug('**** categoryDetail.componentShouldUpdate state mismatch')
      return true
    }

    return false
  }

  async componentDidUpdate(prevProps) {
    console.debug('**** categoryDetail.componentDidUpdate')

    if (
      !isEqual(prevProps.activeFilters, this.props.activeFilters) ||
      prevProps.duration !== this.props.duration ||
      prevProps.stack !== this.props.stack ||
      prevProps.accountId !== this.props.accountId
    ) {
      console.debug(
        '**** categoryDetail.componentDidUpdate triggering data refresh'
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

    console.debug('**** categoryDetail.render')

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
