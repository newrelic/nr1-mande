import React from 'react'
import { Spinner, Icon, NerdGraphQuery, StackItem } from 'nr1'
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
    const { accountId, metric, duration, threshold } = this.props
    const since = ` SINCE ${duration} MINUTES AGO`
    const compare = ` COMPARE WITH ${duration} MINUTES AGO`
    const nrql = metric.query.nrql + since + compare

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
      console.error(error)
    }

    // console.debug('metrc query data', nrql, data)
    if (data) {
      let current = data.actor.account.nrql.results[0][metric.query.lookup]
      let previous = data.actor.account.nrql.results[1][metric.query.lookup]

      if (metric.query.lookup === 'percentile') {
        current = Object.values(current)[0]
        previous = Object.values(previous)[0]
      }

      console.info(
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

    if (threshold === 'All') return true
    if (!metric.threshold) return false
    if (threshold === 'Warning') {
      if (metric.threshold.type === 'below')
        return current <= metric.threshold.warning
      else return current >= metric.threshold.warning
    }
    if (threshold === 'Critical') {
      if (metric.threshold.type === 'below')
        return current <= metric.threshold.critical
      else return current >= metric.threshold.critical
    }
  }

  getMinified = () => {
    const { metric } = this.props
    const { current } = this.state
    return (
      <React.Fragment>
        <MetricValue
          minify={true}
          threshold={metric.threshold}
          value={current}
        />
      </React.Fragment>
    )
  }

  getMaximized = () => {
    const { metric } = this.props
    const { change, difference, current } = this.state

    return (
      <React.Fragment>
        <p className="name">{metric.title}</p>
        <MetricValue threshold={metric.threshold} value={current} />
        <Compare
          invert={metric.invertCompareTo}
          change={change}
          difference={difference}
        />
      </React.Fragment>
    )
  }

  // ============== LIFECYCLE METHODS ================
  async componentDidMount() {
    console.debug('metric componentDidMount')
    await this.getData()

    this.interval = setInterval(async () => {
      this.setState({ loading: true })
      await this.getData()
    }, 30000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    // console.debug('metric.render')

    const { minify, click, metric } = this.props
    const { loading } = this.state

    // apply threshold level filtering, if applicable
    if (!this.isVisible()) return null

    let metricContent = loading ? (
      <Spinner fillContainer />
    ) : minify ? (
      this.getMinified()
    ) : (
      this.getMaximized()
    )

    return (
      <StackItem className={!minify ? 'metric' : 'metric minified'}>
        <div onClick={() => click(metric.title)} className="metric-chart">
          {metricContent}
        </div>
      </StackItem>
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
