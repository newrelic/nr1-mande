import React from 'react'

const metricValue = props => {
  const getThresholdClass = (threshold, value, greenLight) => {
    const baseStyle = greenLight ? 'greenLight' : ''
    if (!threshold) return baseStyle
    if (threshold.type === 'below') {
      if (value > threshold.warning) return baseStyle
      if (value <= threshold.critical) return 'redLight'
      return 'yellowLight'
    } else {
      if (value < threshold.warning) return baseStyle
      if (value >= threshold.critical) return 'redLight'
      return 'yellowLight'
    }
  }

  const { threshold, value, minify, greenLight, decoration } = props
  const classes = ['value', getThresholdClass(threshold, value, greenLight)]

  return (
    <React.Fragment>
      <p className={classes.join(' ')}>
        {!minify && (decoration ? value + decoration : value)}
      </p>
    </React.Fragment>
  )
}

export default metricValue
