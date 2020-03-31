import React from 'react'
import PropTypes from 'prop-types'
import { generateClassName, getDisplayValue } from './display-helpers'

const GaugeDataValue = props => {
  const { displayData, data, index } = props
  // Arbitrary proportion to ensure large gauges have the correct overlap
  // const overlapProportion = height / 3;
  const arrayLength = data.length
  const labelClass = generateClassName(displayData.label) || `${displayData.value}`
  const displayValue = getDisplayValue(displayData.value)

  if (!displayValue) return

  return (
    <div
      className={`gaugeItem Gauge-series-${labelClass}`}
      style={{
        width: `${displayValue}%`,
        backgroundColor: displayData.color,
        zIndex: arrayLength - index,
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
