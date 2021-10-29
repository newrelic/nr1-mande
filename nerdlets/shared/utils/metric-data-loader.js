import { NerdGraphQuery } from 'nr1'
import flatten from 'lodash.flatten'
import { roundToTwoDigits } from './number-formatter'

export const loadMetricsForConfigs = async (
  metricConfigs,
  duration,
  accountId,
  filters,
  parser
) => {
  // console.debug('>>>> metric-data-loader.loadMetricsForConfigs')
  let metricData = []

  await Promise.all(
    metricConfigs
      .filter(config => config.metrics)
      .map(async config =>
        loadMetricsForConfig(config, duration, accountId, filters, parser)
      )
  )
    .then(results => (metricData = flatten(results)))
    .catch(error => console.log(error))

  return metricData
}

export const loadMetricsForConfig = async (
  metricConfig,
  duration,
  accountId,
  filters,
  parser,
  queryCategory,
  retryCount = 1
) => {
  // console.debug('>>>> metric-data-loader.loadMetricsForConfig', metricConfig)
  let metricData = []
  let metricNoData = []
  metricData = metricData.concat(
    await Promise.all(
      metricConfig.metrics
        .filter(metric => metric.query)
        .map(async metric => {
          let dataDef = await loadMetric(
            metric,
            duration,
            accountId,
            filters,
            parser,
            queryCategory
          )
          if (retryCount < 4 && !dataDef) {
            metricNoData.push(metric)
            return null
          }
          dataDef = Object.keys(dataDef).length ? dataDef : {}
          dataDef.id = (metricConfig || {}).id
          dataDef.category = (metricConfig || {}).title
          dataDef.loading = false
          dataDef.def = metric
          return dataDef
        })
    )
  )
  if (metricNoData.length && retryCount < 4) {
    retryCount += 1
    const retryData = await loadMetricsForConfig(
      { ...metricConfig, ...{ metrics: metricNoData } },
      duration,
      accountId,
      filters,
      parser,
      queryCategory,
      retryCount
    )
    metricData = metricData.filter(Boolean).concat(retryData)
  }
  return metricData
}

export const loadMetric = async (
  metric,
  duration,
  accountId,
  filters,
  parserConfig,
  queryCategory
) => {
  // defaults for backwards compatibility
  if (!parserConfig)
    parserConfig = { parser: compareParser, parserName: 'compareParser' }
  if (!queryCategory || !metric[queryCategory]) queryCategory = 'query'

  const { parser, parserName } = parserConfig

  let nrql =
    metric[queryCategory].nrql +
    duration.since +
    (parserName === 'compareParser' ? duration.compare : '')

  if (filters) nrql = nrql + (filters.double ? filters.double : filters)

  // console.debug(
  //   `>>>> metric-data-loader.loadMetric ${metric.title} nrql ${nrql}`
  // )

  const query = `{
      actor {
        account(id: ${accountId}) {
          nrql(query: "${nrql}") {
            results
          }
        }
      }
    }`

  try {
    const { data, errors } = await NerdGraphQuery.query({
      query,
      fetchPolicyType: NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE,
    })

    if (errors) {
      console.error(`error returned by query. ${query}: `, errors)
      return false
    } else {
      return parser(metric, data, metric[queryCategory].lookup)
    }
  } catch (e) {
    console.error(`error occurred: `, e)
    return false
  }
}

export const compareParser = (metric, data, lookup) => {
  if (data) {
    // console.debug(
    //   `>>>> metric-data-loader.compareParser ${metric.title} data`,
    //   data
    // )

    if (data.actor.account.nrql.results.length === 0)
      return { value: 0, difference: 0, change: 0 }

    let current = data.actor.account.nrql.results[0][lookup]
    let previous = data.actor.account.nrql.results[1][lookup]

    if (isNaN(current) && lookup === 'percentile') {
      current = Object.values(current)[0]
      previous = Object.values(previous)[0]
    }

    current = roundToTwoDigits(current)
    const difference = Math.abs(previous - current)
    let rounded = difference

    if (difference > 0) {
      rounded = roundToTwoDigits(
        (difference / (previous === 0 ? 1 : previous)) * 100
      )
    }

    const change =
      current > previous
        ? 'increase'
        : current < previous
        ? 'decrease'
        : 'noChange'

    return {
      value: current,
      difference: rounded,
      change,
    }
  } else {
    return { value: 0, difference: 0, change: 0 }
  }
}

export const facetParser = (metric, data, lookup) => {
  if (data) {
    // console.debug(
    //   `>>>> metric-data-loader.facetParser ${metric.title} data`,
    //   data
    // )
    if (data.actor.account.nrql.results.length === 0) return {}

    const results = data.actor.account.nrql.results.map(r => {
      let value = r[lookup]
      if (value) value = roundToTwoDigits(value)
      return { facets: r.facet, value }
    })

    return { results }
  } else {
    return {}
  }
}
