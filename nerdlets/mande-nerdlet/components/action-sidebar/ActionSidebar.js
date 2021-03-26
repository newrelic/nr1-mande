import React from 'react'
import uniq from 'lodash.uniq'
import { Stack, StackItem } from 'nr1'
import Filter from './Filter'
import Facet from './Facet'
import ActiveAttributes from './ActiveAttributes'
import { withFacetFilterContext } from '../../../shared/context/FacetFilterContext'

class ActionSidebar extends React.Component {
  state = {
    loading: true,
    categories: new Map(),
    eventTypes: '',
    showFacetSidebar: true,
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

    return types ? types.join() : ''
  }

  componentDidMount() {
    const categories = this.getCategories()
    const eventTypes = this.getEventTypes()
    this.setState({ categories, eventTypes })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.stack !== this.props.stack) {
      const categories = this.getCategories()
      const eventTypes = this.getEventTypes()
      this.setState({ categories, eventTypes })
    }
  }

  onSidebarToggle = () => {
    const { showFacetSidebar } = this.state
    this.setState({ showFacetSidebar: !showFacetSidebar })
  }

  renderHeader = () => {
    const { showFacetSidebar } = this.state

    return (
      <div onClick={this.onSidebarToggle}>
        <Stack
          fullWidth
          directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
          verticalType={Stack.VERTICAL_TYPE.CENTER}
          gapType={Stack.GAP_TYPE.NONE}
        >
          <StackItem
            grow
            className={
              showFacetSidebar
                ? 'filter-visibility-control selected'
                : 'filter-visibility-control notSelected'
            }
          >
            Choose Facets
          </StackItem>
          <StackItem
            grow
            className={
              !showFacetSidebar
                ? 'filter-visibility-control selected'
                : 'filter-visibility-control notSelected'
            }
          >
            Choose Filters
          </StackItem>
        </Stack>
      </div>
    )
  }

  renderActiveAttributeHeader = isFacet => {
    const {
      facetContext: {
        facets,
        updateFacets,
        clearFacets,
        filters,
        updateFilters,
        clearFilters,
      },
    } = this.props

    return (
      <>
        <StackItem className="sidebar-selected-title">
          <div>{isFacet ? 'Facets' : 'Filters'}</div>
          <div
            onClick={isFacet ? clearFacets : clearFilters}
            className="clear-all"
          >
           X Clear All
          </div>
        </StackItem>
        <ActiveAttributes
          showFacets={isFacet}
          items={isFacet ? facets : filters}
          toggle={isFacet ? updateFacets : updateFilters}
        />
      </>
    )
  }

  render() {
    const { categories, eventTypes, showFacetSidebar } = this.state
    const {
      accountId,
      duration,
      facetContext: { facets, filters },
    } = this.props

    let filterItems = []
    categories.forEach((value, key) => {
      if (value && value.length > 0) {
        filterItems.push(
          <React.Fragment key={key}>
            <div className="filter-category-label">{key}</div>
            <React.Fragment>
              {showFacetSidebar &&
                value.map((attribute, idx) => {
                  return <Facet key={attribute + idx} attribute={attribute} />
                })}
              {!showFacetSidebar &&
                value.map((attribute, idx) => {
                  return (
                    <Filter
                      key={attribute + idx}
                      accountId={accountId}
                      attribute={attribute}
                      duration={duration}
                      eventTypes={eventTypes}
                    />
                  )
                })}
            </React.Fragment>
          </React.Fragment>
        )
      }
    })

    return (
      <>
        {this.renderHeader()}
        <Stack
          grow
          fullHeight
          fullWidth
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          className="detail-filter"
        >
          {facets &&
            facets.length > 0 &&
            this.renderActiveAttributeHeader(true)}
          {filters &&
            filters.length > 0 &&
            this.renderActiveAttributeHeader(false)}
          <StackItem grow className="filter-stack not-selected">
            {filterItems}
          </StackItem>
        </Stack>
      </>
    )
  }
}

export default withFacetFilterContext(ActionSidebar)
