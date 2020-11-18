import React from 'react'
import startCase from 'lodash.startcase'
import { Checkbox } from 'nr1'

const facet = props => {
  const { attribute, facetToggle, activeFacets } = props

  const displayName = startCase(attribute)

  const selected =
    activeFacets &&
    activeFacets.find(facet => facet === attribute) !== undefined

  return (
    <div className="filter-category-section">
      <div className="filter-category-section-header">
        <h5 className="facet-category-section-label">
          <span className="filter-attribute-checkbox">
            <Checkbox
              checked={selected}
              className="filter-attribute-checkbox-input"
              onChange={() => facetToggle(attribute, !selected)}
            />
          </span>
          <span
            className="facet-category-section-label-text"
            onClick={() => facetToggle(attribute, !selected)}
          >
            {displayName}
          </span>
        </h5>
      </div>
    </div>
  )
}

export default facet
