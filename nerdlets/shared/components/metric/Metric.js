import React from 'react'
import PropTypes from 'prop-types'
import { Spinner, SparklineChart, Tooltip } from 'nr1'

const getThresholdClass = (threshold, value, baseStyle) => {
  baseStyle = baseStyle ? baseStyle : ''
  if (!threshold || (!threshold.warning && !threshold.critical)) return ''
  if (threshold.type === 'below') {
    if (value > threshold.warning) return baseStyle
    if (value <= threshold.critical) return 'redLight'
    return 'yellowLight'
  } else {
    if (value < threshold.warning) return baseStyle
    if (value >= threshold.critical) return 'redLight'
    return 'yellowLight'
  }
}

const round = value => Math.round((value + Number.EPSILON) * 100) / 100

const formatValue = value => {
  if (isNaN(value)) return '-'
  let formatted

  if (value < 1000) formatted = round(value)
  else if (value > 1000 && value < 1000000) {
    formatted = round(value / 1000) + 'K'
  } else if (value > 1000000 && value < 1000000000) {
    formatted = round(value / 1000000) + 'M'
  } else if (value > 1000000000 && value < 1000000000000)
    formatted = round(value / 1000000000) + 'B'
  else formatted = round(value / 1000000000000) + 'T'

  return formatted
}

export default class Metric extends React.PureComponent {
  isVisible = value => {
    const { visibleThreshold, threshold } = this.props

    if (visibleThreshold === 'All') return true
    if (!threshold) return false
    if (visibleThreshold === 'Warning') {
      if (threshold.type === 'below') return value <= threshold.warning
      else return value >= threshold.warning
    }
    if (visibleThreshold === 'Critical') {
      if (threshold.type === 'below') return value <= threshold.critical
      else return value >= threshold.critical
    }
  }

  renderCompare = () => {
    const { compare } = this.props

    if (compare.difference === Infinity) return null

    const statusClasses = {
      decrease: {
        standard: 'good',
        inverted: 'bad',
      },
      increase: {
        standard: 'bad',
        inverted: 'good',
      },
      getStatus(currentStatus) {
        let status = this[currentStatus]
        if (status)
          return compare.invertCompare ? status.inverted : status.standard
      },
    }

    const changeClass = compare.change
    const classes = ['compareTo', changeClass]
    if (changeClass !== 'noChange') {
      const status = statusClasses.getStatus(changeClass)
      classes.push(status)
    }
    const roundedDiff = Math.round(compare.difference)
    const diffPct = isNaN(roundedDiff)
      ? ''
      : new Intl.NumberFormat('default', {
          style: 'percent',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(roundedDiff / 100)

    return (
      <React.Fragment>
        <p className={classes.join(' ')}>{diffPct}</p>
      </React.Fragment>
    )
  }

  renderSparkline = () => {
    const { accountId, query } = this.props

    let sparkline = null
    if (accountId && query) {
      let nrql = query
      if (!nrql.includes('TIMESERIES')) nrql += ' TIMESERIES '
      sparkline = (
        <SparklineChart
          className="spark-line-chart"
          accountId={accountId}
          query={nrql}
          onHoverSparkline={() => null}
        />
      )
    }
    return sparkline
  }

  renderMaximized = thresholdClass => {
    const {
      metric,
      showCompare,
      showTooltip,
      showSparkline,
      tooltipText,
      minify,
    } = this.props

    return (
      <React.Fragment>
        {/* {metric.def.query.title ? metric.def.query.title : metric.def.title} */}
        <p className="name">
          {showTooltip ? (
            <Tooltip text={tooltipText ? tooltipText : metric.title}>
              {metric.title}
            </Tooltip>
          ) : (
            // eslint-disable-next-line prettier/prettier
            metric.title
          )}
        </p>
        <span className="value-container">
          {this.renderMetricValue(thresholdClass, false)}
          {showCompare && this.renderCompare()}
        </span>
        {!minify && showSparkline && this.renderSparkline()}
      </React.Fragment>
    )
  }

  renderMetricValue = (thresholdClass, minify) => {
    const { metric, valueSize } = this.props
    const formattedValue = formatValue(metric.value)
    return (
      <p className={`value ${thresholdClass} ${valueSize}`}>
        {!minify &&
          (metric.decoration
            ? formattedValue + metric.decoration
            : formattedValue)}
      </p>
    )
  }

  render() {
    let { classes } = this.props
    const {
      loading,
      metric,
      threshold,
      minify,
      click,
      selected,
      valueAlign,
    } = this.props

    if (loading) {
      return (
        <div className="metric-chart loading">
          <Spinner type={Spinner.TYPE.DOT} fillContainer />
        </div>
      )
    } else {
      if (!this.isVisible(metric.value)) return null

      const thresholdClass = getThresholdClass(
        threshold,
        metric.value,
        threshold && threshold.showGreenLight ? 'greenLight' : ''
      )
      let metricContent
      let styles
      let maximized = this.renderMaximized(thresholdClass)

      if (minify) {
        classes += ' minified '
        metricContent = this.renderMetricValue(thresholdClass, true)
      } else {
        metricContent = maximized
        classes += ' maximized '
        styles = valueAlign
          ? valueAlign === 'left'
            ? { alignItems: 'flex-start' }
            : { alignItems: 'flex-end' }
          : null
      }

      return (
        <div className={'metric ' + classes}>
          <div
            onClick={() => (click ? click(metric) : () => null)}
            style={styles && { ...styles }}
            className={`${
              !selected ? 'metric-chart' : 'metric-chart selected'
            } ${thresholdClass} ${!click ? 'no-click' : ''}`}
          >
            {metricContent}
          </div>
          {minify && (
            <div className="metric-tooltip">
              <div className="metric maximized">
                <div className={`metric-chart ${thresholdClass}`}>
                  {maximized}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }
  }
}

Metric.propTypes = {
  /**
   * An object containing the metric and metadata required for display. The object should include the following properties:
   * id: the value identifying the metric in other contexts
   * value: the numeric value of the metric (mandatory if no query is provided)
   * title: the display name (mandatory if you want a title displayed)
   * category: the category name (optional)
   * decoration: string to append to the value (e.g. %) (optional)
   */
  metric: PropTypes.object.isRequired,
  /**
   * The threshold setting for the metric. This is an object that expects the following properties:
   * critical: a numeric value
   * warning: a numeric value
   * type: 'below' or 'above' - defaults to above. E.g. a metric has a value of 10 and a critical threshold
   * of 5 - if type is above, this will be in breach of the critical threshold.
   * showGreenLight: flag indicating if green light styling should be used (default is false)
   */
  threshold: PropTypes.object,
  /**
   * A value indicating if any threshold filtering has been applied (e.g. only show metrics in a critical state). Default is 'All'.
   * Accepted values: 'All', 'Critical', 'Warning'
   */
  visibleThreshold: PropTypes.string,
  /**
   * Flag indicating if the metric is in a loading state. Defaults to false.
   */
  loading: PropTypes.bool,
  /**
   * The account id - required if a query.
   */
  accountId: PropTypes.number,
  /**
   * The query to lookup metric value. Required if no metric.value is provided, or if sparkline is true.
   */
  query: PropTypes.string,
  /**
   * A flag indicating if a sparkline should be rendered. Default is false.
   */
  showSparkline: PropTypes.bool,
  /**
   * A flag indicating if the metric should be rendered in minified form. Default is false.
   */
  minify: PropTypes.bool,
  /**
   * A flag indicating if the metric has been selected (should probably move this to classes). Default is false.
   */
  selected: PropTypes.bool,
  /**
   * A flag to indciate if the compare bug should be rendered. Default is false.
   */
  showCompare: PropTypes.bool,
  /**
   * An object containing the compare definition. Mandotary if showCompare is true. Accepted properties:
   * invertCompare: A flag to indicate if the compare bug should be inverted from standard (i.e. up is bad, down is good). Default is false.
   * change: the direction a metric has changed. Should be provided when compare is true. Accepted values are 'increase', 'decrease' and 'noChange'.
   * difference: the percentage of change
   */
  compare: PropTypes.object,
  /**
   * On-click handler for the component. The metric will be provided as a parameter to the handler.
   */
  click: PropTypes.func,
  /**
   * CSS class names to apply to the component.
   */
  classes: PropTypes.string,
  /**
   * Flag indicating if a tooltip should be shown. Default is false.
   */
  showTooltip: PropTypes.bool,
  /**
   * Tooltip text to display. Default is metric.title.
   */
  tooltipText: PropTypes.string,
  /**
   * Font size to use for the value. One of extralarge, large, medium, small. Default is medium.
   */
  valueSize: PropTypes.string,
  /**
   * Set alignment for the value row. One of left, center, right. Default is center.
   */
  valueAlign: PropTypes.string,
}

Metric.defaultProps = {
  minify: false,
  selected: false,
  showCompare: false,
  showSparkline: false,
  selected: false,
  compare: false,
  loading: false,
  visibleThreshold: 'All',
  showTooltip: false,
  compare: {},
  valueSize: 'medium',
  classes: '',
}
