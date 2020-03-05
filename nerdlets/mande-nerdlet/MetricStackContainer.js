import React from 'react'
import { Stack, navigation } from 'nr1'
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

  return (
    <Stack
      fullWidth={true}
      directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
      horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY}
    >
      {metricStacks}
    </Stack>
  )
}

export default metricStackContainer
