import React, { Component } from 'react'
import PropTypes from 'prop-types'

import _ from 'lodash'
import { Dropdown, DropdownItem, Stack, StackItem } from 'nr1'

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

  proportionateValues = data => {
    const { height } = this.props
    const totalValue = data.reduce((acc, { value }) => {
      acc += value
      return acc
    }, 0)

    return data.map(({ value, label, color }, index) => {
      const displayColor = color || this.generateColor(index, data.length)
      const proportionateValue = (value * 100) / totalValue
      return { value: proportionateValue, label, color: displayColor, height }
    })
  }

  generateColor = (size, scale) => {
    const { hue } = this.props
    const defaultSaturation = 70
    const defaultMinLightness = 25
    const lightnessRange = 70

    const lightnessScale = Math.round(lightnessRange / scale)
    const appliedLightness = defaultMinLightness + size * lightnessScale
    return `hsl(${hue},${defaultSaturation}%,${appliedLightness}%)`
  }

  renderTimeAxis(data) {
    const numberOfAxisValues = 12
    const desiredAxisItems = [...Array(numberOfAxisValues).keys()]

    const timeValues = data.map(d => d.timeSinceLoad)
    const maxTime = Math.ceil(timeValues[timeValues.length - 1])
    const intervalSize = maxTime / numberOfAxisValues

    const timeAxisValues = desiredAxisItems.map(a => (a + 1) * intervalSize)
    return timeAxisValues
  }

  render() {
    const { data, height, showLegend, legend, legendClick } = this.props
    const displayData = this.proportionateValues(data, height)
    const timeAxisValues = this.renderTimeAxis(data)

    return (
      <div className="Gauge">
        <Stack
          className="gaugeHeader"
          fullWidth
          verticalType={Stack.VERTICAL_TYPE.CENTER}
        >
          <StackItem grow>
            <h4>Session breakdown</h4>
          </StackItem>
        </Stack>

        <div className="Gauge-gauge" style={{ height: height }}>
          {displayData &&
            displayData.map((display, idx) => {
              return (
                <GaugeDataValue
                  key={idx + display.label}
                  index={idx}
                  displayData={display}
                  data={data}
                />
              )
            })}
        </div>

        <Stack
          directionType={Stack.DIRECTION_TYPE.HORIZONTAL_TYPE}
          verticalType={Stack.VERTICAL_TYPE.CENTER}
          className="gaugeTimeline"
        >
          <StackItem className="gaugeTimelineItem" key={0}>
            {0}
          </StackItem>
          {timeAxisValues.map((v, index) => {
            return (
              <StackItem className="gaugeTimelineItem" shrink key={v}>
                {v}
              </StackItem>
            )
          })}
        </Stack>

        {showLegend && (
          <div className="Gauge-legend">
            {legend.length > 0 &&
              legend.map((item, idx) => {
                return (
                  <GaugeDataLegendItem
                    key={idx + item.group.name}
                    legend={item}
                    click={legendClick}
                  />
                )
              })}
          </div>
        )}
      </div>
    )
  }
}
