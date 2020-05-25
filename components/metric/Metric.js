import React from 'react'
import { Spinner, Icon, NerdGraphQuery, StackItem, SparklineChart } from 'nr1'
import { includes } from 'lodash'
import Compare from './Compare'
import MetricValue from './MetricValue'

export class Metric extends React.Component {
  state = {
    current: null,
    previous: null,
    difference: null,
    change: '',
    loading: true,
  }

  // ============== HANDLERS/METHODS ===============
  getData = async () => {
    const {
      accountId,
      metric,
      duration: { since, compare },
      filters,
    } = this.props

    let nrql = metric.query.nrql + since + compare

    if (filters) nrql = nrql + filters.double

    const query = `{
        actor {
          account(id: ${accountId}) {
            nrql(query: "${nrql}") {
              results
            }
          }
        }
      }`
    const { data, error } = await NerdGraphQuery.query({
      query,
      fetchPolicyType: NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE,
    })

    if (error) {
      console.error(`error occurred with query ${query}: `, error)
    }

    if (data) {
      let current = data.actor.account.nrql.results[0][metric.query.lookup]
      let previous = data.actor.account.nrql.results[1][metric.query.lookup]

      if (metric.query.lookup === 'percentile') {
        current = Object.values(current)[0]
        previous = Object.values(previous)[0]
      }

      console.debug(
        'metric.getData() current previous',
        this.props.metric.title,
        current,
        previous
      )

      current = this.roundToTwoDigits(current)
      const difference = Math.abs(previous - current)
      let rounded = difference

      if (difference > 0) {
        rounded = this.roundToTwoDigits((difference / previous) * 100)
      }

      this.setState({
        current,
        previous,
        difference: rounded,
        change() {
          if (current > previous) return 'increase'
          else if (current < previous) return 'decrease'
          else return 'noChange'
        },
        loading: false,
      })
    }
  }

  roundToTwoDigits = value => {
    return Math.round(value * 100) / 100
  }

  isVisible = () => {
    const { threshold, metric } = this.props
    const { current } = this.state

    if (threshold === 1) return true
    if (!metric.threshold) return false
    if (threshold === 2) {
      if (metric.threshold.type === 'below')
        return current <= metric.threshold.warning
      else return current >= metric.threshold.warning
    }
    if (threshold === 3) {
      if (metric.threshold.type === 'below')
        return current <= metric.threshold.critical
      else return current >= metric.threshold.critical
    }
  }

  getMinified = () => {
    const { metric } = this.props
    const { current } = this.state
    return (
      <MetricValue minify={true} threshold={metric.threshold} value={current} />
    )
  }

  getMaximized = () => {
    const {
      metric,
      accountId,
      duration: { since },
      filters,
    } = this.props
    const { change, difference, current } = this.state
    let nrql = metric.query.nrql + since + ' TIMESERIES '
    if (filters) nrql += filters.single

    return (
      <React.Fragment>
        <p className="name">{metric.title}</p>
        <span className="value-container">
          <MetricValue threshold={metric.threshold} value={current} />
          <Compare
            invert={metric.invertCompareTo}
            change={change}
            difference={difference}
          />
        </span>
        <SparklineChart
          className="spark-line-chart"
          accountId={accountId}
          query={nrql}
          onHoverSparkline={() => null}
        />
      </React.Fragment>
    )
  }

  // ============== LIFECYCLE METHODS ================
  async componentDidMount() {
    await this.getData()

    this.interval = setInterval(async () => {
      if (!this.props.minify) this.setState({ loading: true })
      await this.getData()
    }, 30000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  componentDidUpdate(prevProps) {
    const prevFilters = prevProps.filters
    const currentFilters = this.props.filters
    const prevDuration = prevProps.duration
    const currentDuration = this.props.duration

    if (prevFilters !== currentFilters || prevDuration != currentDuration)
      this.getData()
  }

  render() {
    const { minify, click, metric, selected } = this.props
    const { loading } = this.state

    // apply threshold level filtering, if applicable
    if (!this.isVisible()) return null

    let metricContent = loading ? (
      <Spinner type={Spinner.TYPE.DOT} fillContainer />
    ) : minify ? (
      this.getMinified()
    ) : (
      this.getMaximized()
    )

    return (
      <div
        onClick={() => click(metric.title)}
        className={!selected ? 'metric-chart' : 'metric-chart selected'}
      >
        {metricContent}
      </div>
    )
  }
}

export class BlankMetric extends React.Component {
  render() {
    const { minified } = this.props
    return (
      <div className="metric-chart blank">
        {!minified && (
          <React.Fragment>
            <p className="name">...</p>
            <Icon
              className="icon"
              type={Icon.TYPE.INTERFACE__OPERATIONS__CONFIGURE}
              sizeType={Icon.SIZE_TYPE.LARGE}
              color="797878"
            />
          </React.Fragment>
        )}
      </div>
    )
  }
}
