import React from 'react'

import { StackItem } from 'nr1'

const selected = props => {
  const { showFacets, selected, toggle } = props

  const activeItems =
    selected &&
    selected.map((item, idx) => {
      const value = showFacets ? item : item.value
      return (
        <div className="filter-attribute-item__selected" key={value + idx}>
          <div className="filter-attribute-item__selected value">{value}</div>
          {!showFacets && <div className="filter-attribute-item__selected tooltip">{value}</div>}
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
    <React.Fragment>
      {activeItems && activeItems.length > 0 && (
        <StackItem className="filter-stack selected">{activeItems}</StackItem>
      )}
    </React.Fragment>
  )
}

export default selected
