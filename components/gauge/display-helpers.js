export const generateClassName = (label) => {
  if (!label) return ''
  return `${label}`.toLowerCase().replace(/\s/g, '')
}

export const capitalize = (string) => {
  if (!string) return ''

  const str = string.toString()
  if (!str.length) return ''

  const capitalLetter = str.charAt(0).toUpperCase()

  if (str.length === 1) return capitalLetter
  return capitalLetter + str.slice(1)
}

export const getDisplayValue = (value) => {
  const minValue = 3
  if (value === 0) return value
  if (isNaN(value)) return minValue
  return Math.max(value, minValue)
}
