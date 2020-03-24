const singleValue = (attribute, value) => {
  return ` WHERE ${attribute} = '${value}' `
}

const multipleValues = (attribute, values) => {
  let statement = ` WHERE ${attribute} IN (`

  for (let i = 1; i <= values.length; i++) {
    statement = statement + `'${values[i-1]}'`
    if (i < values.length) statement = statement + ','
    if (i == values.length) statement = statement + ') '
  }

  return statement
}

const filterFactory = filters => {
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
    if (value.length < 2) filterStatements.push(singleValue(key, value[0]))
    else filterStatements.push(multipleValues(key, value))
  }

  console.debug(`filterFactory.filters ${JSON.stringify(filterStatements)}`)

  return filterStatements.join(' ')
}

export default filterFactory
