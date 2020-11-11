import React from 'react'
import { Stack } from 'nr1'
import Metric from '../../nerdlets/shared/components/metric/Metric'

const metricDashboard = props => {
  const {
    accountId,
    threshold,
    duration,
    metricDefs,
    metricCategories,
    toggleMetric,
    toggleDetails,
  } = props

  console.debug('**** metricDashboard.render')

  const getEmptyCategoryContents = title => {
    return (
      <div className="empty-state">
        <div className="empty-state-desc">
          We don't have any data yet for {title}
        </div>
      </div>
    )
  }

  const getMetricCategory = (key, category) => {
    const metrics = getMetrics(category)
    const hasMetrics = metrics && metrics.length > 0

    return (
      <Stack
        key={key}
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
        gapType={Stack.GAP_TYPE.MEDIUM}
        className="metricStack"
      >
        <div className={`metricStack__title ${!hasMetrics ? 'empty' : ''}`}>
          <div
            onClick={
              metrics && metrics.length > 0
                ? () => toggleDetails(category)
                : () => null
            }
            className="title-content"
          >
            {category}
          </div>
        </div>
        <React.Fragment>
          {hasMetrics && <div className="metric-block">{metrics}</div>}
          {!hasMetrics && getEmptyCategoryContents(category)}
        </React.Fragment>
      </Stack>
    )
  }

  const getMetrics = category => {
    const categoryMetricDefs = metricDefs.filter(
      def => category === def.category
    )

    let metrics =
      categoryMetricDefs &&
      categoryMetricDefs.map((metricDef, idx) => {
        return (
          <React.Fragment key={metricDef.def.title + idx}>
            {metricDef && (
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
                threshold={{ ...metricDef.def.threshold, showGreenLight: true }}
                showCompare={true}
                compare={{
                  difference: metricDef.difference,
                  invertCompare: metricDef.def.invertCompareTo,
                  change: metricDef.change,
                }}
                showSparkline={true}
                query={metricDef.def.query.nrql + duration.since}
                click={toggleMetric}
                visibleThreshold={threshold}
                valueAlign="left"
              />
            )}
          </React.Fragment>
        )
      })

    return metrics
  }

  // convert metricConfigs into components
  const categories = metricCategories.map((category, idx) =>
    getMetricCategory(category + idx, category)
  )

  return <div className="metric-stacks-grid">{categories}</div>
}

export default metricDashboard
