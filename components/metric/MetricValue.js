import React from 'react'
import PropTypes from 'prop-types'

import { getThresholdClass } from '../../utils/threshold'

const metricValue = props => {
  const { threshold, value, minify, baseStyle, decoration } = props
  const classes = ['value', getThresholdClass(threshold, value, baseStyle)]

  return (
    <React.Fragment>
      <p className={classes.join(' ')}>
        {!minify && (decoration ? value + decoration : value)}
      </p>
    </React.Fragment>
  )
}

metricValue.propTypes = {
  threshold: PropTypes.object,
  value: PropTypes.number.isRequired,
  minify: PropTypes.bool,
  baseStyle: PropTypes.string,
  decoration: PropTypes.string,
}

export default metricValue
