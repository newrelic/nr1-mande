import React from 'react'
import startCase from 'lodash.startcase'
import { Checkbox } from 'nr1'
import { withFacetFilterContext } from '../../../shared/context/FacetFilterContext'

const facet = props => {
  const {
    facetContext: { facets, updateFacets },
    attribute,
  } = props
  const displayName = startCase(attribute)
  const isSelected =
    facets && facets.find(facet => facet === attribute) !== undefined

  return (
    <div className="filter-category-section">
      <div className="filter-category-section-header">
        <h5 className="facet-category-section-label">
          <span className="filter-attribute-checkbox">
            <Checkbox
              checked={isSelected}
              className="filter-attribute-checkbox-input"
              onChange={() => updateFacets(attribute, !isSelected)}
            />
          </span>
          <span
            className="facet-category-section-label-text"
            onClick={() => updateFacets(attribute, !isSelected)}
          >
            {displayName}
          </span>
        </h5>
      </div>
    </div>
  )
}

export default withFacetFilterContext(facet)
