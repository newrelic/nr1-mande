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

  updateFilters = (attribute, value, add) => {
    let clonedFilters = []

    if (this.state.filters) clonedFilters = cloneDeep(this.state.filters)
    if (add) {
      clonedFilters.push({ attribute, value })
      this.setState({
        filters: clonedFilters,
        queryFormattedFilters: formatFilters(clonedFilters),
      })
      return
    }

    let updatedFilters = []
    if (!add) {
      updatedFilters = clonedFilters.filter(
        active => !(active.attribute === attribute && active.value === value)
      )
      this.setState({
        filters: updatedFilters,
        queryFormattedFilters: formatFilters(updatedFilters),
      })
    }
  }

  updateFacets = (attribute, add) => {
    const clonedFacets = [...this.state.facets]

    if (add) {
      clonedFacets.push(attribute)
      this.setState({
        facets: clonedFacets,
        queryFormattedFacets: formatFacets(clonedFacets),
      })
      return
    }

    let updatedFacets = []
    if (!add) {
      updatedFacets = clonedFacets.filter(cloned => cloned !== attribute)
      this.setState({
        facets: updatedFacets,
        queryFormattedFacets: formatFacets(updatedFacets),
      })
    }
  }

  reset = () => this.setState({ ...this.emptyState })

  render() {
    const { children } = this.props

    return (
      <FacetFilterContext.Provider
        value={{
          ...this.state,
          updateFilters: this.updateFilters,
          updateFacets: this.updateFacets,
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
