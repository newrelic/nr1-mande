import React from 'react'
import cloneDeep from 'lodash.clonedeep'
import { formatFilters, formatFacets } from '../utils/query-formatter'

const FacetFilterContext = React.createContext()

export class FacetFilterProvider extends React.Component {
  emptyState = {
    filters: [],
    facets: [],
    queryFormattedFilters: undefined,
    queryFormattedFacets: '',
  }

  state = { ...this.emptyState }

  /**
   * Add or remove a set of filters to the filter list
   * @param {Array[object]} filterGroup
   */
  updateFilterGroup = filterGroup => {
    let clonedFilters = []

    if (this.state.filters && this.state.filters.length > 0) {
      clonedFilters = cloneDeep(this.state.filters)
    }

    let foundCount = 0
    const totalFilters = filterGroup.length
    filterGroup.forEach(filter => {
      const found = clonedFilters.find(
        cloned =>
          filter.name === cloned.attribute && filter.value === cloned.value
      )
      if (found) {
        foundCount++
        filter.found = true
      }
    })

    // if all filters are present, this is a remove action
    filterGroup.forEach(filter => {
      if (foundCount === totalFilters) {
        clonedFilters = clonedFilters.filter(
          cloned =>
            !(cloned.attribute === filter.name && cloned.value === filter.value)
        )
      } else {
        if (!filter.found) { // only add missing ones
          clonedFilters.push({ attribute: filter.name, value: filter.value })
        }
      }
    })

    const formatted = formatFilters(clonedFilters)
    this.setState({
      filters: clonedFilters,
      queryFormattedFilters: formatted,
    })
  }

  /**
   * Add or remove a single filter value to the filter list
   * @param {String} attribute
   * @param {String} value
   */
  updateFilters = (attribute, value) => {
    let clonedFilters = []

    if (this.state.filters && this.state.filters.length > 0) {
      clonedFilters = cloneDeep(this.state.filters)
    }

    let add = true
    if (clonedFilters && clonedFilters.length > 0)
      add = !clonedFilters.find(
        filter => filter.attribute === attribute && filter.value === value
      )

    if (add) clonedFilters.push({ attribute, value })
    else
      clonedFilters = clonedFilters.filter(
        active => !(active.attribute === attribute && active.value === value)
      )

    this.setState({
      filters: clonedFilters,
      queryFormattedFilters: formatFilters(clonedFilters),
    })
  }

  updateFacets = attribute => {
    let clonedFacets = [...this.state.facets]

    let add = true
    if (clonedFacets && clonedFacets.length > 0)
      add = !clonedFacets.find(facet => {
        const found = facet === attribute
        return found
      })

    if (add) clonedFacets.push(attribute)
    else clonedFacets = clonedFacets.filter(cloned => cloned !== attribute)

    this.setState({
      facets: clonedFacets,
      queryFormattedFacets: formatFacets(clonedFacets),
    })
  }

  clearFacets = () => this.setState({ facets: [], queryFormattedFacets: '' })

  clearFilters = () => this.setState({ filters: [], queryFormattedFilters: undefined })

  reset = () => this.setState({ ...this.emptyState })

  render() {
    const { children } = this.props

    return (
      <FacetFilterContext.Provider
        value={{
          ...this.state,
          updateFilters: this.updateFilters,
          updateFilterGroup: this.updateFilterGroup,
          updateFacets: this.updateFacets,
          clearFacets: this.clearFacets,
          clearFilters: this.clearFilters,
          reset: this.reset,
        }}
      >
        {children}
      </FacetFilterContext.Provider>
    )
  }
}

export const FacetFilterConsumer = FacetFilterContext.Consumer
export default FacetFilterContext

export const withFacetFilterContext = WrappedComponent => {
  return React.forwardRef((props, ref) => {
    return (
      <FacetFilterConsumer>
        {value => (
          <WrappedComponent facetContext={value} {...props} ref={ref} />
        )}
      </FacetFilterConsumer>
    )
  })
}
