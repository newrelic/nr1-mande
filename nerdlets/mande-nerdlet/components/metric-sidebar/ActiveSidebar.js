import React from 'react'

import { StackItem } from 'nr1'
import FacetFilterContext from '../../../shared/context/FacetFilterContext'

const selected = props => {
  const { showFacets, items, toggle } = props

  const itemList =
    items &&
    items.map((item, idx) => {
      const value = showFacets ? item : item.value
      return (
        <div className="filter-attribute-item__selected" key={value + idx}>
          <div className="filter-attribute-item__selected value">{value}</div>
          {value.length > 15 && (
            <div className="filter-attribute-item__selected tooltip">
              {value}
            </div>
          )}
          <div
            className="filter-attribute-item__selected remove"
            onClick={
              showFacets
                ? () => toggle(item, false)
                : () => toggle(item.attribute, item.value, false)
            }
          >
            X
          </div>
        </div>
      )
    })

  return (
    <>
      {items && items.length > 0 && (
        <StackItem className="filter-stack selected">{itemList}</StackItem>
      )}
    </>
  )
}

export default selected
