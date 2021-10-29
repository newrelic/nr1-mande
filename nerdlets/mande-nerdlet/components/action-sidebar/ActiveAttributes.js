import React from 'react'

import { StackItem, Tooltip } from 'nr1'

const selected = props => {
  const { showFacets, items, toggle } = props

  const itemList =
    items &&
    items.map((item, idx) => {
      const value = showFacets ? item : item.value
      const tooltip = showFacets ? item : `${item.attribute}: ${item.value}`
      return (
        value && (
          <div className="filter-attribute-item__selected" key={value + idx}>
            <Tooltip
              text={tooltip}
              placementType={Tooltip.PLACEMENT_TYPE.BOTTOM}
            >
              <div className="filter-attribute-item__selected value">
                {value}
              </div>
            </Tooltip>
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
