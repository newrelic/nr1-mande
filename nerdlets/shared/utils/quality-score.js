import { roundToTwoDigits, defaultTo } from './number-formatter'

export const metricQualityScore = (metric, threshold, strategy) => {
  switch (strategy) {
    case 'clampMinZeroMaxOne':
      if (threshold) return metric >= threshold ? 0 : 1
      else return 1
    case 'zeroOrOne':
      if (metric && metric > 0) return 0
      else return 1
    default:
      throw `Unknown quality score strategy: ${strategy}`
  }
}

export const viewQualityScore = (view, qualityScoreDef) => {
  const attribs = qualityScoreDef.include.reduce(
    (acc, cur) => ({ ...acc, [cur]: null }),
    {}
  )
  const values = ((view || {}).details || []).reduce(
    (acc, cur) =>
      cur.def.id in attribs
        ? { ...acc, [cur.def.id]: defaultTo(cur.qualityScore, 1) }
        : acc,
    {}
  )

  if ('VSF' in values && values.VSF === 0) return 0
  delete values.VSF
  const keys = Object.keys(values)
  if (!keys.length) return 100
  return (keys.reduce((acc, cur) => acc + values[cur], 0))*(100/keys.length)
}
