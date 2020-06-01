import { NerdGraphQuery } from 'nr1'
import { flatten } from 'lodash'

export const loadMetricsForConfigs = async (
  metricConfigs,
  duration,
  accountId,
  filters
) => {
  console.debug('>>>> metric-data-loader.loadMetricsForConfigs')
  let metricData = []

  metricData = await Promise.all(
    metricConfigs
      .filter(config => config.metrics)
      .map(async config =>
        loadMetricsForConfig(config, duration, accountId, filters)
      )
  )

  return flatten(metricData)
}

export const loadMetricsForConfig = async (
  metricConfig,
  duration,
  accountId,
  filters
) => {
  console.debug('>>>> metric-data-loader.loadMetricsForConfig', metricConfig)
  let metricData = []
  metricData = metricData.concat(
    await Promise.all(
      metricConfig.metrics
        .filter(metric => metric.query)
        .map(async metric => {
          const dataDef = await loadMetric(metric, duration, accountId, filters)
          dataDef.category = metricConfig.title
          dataDef.loading = false
          dataDef.def = metric
          return dataDef
        })
    )
  )
  return metricData
}

export const loadMetric = async (metric, duration, accountId, filters) => {
  let nrql = metric.query.nrql + duration.since + duration.compare

  if (filters && filters.length > 0) nrql = nrql + filters.double

  // console.debug('>>>> metric-data-loader.loadMetric nrql', nrql)

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

  if (data) {
    // console.debug('>>>> metric-data-loader data', data)
    let current = data.actor.account.nrql.results[0][metric.query.lookup]
    let previous = data.actor.account.nrql.results[1][metric.query.lookup]

    if (metric.query.lookup === 'percentile') {
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
    return null
  }
}

const roundToTwoDigits = value => {
  return Math.round(value * 100) / 100
}
