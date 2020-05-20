import React from 'react'
import { Stack, StackItem, Icon } from 'nr1'
import metricConfigs from '../../config/MetricConfig'
import { Metric } from '../metric/Metric'

const CategoryMenu = props => {
  const {
    accountId,
    threshold,
    duration,
    selectedStack,
    toggleMetric,
    toggleDetails,
  } = props

  const getMetrics = config => {
    const metrics =
      config.metrics &&
      config.metrics
        .map(metric => {
          return [...Array(config.metrics)].map((_, idx) => {
            return (
              <React.Fragment key={metric.query + idx}>
                {metric.query && (
                  <li
                    className="metric minified"
                    onClick={() => toggleMetric(metric.title)}
                  >
                    <Metric
                      accountId={accountId}
                      metric={metric}
                      duration={duration}
                      threshold={threshold}
                      minify={true}
                      click={toggleMetric}
                    />
                  </li>
                )}
              </React.Fragment>
            )
          })
        })
        .reduce((arr, val) => {
          return arr.concat(val)
        }, [])

    return metrics
  }

  const renderMenuItems = () => {
    return metricConfigs.map((config, idx) => {
      const isActive = selectedStack && selectedStack.title === config.title
      const metrics = getMetrics(config)

      // metrics.forEach(metric => console.info('menu metric', metric))

      return (
        <span key={idx} className="category-menu-item-content-container">
          <Stack
            fullWidth
            className={`category-menu-item-content ${
              isActive ? 'active-menu-item' : ''
            }`}
            directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
            verticalType={Stack.VERTICAL_TYPE.CENTER}
          >
            <div
              className="category-menu-item-label"
              onClick={() => toggleDetails(config.title)}
            >
              <StackItem>{config.title}</StackItem>
            </div>
            <StackItem className="category-menu-item-right-side">
              <Stack
                verticalType={Stack.VERTICAL_TYPE.CENTER}
                className="category-menu-item-right-side-stack"
              >
                <StackItem grow>
                  <ul className="minified-metrics">{metrics && metrics}</ul>
                </StackItem>
                <StackItem>
                  <div
                    className="category-menu-item-icon"
                    onClick={() => toggleDetails(config.title)}
                  >
                    <Icon
                      type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT}
                      color={isActive ? '#007e8a' : '#B9BDBD'}
                    />
                  </div>
                </StackItem>
              </Stack>
            </StackItem>
          </Stack>
        </span>
      )
    })
  }

  return (
    <Stack
      fullHeight
      fullWidth
      className={`category-menu ${selectedStack ? 'dashboard-inactive' : ''}`}
      directionType={Stack.DIRECTION_TYPE.VERTICAL}
    >
      {selectedStack ? (
        <span
          className="category-menu-title-stack-item-container"
          onClick={() => toggleDetails(selectedStack.title)}
        >
          <StackItem className="category-menu-title-stack-item">
            <Stack
              className="category-menu-title category-menu-title-button"
              fullWidth
              directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
              verticalType={Stack.VERTICAL_TYPE.CENTER}
            >
              <StackItem fullHeight>
                <Icon
                  type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_LEFT}
                  color="#8E9494"
                />
              </StackItem>
              <StackItem>Back to dashboard</StackItem>
            </Stack>
          </StackItem>
        </span>
      ) : (
        <Stack
          className="category-menu-title"
          fullWidth
          directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
          verticalType={Stack.VERTICAL_TYPE.CENTER}
        >
          <StackItem>Currently viewing dashboard</StackItem>
        </Stack>
      )}
      <StackItem className="category-menu-items">{renderMenuItems()}</StackItem>
    </Stack>
  )
}

export default CategoryMenu
