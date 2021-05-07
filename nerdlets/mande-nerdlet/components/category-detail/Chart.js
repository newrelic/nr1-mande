import React from 'react'
import PropTypes from 'prop-types'

import uniq from 'lodash.uniq'
import {
  Button,
  AreaChart,
  ScatterChart,
  LineChart,
  BillboardChart,
  BarChart,
  HeatmapChart,
  HistogramChart,
  PieChart,
  FunnelChart,
  TableChart,
  Tooltip,
} from 'nr1'
import { dateFormatter } from '../../../shared/utils/date-formatter'
import { formatFacets } from '../../../shared/utils/query-formatter'
import { getHook } from '../../../shared/utils/hooks'
import { lexer } from '../../../shared/utils/syntax-highligher'
import Popup from '../../../shared/components/popup/Popup'
import { withFacetFilterContext } from '../../../shared/context/FacetFilterContext'

class Chart extends React.Component {
  state = {
    popup: false,
  }

  myRef = React.createRef()

  componentDidMount() {
    document.addEventListener('mousedown', this.onClickOutsideActionMenu)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onClickOutsideActionMenu)
  }

  getQuery = config => {
    const {
      duration: { since, compare },
      facetContext: {
        queryFormattedFacets: facets,
        queryFormattedFilters: filters,
      },
    } = this.props

    let query = config.nrql
    if (config.useSince) query += since
    if (config.useCompare) query += compare
    if (filters) query += filters.single

    if (!config.noFacet) {
      if (config.facets && facets)
        query += `FACET ${this.getDedupedFacets(config, facets)}`
      else {
        if (facets) query += `FACET ${facets}`
        if (config.facets) query += `FACET ${config.facets}`
      }
    }

    return query
  }

  getDedupedFacets = (config, facets) => {
    if (!config.facets) return facets
    else {
      let allFacets = []
      allFacets = config.facets.split(',').map(item => item.trim())
      if (facets) allFacets = allFacets.concat(facets.split(','))
      return formatFacets(uniq(allFacets))
    }
  }

  onClickOutsideActionMenu = e => {
    if (this.myRef.current && !this.myRef.current.contains(e.target))
      this.setState({ popup: false })
  }

  onActionsMenuClick = () => this.setState({ popup: !this.state.popup })

  onActionMenuSelect = (type, query) => {
    const { actionMenuSelect } = this.props

    switch (type) {
      case 'expand':
        const chartProps = { ...this.props, expand: true }
        actionMenuSelect(<Chart {...chartProps} />)
        break
      case 'view':
        actionMenuSelect(
          <div className="chart-view-query-container">
            <div className="chart-header expand">
              <div className="chart-title expand">
                Query for "{this.props.chartDef.title}"
              </div>
            </div>
            <div
              className="chart-view-query query"
              dangerouslySetInnerHTML={{ __html: lexer(query) }}
            />
          </div>,
          { width: '70%', height: '50%' }
        )
        break
      default:
        console.info('mande: no action defined for ', type)
        break
    }

    this.setState({ popup: false })
  }

  renderChart = (config, query, expand) => {
    const {
      accountId,
      facetContext: { queryFormattedFacets: facets },
    } = this.props

    switch (config.chartType) {
      case 'area':
        return (
          <AreaChart
            accountId={accountId}
            query={query}
            onClickArea={getHook(config.click ? config.click : 'filter').bind(
              this.props
            )}
            onClickLine={getHook(config.click ? config.click : 'filter').bind(
              this.props
            )}
          />
        )
      case 'bar':
        return (
          <BarChart
            accountId={accountId}
            query={query}
            onClickBar={
              getHook(config.click ? config.click : 'filter').bind(this.props)
              // config.click ? getHook(config.click).bind(this.props) : () => null
            }
          />
        )
      case 'billboard':
        if (facets)
          return this.renderChart({ ...config, chartType: 'bar' }, query)
        else return <BillboardChart accountId={accountId} query={query} />
      case 'heatmap':
        return <HeatmapChart accountId={accountId} query={query} />
      case 'histogram':
        return <HistogramChart accountId={accountId} query={query} />
      case 'billboard':
        return <BillboardChart accountId={accountId} query={query} />
      case 'pie':
        return <PieChart accountId={accountId} query={query} />
      case 'line':
        return (
          <LineChart
            accountId={accountId}
            query={query}
            onClickLine={getHook(config.click ? config.click : 'filter').bind(
              this.props
            )}
          />
        )
      case 'funnel':
        return <FunnelChart accountId={accountId} query={query} />
      case 'scatter':
        return <ScatterChart accountId={accountId} query={query} />
      case 'table': // need to pass the facets for data matching
        const tableQuery = expand
          ? query
          : query.replace(/limit (max|[0-9]+)/gi, 'LIMIT 20')
        return (
          <TableChart
            accountId={accountId}
            query={tableQuery}
            onClickTable={
              config.click ? getHook(config.click).bind(this.props) : () => null
            }
          />
        )
      default:
        return <LineChart accountId={accountId} query={this.query} />
    }
  }

  render() {
    const {
      duration: { timeRange },
      chartDef,
      expand,
    } = this.props

    const formattedDuration = dateFormatter(timeRange)
    const query = this.getQuery(chartDef)

    return (
      <div className={'chart-container' + (expand ? ' expand' : '')}>
        <div className="chart-header">
          <div className="chart-title">
            <Tooltip text={chartDef.title}>{chartDef.title}</Tooltip>
            <div className="chart-subtitle">{formattedDuration}</div>
          </div>
          {!expand && (
            <div className="chart-actions" ref={this.myRef}>
              <Button
                type={Button.TYPE.PLAIN_NEUTRAL}
                iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__MORE}
                onClick={this.onActionsMenuClick}
              />
              <Popup
                visible={this.state.popup}
                styles={{ minWidth: '12rem', transform: 'translateY(2.75rem)' }}
              >
                <div className="chart-actions-menu">
                  <div
                    className="chart-actions-menu-item"
                    onClick={() => this.onActionMenuSelect('expand')}
                  >
                    Expand
                  </div>
                  <div
                    className="chart-actions-menu-item"
                    onClick={() => this.onActionMenuSelect('view', query)}
                  >
                    View Query
                  </div>
                  {/* <div className="chart-actions-menu-item">
                    Open query in Data Explorer
                  </div> */}
                </div>
              </Popup>
            </div>
          )}
        </div>
        <div className={'detail-chart ' + (!expand ? chartDef.chartSize : '')}>
          {this.renderChart(chartDef, query, expand)}
        </div>
      </div>
    )
  }
}

Chart.propTypes = {
  duration: PropTypes.object.isRequired,
  chartDef: PropTypes.object.isRequired,
  expand: PropTypes.bool,
  actionMenuSelect: PropTypes.func.isRequired,
}

Chart.defaultProps = {
  expand: false,
}

export default withFacetFilterContext(Chart)
