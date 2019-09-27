import React, {Component} from 'react'
import PropTypes from 'prop-types'

import GaugeDataLegendItem from './GaugeDataLegendItem'
import GaugeDataValue from './GaugeDataValue'

export default class Gauge extends Component {
  static propTypes = {
    /**
     * A list of data to be rendered:
     *
     * [{value, label, color}]
     */
    data: PropTypes.array.isRequired,
    /**
     * The height of the gauge in pixels
     */
    height: PropTypes.number,
    /**
     * The starting color of the gauge:
     *
     * Find the hue of any rgb or hex string using
     * [HSL selector](http://hslpicker.com).
     */
    hue: PropTypes.number,
    /**
     * To show, or not to show?
     *
     * That is the question.
     */
    showLegend: PropTypes.bool,
  }

  static defaultProps = {
    height: 15,
    hue: 193,
    showLegend: true,
  }

  proportionateValues = (data) => {
    const { height } = this.props
    const totalValue = data.reduce((acc, {value}) => {
      acc += value
      return acc
    }, 0)

    return data.map(({value, label, color}, index) => {
      const displayColor = color || this.generateColor(index, data.length)
      const proportionateValue = value * 100 / totalValue
      return { value: proportionateValue, label, color: displayColor, height }
    })
  }

  generateColor = (size, scale) => {
    const { hue } = this.props
    const defaultSaturation = 70
    const defaultMinLightness = 25
    const lightnessRange = 70

    const lightnessScale = Math.round(lightnessRange / scale)
    const appliedLightness = defaultMinLightness + (size * lightnessScale)
    return `hsl(${hue},${defaultSaturation}%,${appliedLightness}%)`
  }

  render () {
    const { data, height, showLegend } = this.props
    const displayData = this.proportionateValues(data, height)

    return (
      <div className="Gauge">
        <div className="Gauge-gauge" style={{height: height}}>
          {displayData.map(GaugeDataValue)}
        </div>
        { showLegend &&
          <div className="Gauge-legend">
            {displayData.map(GaugeDataLegendItem)}
          </div>
        }
      </div>
    )
  }
}
