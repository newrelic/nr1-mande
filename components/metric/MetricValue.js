import React from 'react'

const metricValue = props => {
  const getThresholdClass = (threshold, value) => {
    if (!threshold) return ''
    if (threshold.type === 'below') {
      if (value > threshold.warning) return ''
      if (value <= threshold.critical) return 'redLight'
      return 'yellowLight'
    } else {
      if (value < threshold.warning) return ''
      if (value >= threshold.critical) return 'redLight'
      return 'yellowLight'
    }
  }

  const { threshold, value, minify } = props
  const classes = ['value', getThresholdClass(threshold, value)]

  return (
    <React.Fragment>
      <p className={classes.join(' ')}>{!minify && value}</p>
    </React.Fragment>
  )
}

export default metricValue
