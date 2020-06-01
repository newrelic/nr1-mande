import React from 'react'
import { Spinner, Icon, NerdGraphQuery, SparklineChart, NrqlQuery } from 'nr1'
import Compare from './Compare'
import MetricValue from './MetricValue'

export class Metric extends React.Component {

  isVisible = () => {
    const { threshold, metric } = this.props

    if (threshold === 'All') return true
    if (!metric.def.threshold) return false
    if (threshold === 'Warning') {
      if (metric.def.threshold.type === 'below')
        return metric.value <= metric.def.threshold.warning
      else return metric.value >= metric.def.threshold.warning
    }
    if (threshold === 'Critical') {
      if (metric.def.threshold.type === 'below')
        return metric.value <= metric.def.threshold.critical
      else return metric.value >= metric.def.threshold.critical
    }
  }

  getMinified = () => {
    const { metric } = this.props
    return (
      <MetricValue
        minify={true}
        threshold={metric.def.threshold}
        value={metric.value}
      />
    )
  }

  getMaximized = () => {
    const {
      metric,
      accountId,
      minify,
      duration: { since },
      filters,
    } = this.props

    let nrql = metric.def.query.nrql + since + ' TIMESERIES '
    if (filters) nrql += filters.single

    return (
      <React.Fragment>
        <p className="name">{metric.def.title}</p>
        <span className="value-container">
          <MetricValue threshold={metric.def.threshold} value={metric.value} />
          <Compare
            invert={metric.def.invertCompareTo}
            change={metric.change}
            difference={metric.difference}
          />
        </span>
        {!minify && (
          <SparklineChart
            className="spark-line-chart"
            accountId={accountId}
            query={nrql}
            onHoverSparkline={() => null}
          />
        )}
      </React.Fragment>
    )
  }

  render() {
    const { minify, click, metric, selected, classes } = this.props

    let metricContent
    let maximized

    if (metric.loading) {
      metricContent = <Spinner type={Spinner.TYPE.DOT} fillContainer />
    } else {
      // apply threshold level filtering, if applicable
      if (!this.isVisible()) return null

      maximized = this.getMaximized()
      if (minify) metricContent = this.getMinified()
      else {
        metricContent = maximized
      }
    }

    return (
      <div className={classes}>
        <div
          onClick={() => click(metric.def.title)}
          className={!selected ? 'metric-chart' : 'metric-chart selected'}
        >
          {metricContent}
        </div>
        {minify && (
          <div className="metric-tooltip">
            <div className="metric maximized">
              <div className={'metric-chart'}>{maximized}</div>
            </div>
          </div>
        )}
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
