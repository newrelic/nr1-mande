import React from 'react'
import { startCase, uniq } from 'lodash'
import { StackItem } from 'nr1'
import FilterCategory from './FilterCategory'

export default class FilterStack extends React.Component {
  state = {
    loading: true,
    categories: new Map(),
    eventTypes: 'PageAction, MobileVideo, RokuVideo',
  }

  getCategories = () => {
    const { stack } = this.props
    let categories = new Map()

    stack.eventTypes &&
      stack.eventTypes.forEach(eventType => {
        eventType.attributes.forEach(attribute => {
          const category = attribute[1]
          const name = attribute[0]

          if (categories.get(category)) {
            categories.get(category).push(name)
          } else {
            categories.set(category, [name])
          }
        })

        for (let [key, value] of categories) {
          const attributes = uniq(value).sort()
          categories.set(key, attributes)
        }
      })

    return categories
  }

  getEventSelectors = () => {
    const { stack } = this.props
    let attributes = []
    let count = 0 // placeholder - do we want to not display eventSelectors if there's one event?

    stack.eventTypes.forEach(eventType => {
      if (eventType.eventSelector) {
        attributes = [...attributes, eventType.eventSelector.attribute]
        count++
      }
    })

    return uniq(attributes).sort
  }

  getActive() {
    const { activeAttributes, attributeToggle } = this.props

    const activeItems =
      activeAttributes &&
      activeAttributes.map((active, idx) => {
        return (
          <div
            className="filter-attribute active"
            key={active.attribute + active.value + idx}
          >
            <div
              className="filter-attribute-item"
              onClick={() =>
                attributeToggle(active.attribute, active.value, false)
              }
            >
              <span>{startCase(active.attribute)}</span>
              <span className="divider">:</span>
              <span className="filter-attribute-value active">
                {active.value}
              </span>
            </div>
          </div>
        )
      })

    return (
      <StackItem className="filter-stack active">
        <div className="filter-title">Active Filters</div>
        {activeItems}
      </StackItem>
    )
  }

  getAvailable() {
    const { categories, eventTypes } = this.state
    const {
      accountId,
      duration,
      attributeToggle,
      activeAttributes,
      facets,
      facetToggle,
    } = this.props

    let filterItems = []
    categories.forEach((value, key) => {
      if (value && value.length > 0) {
        filterItems.push(
          <FilterCategory
            key={key}
            accountId={accountId}
            title={key}
            attributes={value}
            duration={duration}
            eventTypes={eventTypes}
            attributeToggle={attributeToggle}
            activeAttributes={activeAttributes}
            facets={facets}
            facetToggle={facetToggle}
          />
        )
      }
    })

    return (
      <StackItem className="filter-stack inactive">
        <div className="filter-title">Available Filters</div>
        {filterItems}
      </StackItem>
    )
  }

  componentDidMount() {
    const { active } = this.props
    if (!active) {
      const categories = this.getCategories()
      this.setState({ categories })
    }
  }

  render() {
    const { active } = this.props

    return (
      <React.Fragment>
        {active && this.getActive()}
        {!active && this.getAvailable()}
      </React.Fragment>
    )
  }
}
