export const getThresholdClass = (threshold, value, baseStyle) => {
  baseStyle = baseStyle ? baseStyle : ''
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
