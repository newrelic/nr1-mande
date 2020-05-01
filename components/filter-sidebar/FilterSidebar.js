import React from 'react'
import { Stack, StackItem, Icon } from 'nr1'
import { startCase } from 'lodash'
import sampleFilters from './sample-filters.json'

class FilterSidebar extends React.PureComponent {
  constructor(props) {
    super(props)
  }

  renderFilterCategory(category) {
    return Object.keys(sampleFilters[category][0]).map(filter => {
      const currentFilter = sampleFilters[category][0][filter][0]
      return (
        <li className="individual-filter" key={currentFilter.value}>
          <input type="checkbox" checked={currentFilter.active} />
          <span className="individual-filter-label">{currentFilter.label}</span>
        </li>
      )
    })
  }
  renderCategories() {
    const categories = Object.keys(sampleFilters).map(
      (filterCategory, index) => {
        return (
          <li className="filter-category-container">
            <ul className="filter-category">
              <li className="filter-cateogry-label">
                {startCase(filterCategory)}
              </li>
              {renderFilterCategory(filterCategory)}
            </ul>
          </li>
        )
      }
    )

    return <ul className="filter-categories">{categories}</ul>
  }

  renderFiltersSection() {
    return <div className="filters-container">{renderCategories()}</div>
  }

  render() {
    const { selectedStack } = this.props
    return (
      <Stack fullHeight fullWidth directionType={Stack.DIRECTION_TYPE.VERTICAL}>
        {selectedStack ? (
          <span onClick={() => toggleDetails(selectedStack.title)}>
            <StackItem className="filter-visiblity-control-container">
              <Stack
                fullWidth
                directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
                verticalType={Stack.VERTICAL_TYPE.CENTER}
                className="filter-visibility-control"
              >
                <StackItem>Hide Filters</StackItem>
                <StackItem fullHeight>
                  <Icon
                    type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT}
                    color="#8E9494"
                  />
                </StackItem>
              </Stack>
            </StackItem>
          </span>
        ) : (
          <Stack
            fullWidth
            directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
            verticalType={Stack.VERTICAL_TYPE.CENTER}
            className="filter-visibility-control"
          >
            <StackItem>Show filters</StackItem>
          </Stack>
        )}
        <StackItem className="filters-container-stack-item">
          <div className="filters-container">
            <div className="filter-categories">
              <h6 className="filter-category-label">Platform</h6>
              <div className="filter-category-section active">
                <h5 className="filter-category-section-label">
                  <span className="filter-category-section-label-text">
                    App Name
                  </span>
                  <Icon
                    type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_BOTTOM__SIZE_8}
                    color="#8E9494"
                  />
                </h5>
                <ul className="filter-category-section-filters">
                  <li className="individual-filter">
                    <input type="checkbox" id="gpt-sample" />
                    <label className="individual-filter-label" for="gpt-sample">
                      GPT Sample
                    </label>
                  </li>
                  <li className="individual-filter">
                    <input type="checkbox" id="video-sample" />
                    <label
                      className="individual-filter-label"
                      for="video-sample"
                    >
                      Video Sample
                    </label>
                  </li>
                  <li className="individual-filter">
                    <input type="checkbox" id="gpt-sample-checkbox" />
                    <label
                      className="individual-filter-label"
                      for="gpt-sample-checkbox"
                    >
                      Example Sample
                    </label>
                  </li>
                </ul>
              </div>
              <div className="filter-category-section">
                <h5 className="filter-category-section-label">
                  <span className="filter-category-section-label-text">
                    Device Type
                  </span>
                  <Icon
                    type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_BOTTOM__SIZE_8}
                    color="#8E9494"
                  />
                </h5>
                <ul className="filter-category-section-filters">
                  <li className="individual-filter">
                    <input type="checkbox" id="gpt-sample" />
                    <label className="individual-filter-label" for="gpt-sample">
                      GPT Sample
                    </label>
                  </li>
                  <li className="individual-filter">
                    <input type="checkbox" id="video-sample" />
                    <label
                      className="individual-filter-label"
                      for="video-sample"
                    >
                      Video Sample
                    </label>
                  </li>
                  <li className="individual-filter">
                    <input type="checkbox" id="gpt-sample-checkbox" />
                    <label
                      className="individual-filter-label"
                      for="gpt-sample-checkbox"
                    >
                      Example Sample
                    </label>
                  </li>
                </ul>
              </div>
              <div className="filter-category-section">
                <h5 className="filter-category-section-label">
                  <span className="filter-category-section-label-text">
                    User Agent Name
                  </span>
                  <Icon
                    type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_BOTTOM__SIZE_8}
                    color="#8E9494"
                  />
                </h5>
                <ul className="filter-category-section-filters">
                  <li className="individual-filter">
                    <input type="checkbox" id="gpt-sample" />
                    <label className="individual-filter-label" for="gpt-sample">
                      GPT Sample
                    </label>
                  </li>
                  <li className="individual-filter">
                    <input type="checkbox" id="video-sample" />
                    <label
                      className="individual-filter-label"
                      for="video-sample"
                    >
                      Video Sample
                    </label>
                  </li>
                  <li className="individual-filter">
                    <input type="checkbox" id="gpt-sample-checkbox" />
                    <label
                      className="individual-filter-label"
                      for="gpt-sample-checkbox"
                    >
                      Example Sample
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </StackItem>
      </Stack>
    )
  }
}

export default FilterSidebar
