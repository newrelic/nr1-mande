import React from 'react'
import PropTypes from 'prop-types'
import { generateClassName, getDisplayValue } from './display-helpers'

const GaugeDataValue = props => {
  const { displayData, data, index } = props
  // Arbitrary proportion to ensure large gauges have the correct overlap
  // const overlapProportion = height / 3;
  const arrayLength = data.length
  const labelClass =
    generateClassName(displayData.label) || `${displayData.value}`
  const displayValue = getDisplayValue(displayData.value)
  const backgroundColor = displayData.visible ? displayData.color : 'white'
  const border = displayData.visible ? 'none' : '.5px solid #464e4e'
  const borderLeft = displayData.visible || index !== 0 ? 'none' : border

  return (
    <div
      className={`gaugeItem Gauge-series-${labelClass}`}
      style={{
        width: `${displayValue}%`,
        backgroundColor: `${backgroundColor}`,
        zIndex: arrayLength - index,
        borderTop: `${border}`,
        borderBottom: `${border}`,
        borderRight: `${border}`,
        borderLeft: `${borderLeft}`,
      }}
    />
  )
}

GaugeDataValue.propTypes = {
  displayData: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
}

export default GaugeDataValue
