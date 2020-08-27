import { NerdGraphQuery } from 'nr1'
import { flatten } from 'lodash'
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

  metricData = await Promise.all(
    metricConfigs
      .filter(config => config.metrics)
      .map(async config =>
        loadMetricsForConfig(config, duration, accountId, filters, parser)
      )
  )

  return flatten(metricData)
}

export const loadMetricsForConfig = async (
  metricConfig,
  duration,
  accountId,
  filters,
  parser,
  queryCategory
) => {
  // console.debug('>>>> metric-data-loader.loadMetricsForConfig', metricConfig)
  let metricData = []
  metricData = metricData.concat(
    await Promise.all(
      metricConfig.metrics
        .filter(metric => metric.query)
        .map(async metric => {
          const dataDef = await loadMetric(
            metric,
            duration,
            accountId,
            filters,
            parser,
            queryCategory
          )
          dataDef.id = metricConfig.id
          dataDef.category = metricConfig.title
          dataDef.loading = false
          dataDef.def = metric
          return dataDef
        })
    )
  )
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
  if (!parserConfig) parserConfig = { parser: compareParser, parserName: 'compareParser' }
  if (!queryCategory || !metric[queryCategory]) queryCategory = 'query'

  const { parser, parserName } = parserConfig

  let nrql =
    metric[queryCategory].nrql +
    duration.since +
    (parserName === 'compareParser' ? duration.compare : '')

  if (filters) nrql = nrql + (filters.double ? filters.double : filters)

  console.debug(
    `>>>> metric-data-loader.loadMetric ${metric.title} nrql ${nrql}`
  )

  const query = `{
      actor {
        account(id: ${accountId}) {
          nrql(query: "${nrql}") {
            results
          }
        }
      }
    }`
  const { data, errors } = await NerdGraphQuery.query({
    query,
    fetchPolicyType: NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE,
  })

  if (errors) {
    console.error(`error occurred with query ${query}: `, errors)
  }

  return parser(metric, data, metric[queryCategory].lookup)

}

export const compareParser = (metric, data, lookup) => {
  if (data) {
    console.debug(
      `>>>> metric-data-loader.compareParser ${metric.title} data`,
      data
    )

    if (data.actor.account.nrql.results.length === 0)
      return { value: 0, difference: 0, change: 0 }

    let current = data.actor.account.nrql.results[0][lookup]
    let previous = data.actor.account.nrql.results[1][lookup]
    console.debug(
      `>>>> metric-data-loader.compareParser ${metric.title} current vs previous`,
      current,
      previous
    )

    if (isNaN(current) && lookup === 'percentile') {
      current = Object.values(current)[0]
      previous = Object.values(previous)[0]
    }

    current = roundToTwoDigits(current)
    const difference = Math.abs(previous - current)
    let rounded = difference

    if (difference > 0) {
      rounded = roundToTwoDigits((difference / previous) * 100)
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
    console.debug(
      `>>>> metric-data-loader.facetParser ${metric.title} data`,
      data
    )
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

