import React from 'react'
import PropTypes from 'prop-types'
import { generateClassName, capitalize } from './display-helpers'

const GaugeDataLegendItem = props => {
  const { legend, click } = props
  const timelineDisplay = legend.group.timelineDisplay

  const labelClass = generateClassName(timelineDisplay.label)
  const capitalizedLabel = capitalize(timelineDisplay.label)

  return (
    <div
      key={labelClass}
      className={`Gauge-legend-item Gauge-legend-item--${labelClass}`}
      onClick={() => click(legend)}
    >
      <div
        className={
          legend.visible
            ? 'Gauge-legend-item-dot'
            : 'Gauge-legend-item-dot hidden'
        }
        style={
          legend.visible
            ? { backgroundColor: timelineDisplay.color }
            : { backgroundColor: 'white' }
        }
      />
      {capitalizedLabel}
    </div>
  )
}

GaugeDataLegendItem.propTypes = {
  legend: PropTypes.object.isRequired,
}

export default GaugeDataLegendItem
