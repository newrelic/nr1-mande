import React from 'react'
import { NrqlQuery } from 'nr1'
import Compare from './Compare'
import MetricValue from './MetricValue'

export default class Metric extends React.Component {
  state = {
    current: null,
    previous: null,
    difference: null,
    change: '',
  }

  // ============== HANDLERS/METHODS ===============
  getData = async () => {
    const { accountId, metric, duration } = this.props
    const since = ` SINCE ${duration} MINUTES AGO`
    const compare = ` COMPARE WITH ${duration} MINUTES AGO`
    const query = metric.query.nrql + since + compare

    const { data } = await NrqlQuery.query({
      accountId: accountId,
      query: query,
      formatType: 'raw',
    })

    // console.debug('metrc query data', query, data)

    if (data) {
      let current = data.raw.current.results[0][metric.query.lookup]
      let previous = data.raw.previous.results[0][metric.query.lookup]

      if (metric.query.lookup === 'percentiles') {
        current = Object.values(current)[0]
        previous = Object.values(previous)[0]
      }

      this.setState({ current, previous })
    }
  }

  getDifference = () => {
    const { current, previous } = this.state

    console.debug(
      'metric getDifference current previous',
      this.props.metric.title,
      current,
      previous
    )

    const difference = Math.abs(previous - current)
    let rounded = difference

    if (difference > 0) {
      rounded = this.roundToTwoDigits((difference / previous) * 100)
    }

    const change = () => {
      if (current > previous) return 'increase'
      else if (current < previous) return 'decrease'
      else return 'noChange'
    }

    this.setState({ difference: rounded, change: change() })
  }

  roundToTwoDigits = value => {
    return Math.round(value * 100) / 100
  }

  // ============== LIFECYCLE METHODS ================
  async componentDidMount() {
    await this.getData()
    this.getDifference()
  }

  render() {
    const { metric } = this.props
    const { change, difference, current } = this.state

    return (
      <div className="metric-chart">
        <p className="name">{metric.title}</p>
        <MetricValue
          threshold={metric.threshold}
          value={this.roundToTwoDigits(current)}
        />
        <Compare
          invert={metric.invertCompareTo}
          change={change}
          difference={difference}
        />
      </div>
    )
  }
}
