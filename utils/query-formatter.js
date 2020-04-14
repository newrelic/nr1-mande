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
  return ` WHERE ${attribute} = ${getFilterValue(value)} `
}

const multipleFilters = (attribute, values) => {
  let statement = ` WHERE ${attribute} IN (`

  for (let i = 1; i <= values.length; i++) {
    statement = statement + getFilterValue(values[i - 1])
    if (i < values.length) statement = statement + ','
    if (i == values.length) statement = statement + ') '
  }

  return statement
}

const getFilterValue = value => {
  return isNaN(value) ? `'${value}'` : value
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
