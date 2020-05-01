import React from 'react'
import { Stack, StackItem, Icon } from 'nr1'
import metricConfigs from '../../config/MetricConfig'

const CategoryMenu = ({ selectedStack, toggleDetails }) => {
  const renderMenuItems = () => {
    return metricConfigs.map(metric => {
      const isActive = selectedStack && selectedStack.title === metric.title
      return (
        <span
          onClick={() => toggleDetails(metric.title)}
          className="category-menu-item-content-container"
        >
          <Stack
            fullWidth
            className={`category-menu-item-content ${
              isActive ? 'active-menu-item' : ''
            }`}
            directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
            verticalType={Stack.VERTICAL_TYPE.CENTER}
          >
            <StackItem className="category-menu-item-label">
              {metric.title}
            </StackItem>
            <StackItem className="category-menu-item-right-side">
              <Stack
                verticalType={Stack.VERTICAL_TYPE.CENTER}
                className="category-menu-item-right-side-stack"
              >
                <StackItem>
                  <ul className="minified-metrics">
                    <li className="minified-metric yellow"></li>
                    <li className="minified-metric red"></li>
                  </ul>
                </StackItem>
                <StackItem>
                  <Icon
                    type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT}
                    color={isActive ? '#007e8a' : '#B9BDBD'}
                  />
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
