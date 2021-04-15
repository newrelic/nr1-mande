export const formatSinceAndCompare = timeRange => {
  const { begin_time, end_time, duration } = timeRange
  let clauses = { timeRange }

  if (duration) {
    const minutes = duration / 1000 / 60
    clauses.since = ` SINCE ${minutes} MINUTES AGO `
    clauses.compare = ` COMPARE WITH ${minutes} MINUTES AGO `
  } else if (begin_time && end_time) {
    const diff = Math.round((end_time - begin_time) / 1000 / 60)
    clauses.since = ` SINCE ${begin_time} UNTIL ${end_time} `
    clauses.compare = ` COMPARE WITH ${diff} MINUTES AGO `
  } else {
    clauses.since = ` SINCE 60 MINUTES AGO `
    clauses.compare = ` COMPARE WITH 60 MINUTES AGO `
  }

  return clauses
}

const singleFilter = (attribute, value) => {
  const isString = isStringValue(value)
  const prefix = `WHERE ${getAttribute(attribute, isString)} =`
  const filters = {
    single: `${prefix} ${getFilterValue(value, isString, 'single')} `,
    double: `${prefix} ${getFilterValue(value, isString, 'double')} `,
  }
  return filters
}

const multipleFilters = (attribute, values) => {
  const isString = isStringValue(values)

  let singleEscapedValues = ''
  let doubleEscapedValues = ''
  for (let i = 1; i <= values.length; i++) {
    singleEscapedValues = singleEscapedValues + getFilterValue(values[i - 1], isString, 'single')
    if (i < values.length) singleEscapedValues = singleEscapedValues + ','

    doubleEscapedValues = doubleEscapedValues + getFilterValue(values[i - 1], isString, 'double')
    if (i < values.length) doubleEscapedValues = doubleEscapedValues + ','
  }

  const prefix = ` WHERE ${getAttribute(attribute, isString)} IN (`
  const suffix = ')'
  return {
    single: `${prefix} ${singleEscapedValues} ${suffix}`,
    double: `${prefix} ${doubleEscapedValues} ${suffix}`,
  }
}

const getAttribute = (attribute, isString) => {
  return isString ? attribute : `numeric(${attribute})`
}

const getFilterValue = (value, isString, escapeType) => {
  if (!isString) return value

  switch (escapeType) {
    case 'double':
      return `'${doubleEscapeValue(value)}'`
    default:
      return `'${escapeValue(value)}'`
  }
}

const escapeValue = value => {
  return value.replace(/'/g, "\\\'")
}

const doubleEscapeValue = value => {
  return value.replace(/'/g, "\\\\'")
}

const isStringValue = el => {
  let numeric = true
  if (el.isArray) {
    for (let value of el) {
      if (isNaN(value)) {
        numeric = false
        break
      }
    }
  } else {
    numeric = isNaN(el)
  }
  return numeric
}

export const formatFilters = filters => {
  if (!filters || filters.length === 0) return

  let attributeMap = new Map()
  for (let filter of filters) {
    if (!filter.value) continue

    const entries = attributeMap.get(filter.attribute)
    if (entries) entries.push(filter.value)
    else {
      entries = [filter.value]
      attributeMap.set(filter.attribute, entries)
    }
  }

  const singleEscapedFilters = []
  const doubleEscapedFilters = []
  for (let [key, value] of attributeMap) {
    if (value.length < 2) {
      const filterStatement = singleFilter(key, value[0])
      singleEscapedFilters.push(filterStatement.single)
      doubleEscapedFilters.push(filterStatement.double)
    } else {
      const filterStatement = multipleFilters(key, value)
      singleEscapedFilters.push(filterStatement.single)
      doubleEscapedFilters.push(filterStatement.double)
    }
  }

  return {
    single: singleEscapedFilters.join(' '),
    double: doubleEscapedFilters.join(' '),
  }
}

export const formatFacets = facets => {
  let facetNrql = ''

  facets.map((facet, idx) => {
    if (idx !== facets.length - 1) {
      facetNrql += facet + ','
    } else {
      facetNrql += facet
    }
  })

  return facetNrql
}
