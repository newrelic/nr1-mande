import React from 'react'

const eventSelector = props => {
  return (
    <div className="filter-item">
      <span className="filter-item-name">{displayName}</span>
      <span className="filter-item-toggle">
        <Icon type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_BOTTOM} />
      </span>
    </div>
  )
}

export default eventSelector
