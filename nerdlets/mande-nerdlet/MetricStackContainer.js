import React from 'react'
import MetricStack from '../../components/metric/MetricStack'

const metricStackContainer = props => {
  const {
    accountId,
    threshold,
    duration,
    metricConfigs,
    selectedStack,
    toggleMetric,
    toggleDetails,
  } = props

  // convert metricConfigs into components
  const metricStacks = metricConfigs
    .map(config => {
      return [...Array(config)].map((_, idx) => {
        return (
          <MetricStack
            key={config.title + idx}
            config={config}
            accountId={accountId}
            threshold={threshold}
            duration={duration}
            selected={selectedStack && selectedStack.title === config.title}
            toggleMetric={toggleMetric}
            toggleDetails={toggleDetails}
          />
        )
      })
    })
    .reduce((arr, val) => {
      return arr.concat(val)
    }, [])

  return <div className="metric-stacks-grid">{metricStacks}</div>
}

export default metricStackContainer
