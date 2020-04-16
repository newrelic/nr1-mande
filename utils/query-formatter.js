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
  return ` WHERE ${getAttribute(attribute, isString)} = ${getFilterValue(value, isString)} `
}

const multipleFilters = (attribute, values) => {
  const isString = isStringValue(values)

  let valueStatements = ''
  for (let i = 1; i <= values.length; i++) {
    valueStatements = valueStatements + getFilterValue(values[i - 1], isString)
    if (i < values.length) valueStatements = valueStatements + ','
  }

  return ` WHERE ${getAttribute(attribute, isString)} IN (${valueStatements})`
}

const getAttribute = (attribute, isString) => {
  return isString ? attribute : `numeric(${attribute})`
}

const getFilterValue = (value, isString) => {
  return isString ? `'${value}'` : value
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
  let attributeMap = new Map()
  for (let filter of filters) {
    const entries = attributeMap.get(filter.attribute)
    if (entries) entries.push(filter.value)
    else {
      entries = [filter.value]
      attributeMap.set(filter.attribute, entries)
    }
  }

  const filterStatements = []
  for (let [key, value] of attributeMap) {
    if (value.length < 2) filterStatements.push(singleFilter(key, value[0]))
    else filterStatements.push(multipleFilters(key, value))
  }

  console.debug(`filterNrql.filters ${JSON.stringify(filterStatements)}`)

  return filterStatements.join(' ')
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
