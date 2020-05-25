import React from 'react'
import { startCase, uniq } from 'lodash'
import { StackItem } from 'nr1'
import Filter from './Filter'
import Facet from './Facet'

export default class MetricSidebar extends React.Component {
  state = {
    loading: true,
    categories: new Map(),
    eventTypes: '',
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

  getEventTypes = () => {
    const { stack } = this.props
    const types =
      stack.eventTypes &&
      stack.eventTypes.reduce((acc, eventType) => {
        if (eventType.event !== 'Global') acc.push(eventType.event)
        return acc
      }, [])

    return types.join()
  }

  // placeholder in case we need to present the underlying event type as a selectable attribute. on hold.
  // getEventSelectors = () => {
  //   const { stack } = this.props
  //   let attributes = []
  //   let count = 0 // placeholder - do we want to not display eventSelectors if there's one event?

  //   stack.eventTypes.forEach(eventType => {
  //     if (eventType.eventSelector) {
  //       attributes = [...attributes, eventType.eventSelector.attribute]
  //       count++
  //     }
  //   })

  //   return uniq(attributes).sort
  // }

  componentDidMount() {
    const { active } = this.props
    if (!active) {
      const categories = this.getCategories()
      const eventTypes = this.getEventTypes()
      console.info('eventTypes', eventTypes)
      this.setState({ categories, eventTypes })
    }
  }

  render() {
    const { categories, eventTypes } = this.state
    const { accountId, duration, toggle, selected, showFacets } = this.props

    let filterItems = []
    categories.forEach((value, key) => {
      if (value && value.length > 0) {
        filterItems.push(
          <React.Fragment key={key}>
            <div className="filter-category-label">{key}</div>
            <React.Fragment>
              {showFacets &&
                value.map((attribute, idx) => {
                  return (
                    <Facet
                      key={attribute + idx}
                      attribute={attribute}
                      facetToggle={toggle}
                      activeFacets={selected}
                    />
                  )
                })}
              {!showFacets &&
                value.map((attribute, idx) => {
                  return (
                    <Filter
                      key={attribute + idx}
                      accountId={accountId}
                      attribute={attribute}
                      duration={duration}
                      eventTypes={eventTypes}
                      attributeToggle={toggle}
                      activeAttributes={selected}
                    />
                  )
                })}
            </React.Fragment>
          </React.Fragment>
        )
      }
    })

    return (
      <StackItem grow className="filter-stack not-selected">
        {filterItems}
      </StackItem>
    )
  }
}
