import React from 'react'
import { Stack, StackItem } from 'nr1'
import isEqual from 'lodash.isequal'
import ChartGrid from './ChartGrid'
import Metric from '../../../shared/components/metric/Metric'
import { loadMetricsForConfig } from '../../../shared/utils/metric-data-loader'
import { withFacetFilterContext } from '../../../shared/context/FacetFilterContext'

class CategoryDetail extends React.Component {
  state = {
    metricDefs: [],
  }

  async componentDidMount() {
    await this.loadMetricData()
    this.setupInterval()
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(this.props, nextProps)) {
      return true
    }

    if (!isEqual(this.state, nextState)) {
      return true
    }

    return false
  }

  async componentDidUpdate(prevProps) {
    if (
      !isEqual(
        prevProps.facetContext.queryFormattedFilters,
        this.props.facetContext.queryFormattedFilters
      ) ||
      prevProps.duration !== this.props.duration ||
      prevProps.stack !== this.props.stack ||
      prevProps.accountId !== this.props.accountId
    ) {
      await this.loadMetricData()
    }

    if (this.props.metricRefreshInterval !== prevProps.metricRefreshInterval) {
      clearInterval(this.interval)
      this.setupInterval(this.props.metricRefreshInterval)
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  setupInterval = () => {
    const { stack, metricRefreshInterval } = this.props
    this.interval = setInterval(async () => {
      let loadingMetrics = []
      loadingMetrics = loadingMetrics.concat(
        stack.metrics.map(metric => {
          return { def: metric, category: stack.title, loading: true }
        })
      )
      this.setState({ metricDefs: loadingMetrics })

      await this.loadMetricData()
    }, metricRefreshInterval)
  }

  loadMetricData = async () => {
    const {
      accountId,
      duration,
      stack,
      facetContext: { queryFormattedFilters },
    } = this.props
    let metricDefs = await loadMetricsForConfig(
      stack,
      duration,
      accountId,
      queryFormattedFilters
    )

    this.setState({ metricDefs })
  }

  renderMetrics = () => {
    const {
      accountId,
      duration,
      threshold,
      activeMetric,
      toggleMetric,
      facetContext: { filterQueryString },
    } = this.props
    const { metricDefs } = this.state

    const metrics =
      metricDefs &&
      metricDefs.map((metricDef, idx) => {
        return (
          <React.Fragment key={metricDef.def.title + idx}>
            {metricDef && (
              <StackItem className="detail-kpis-stack">
                <Metric
                  loading={metricDef.loading}
                  accountId={accountId}
                  metric={{
                    id: metricDef.def.title,
                    value: metricDef.value,
                    title: metricDef.def.query.title
                      ? metricDef.def.query.title
                      : metricDef.def.title,
                  }}
                  threshold={{
                    ...metricDef.def.threshold,
                    showGreenLight: false,
                  }}
                  showCompare={true}
                  compare={{
                    difference: metricDef.difference,
                    invertCompare: metricDef.def.invertCompareTo,
                    change: metricDef.change,
                  }}
                  showSparkline={true}
                  query={metricDef.def.query.nrql + duration.since}
                  selected={activeMetric === metricDef.def.title}
                  click={toggleMetric}
                  filters={filterQueryString}
                  visibleThreshold={threshold}
                  showTooltip={true}
                  valueAlign="left"
                />
              </StackItem>
            )}
          </React.Fragment>
        )
      })

    return metrics
  }

  renderDetailView = () => {
    const {
      accountId,
      duration,
      stack,
      activeMetric,
      actionMenuSelect,
    } = this.props

    let view = <div />

    if (activeMetric) {
      const metric = stack.metrics.find(m => m.title === activeMetric)
      const detailDashboardId =
        stack.detailDashboards &&
        stack.detailDashboards.find(d => d.id === metric.detailDashboardId)

      if (detailDashboardId)
        view = (
          <ChartGrid
            accountId={accountId}
            duration={duration}
            stack={stack}
            activeMetric={activeMetric}
            chartDefs={detailDashboardId.config}
            actionMenuSelect={actionMenuSelect}
          />
        )
    } else if (stack.overviewDashboard)
      view = (
        <ChartGrid
          accountId={accountId}
          duration={duration}
          chartDefs={stack.overviewDashboard}
          actionMenuSelect={actionMenuSelect}
      />
      )

    return view
  }

  render() {
    return (
      <Stack className="detail-container">
        <Stack
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          grow
          className="detail-content"
        >
          <StackItem className="detail-kpis">{this.renderMetrics()}</StackItem>
          <StackItem className="detail-main">
            {this.renderDetailView()}
          </StackItem>
        </Stack>
      </Stack>
    )
  }
}

export default withFacetFilterContext(CategoryDetail)
