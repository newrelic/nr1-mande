import React from 'react'
import { startCase, uniq } from 'lodash'
import { StackItem } from 'nr1'
import FilterAttribute from './FilterAttribute'

export default class FilterStack extends React.Component {
  state = {
    loading: true,
    attributes: [],
    eventTypes: 'PageAction, MobileVideo',
  }

  getAttributes = () => {
    const { stack } = this.props
    let attributes = []

    stack.eventTypes.forEach(eventType => {
      attributes = [...attributes, ...eventType.attributes]
    })

    return uniq(attributes).sort()
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
    const { attributes, eventTypes } = this.state
    const {
      accountId,
      duration,
      attributeToggle,
      activeAttributes,
    } = this.props

    const filterItems =
      attributes &&
      attributes.map((attribute, idx) => {
        return (
          <FilterAttribute
            key={attribute + idx}
            accountId={accountId}
            attribute={attribute}
            duration={duration}
            eventTypes={eventTypes}
            attributeToggle={attributeToggle}
            activeAttributes={activeAttributes}
          />
        )
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
      const attributes = this.getAttributes()
      this.setState({ attributes })
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
