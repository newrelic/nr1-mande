import React from 'react'
import FilterAttribute from './FilterAttribute'

const filterCategory = props => {
  const {
    accountId,
    duration,
    title,
    attributes,
    attributeToggle,
    activeAttributes,
    eventTypes,
    facets,
    facetToggle,
  } = props

  const filterAttributes =
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
          faceted={facets.includes(attribute)}
          facetToggle={facetToggle}
        />
      )
    })

  return (
    <React.Fragment>
      <div className="filter-category">{title}</div>
      {filterAttributes}
    </React.Fragment>
  )
}

export default filterCategory
