import React from 'react'
import { cloneDeep } from 'lodash'
import { NerdGraphQuery, Stack, StackItem, nerdlet, Grid, GridItem } from 'nr1'
import DimensionDropDown from '../../components/dimension/DimensionDropDown'
import CategoryMenu from '../../components/category-menu/CategoryMenu'
import MetricSidebar from '../../components/metric-sidebar/MetricSidebar'
import MetricDashboard from '../../components/dashboard/MetricDashboard'
import MetricDetail from '../../components/metric-detail/MetricDetail'
import Selected from '../../components/metric-sidebar/Selected'
import metricConfigs from '../../config/MetricConfig'
import { formatSinceAndCompare } from '../../utils/query-formatter'

export default class MandeContainer extends React.PureComponent {
  state = {
    accountId: null,
    threshold: 1,
    selectedMetric: null,
    selectedStack: null,
    activeAttributes: [],
    facets: [],
    showFacetSidebar: true,
  }

  dimensionConfigs = [
    {
      name: 'Accounts',
      mandatory: true,
      data: async () => {
        const { data } = await this.query(`{
            actor {
              accounts {
                name
                id
              }
            }
          }`)
        const { accounts } = data.actor
        return accounts
      },
      handler: account => {
        this.setState({ accountId: account.id })
      },
    },
    {
      name: 'Threshold',
      mandatory: true,
      data() {
        return [
          { id: 1, name: 'All' },
          { id: 2, name: 'Warning' },
          { id: 3, name: 'Critical' },
        ]
      },
      handler: level => {
        this.setState({ threshold: level.id })
      },
    },
  ]

  query = async graphql => {
    return await NerdGraphQuery.query({ query: graphql })
  }

  onToggleMetric = selected => {
    const currentMetric = this.state.selectedMetric

    if (currentMetric && currentMetric === selected)
      this.setState({ selectedMetric: null })
    else {
      const stack = metricConfigs.filter(config => {
        const metricFound =
          config.metrics &&
          config.metrics.filter(metric => metric.title === selected)

        if (metricFound && metricFound.length > 0) return config
      })

      this.setState({ selectedMetric: selected, selectedStack: stack[0] })
    }
  }

  onToggleDetailView = stackTitle => {
    const currentStack = this.state.selectedStack

    if (currentStack && currentStack.title === stackTitle) {
      this.setState({ selectedMetric: null, selectedStack: null })
    } else {
      const stack = metricConfigs.filter(config => config.title === stackTitle)
      this.setState({ selectedMetric: null, selectedStack: stack[0] })
    }
  }

  onSidebarToggle = () => {
    const { showFacetSidebar } = this.state
    this.setState({ showFacetSidebar: !showFacetSidebar })
  }

  onAttributeToggle = (attribute, value, add) => {
    let clonedActiveAttributes = []
    if (this.state.activeAttributes)
      clonedActiveAttributes = cloneDeep(this.state.activeAttributes)

    if (add) {
      clonedActiveAttributes.push({ attribute, value })
      this.setState({ activeAttributes: clonedActiveAttributes })
      return
    }

    let updatedActiveAttributes = []
    if (!add) {
      updatedActiveAttributes = clonedActiveAttributes.filter(
        active => !(active.attribute === attribute && active.value === value)
      )
      this.setState({ activeAttributes: updatedActiveAttributes })
    }
  }

  onFacetToggle = (attribute, add) => {
    const clonedFacets = [...this.state.facets]

    if (add) {
      clonedFacets.push(attribute)
      this.setState({ facets: clonedFacets })
      return
    }

    let updatedFacets = []
    if (!add) {
      updatedFacets = clonedFacets.filter(cloned => cloned !== attribute)
      this.setState({ facets: updatedFacets })
    }
  }

  componentDidMount() {
    const { selectedMetric, selectedStack } = this.props.nerdletUrlState
    if (selectedMetric) this.onToggleMetric(selectedMetric)
    if (!selectedMetric) {
      if (selectedStack) this.onToggleDetailView(selectedStack)
      //else this.onToggleDetailView('Video') //if (metricConfigs.length === 1)
    }
  }

  componentDidUpdate() {
    const { accountId, threshold, selectedMetric, selectedStack } = this.state
    nerdlet.setUrlState({
      selectedDimensions: [
        { name: 'Accounts', value: accountId },
        { name: 'Level', value: threshold },
      ],
      selectedMetric,
      selectedStack: selectedStack ? selectedStack.title : null,
    })
  }

  renderDimensions = (duration, history) => {
    const dimensions = this.dimensionConfigs
      .map(config => {
        return [...Array(config)].map((_, idx) => {
          return (
            <StackItem key={config.name + idx}>
              <DimensionDropDown
                config={config}
                duration={duration}
                history={history}
              />
            </StackItem>
          )
        })
      })
      .reduce((arr, val) => {
        return arr.concat(val)
      }, [])

    return (
      <React.Fragment>
        <Stack
          fullWidth={true}
          directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
          gapType={Stack.GAP_TYPE.SMALL}
          className="options-bar-parent"
        >
          <StackItem>
            <Stack
              directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
              className="options-bar"
              fullWidth
            >
              {dimensions}
            </Stack>
          </StackItem>
        </Stack>
      </React.Fragment>
    )
  }

  renderSelectedSidebar = facet => {
    const { facets, activeAttributes } = this.state
    const selected = facet ? facets : activeAttributes
    const toggle = facet ? this.onFacetToggle : this.onAttributeToggle

    return <Selected showFacets={facet} selected={selected} toggle={toggle} />
  }

  renderSidebar = duration => {
    const {
      showFacetSidebar,
      facets,
      activeAttributes,
      accountId,
      selectedStack,
    } = this.state

    return (
      <React.Fragment>
        <MetricSidebar
          showFacets={showFacetSidebar}
          selected={showFacetSidebar ? facets : activeAttributes}
          toggle={
            showFacetSidebar ? this.onFacetToggle : this.onAttributeToggle
          }
          accountId={accountId}
          duration={duration}
          stack={selectedStack}
        />
      </React.Fragment>
    )
  }

  render() {
    console.debug('mandecontainer.render')
    const { timeRange } = this.props.launcherUrlState
    const { selectedDimensions } = this.props.nerdletUrlState

    const duration = formatSinceAndCompare(timeRange)

    const {
      accountId,
      threshold,
      selectedMetric,
      selectedStack,
      activeAttributes,
      facets,
      showFacetSidebar,
    } = this.state

    console.debug(
      'mandeContainer.props.launcherUrlState',
      this.props.launcherUrlState
    )

    return (
      <Grid
        className="container"
        spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
      >
        {accountId && (
          <GridItem
            className="category-menu-grid-item"
            columnSpan={2}
            collapseGapAfter
          >
            <CategoryMenu
              accountId={accountId}
              threshold={threshold}
              duration={duration}
              metricConfigs={metricConfigs}
              selectedStack={selectedStack}
              toggleMetric={this.onToggleMetric}
              toggleDetails={this.onToggleDetailView}
            />
          </GridItem>
        )}
        <GridItem
          className="primary-content-grid-container"
          columnSpan={selectedStack ? 8 : 10}
        >
          <div className="primary-content-grid">
            {this.renderDimensions(duration, selectedDimensions)}
            {accountId && (
              <Stack
                fullWidth={true}
                directionType={Stack.DIRECTION_TYPE.VERTICAL}
                horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
                gapType={Stack.GAP_TYPE.SMALL}
                className="main-panel"
              >
                {!selectedStack && (
                  <StackItem grow>
                    <MetricDashboard
                      accountId={accountId}
                      threshold={threshold}
                      duration={duration}
                      metricConfigs={metricConfigs}
                      toggleMetric={this.onToggleMetric}
                      toggleDetails={this.onToggleDetailView}
                    />
                  </StackItem>
                )}
                {selectedStack && (
                  <StackItem grow>
                    <MetricDetail
                      accountId={accountId}
                      duration={duration}
                      threshold={threshold}
                      activeMetric={selectedMetric}
                      toggleMetric={this.onToggleMetric}
                      stack={selectedStack}
                      activeFilters={activeAttributes}
                      facets={facets}
                    />
                  </StackItem>
                )}
              </Stack>
            )}
          </div>
        </GridItem>
        {accountId && selectedStack && (
          <GridItem
            className="filters-list-grid-item"
            columnSpan={2}
            collapseGapBefore
          >
            <div onClick={this.onSidebarToggle}>
              <Stack
                fullWidth
                directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
                verticalType={Stack.VERTICAL_TYPE.CENTER}
                gapType={Stack.GAP_TYPE.NONE}
              >
                <StackItem
                  grow
                  className={
                    showFacetSidebar
                      ? 'filter-visibility-control selected'
                      : 'filter-visibility-control notSelected'
                  }
                >
                  Choose Facets
                </StackItem>
                <StackItem
                  grow
                  className={
                    !showFacetSidebar
                      ? 'filter-visibility-control selected'
                      : 'filter-visibility-control notSelected'
                  }
                >
                  Choose Filters
                </StackItem>
              </Stack>
            </div>
            <Stack
              grow
              fullHeight
              fullWidth
              directionType={Stack.DIRECTION_TYPE.VERTICAL}
              className="detail-filter"
            >
              {facets && facets.length > 0 && (
                <React.Fragment>
                  <StackItem className="sidebar-title">Facets</StackItem>
                  {this.renderSelectedSidebar(true)}
                </React.Fragment>
              )}
              {activeAttributes && activeAttributes.length > 0 && (
                <React.Fragment>
                  <StackItem className="sidebar-title">Filters</StackItem>
                  {this.renderSelectedSidebar(false)}
                </React.Fragment>
              )}
              {this.renderSidebar(duration)}
            </Stack>
          </GridItem>
        )}
      </Grid>
    )
  }
}
