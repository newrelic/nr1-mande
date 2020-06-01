import React from 'react'
import { Stack, StackItem, Link } from 'nr1'
import { Metric, BlankMetric } from '../metric/Metric'

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

  const getMetricCategory = (key, category) => {
    const metrics = getMetrics(category)
    return (
      <Stack
        key={key}
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
        gapType={Stack.GAP_TYPE.MEDIUM}
        className="metricStack"
      >
        <div className={'metricStack__title'}>
          <div
            onClick={() => toggleDetails(category)}
            className="title-content"
          >
            {category}
          </div>
        </div>
        <div className="metric-block">{!metrics ? <div /> : metrics}</div>
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
                classes="metric maximized"
                accountId={accountId}
                metric={metricDef}
                duration={duration}
                threshold={threshold}
                minify={false}
                click={toggleMetric}
              />
            )}
          </React.Fragment>
        )
      })

    if (!metrics && threshold === 1)
      metrics = (
        <React.Fragment>
          <StackItem className={'metric maximized'}>
            <BlankMetric minified={false} />
          </StackItem>
        </React.Fragment>
      )

    return metrics
  }

  // convert metricConfigs into components
  const categories = metricCategories.map((category, idx) =>
    getMetricCategory(category + idx, category)
  )

  return <div className="metric-stacks-grid">{categories}</div>
}

export default metricDashboard
