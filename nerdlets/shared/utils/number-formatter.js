
export const roundToTwoDigits = value => {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export const defaultTo = (num, def) =>
  typeof num === 'number' && isFinite(num) ? num : def
