import React from 'react'
import { Stack, StackItem, Icon } from 'nr1'
import Metric from '../../../shared/components/metric/Metric'

const CategoryMenu = props => {
  const {
    threshold,
    metricDefs,
    metricCategories,
    selectedStack,
    toggleMetric,
    toggleDetails,
  } = props

  const getMetrics = category => {
    const categoryMetricDefs = metricDefs.filter(
      def => category === def.category
    )

    const metrics =
      categoryMetricDefs &&
      categoryMetricDefs.map((metricDef, idx) => {
        return (
          <React.Fragment key={metricDef.def.title + idx}>
            {metricDef && (
              <li>
                <Metric
                  loading={metricDef.loading}
                  minify={true}
                  metric={{
                    id: metricDef.def.title,
                    value: metricDef.value,
                    title: metricDef.def.title,
                  }}
                  threshold={{...metricDef.def.threshold}}
                  showCompare={true}
                  compare={{
                    difference: metricDef.difference,
                    invertCompare: metricDef.def.invertCompareTo,
                    change: metricDef.change,
                  }}
                  click={toggleMetric}
                  visibleThreshold={threshold}
                />
              </li>
            )}
          </React.Fragment>
        )
      })

    return metrics
  }

  const renderMenuItems = () => {
    return metricCategories.map((category, idx) => {
      const isActive = selectedStack && selectedStack.title === category
      const metrics = getMetrics(category)
      const hasMetrics = metrics && metrics.length > 0

      return (
        <span key={idx} className="category-menu-item-content-container">
          <Stack
            fullWidth
            className={`category-menu-item-content ${
              isActive ? 'active-menu-item' : !hasMetrics ? 'empty' : ''
            }`}
            directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
            verticalType={Stack.VERTICAL_TYPE.CENTER}
          >
            <div
              className={`category-menu-item-label ${
                !hasMetrics ? 'empty' : ''
              }`}
              onClick={hasMetrics ? () => toggleDetails(category) : () => null}
            >
              <StackItem>{category}</StackItem>
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
                    className={`category-menu-item-icon ${
                      !hasMetrics ? 'empty' : ''
                    }`}
                    onClick={
                      hasMetrics ? () => toggleDetails(category) : () => null
                    }
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
