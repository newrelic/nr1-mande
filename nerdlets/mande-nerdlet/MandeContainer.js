import React from 'react'
import { uniq, cloneDeep, isEqual, flatten } from 'lodash'
import {
  AccountPicker,
  NerdGraphQuery,
  Stack,
  StackItem,
  nerdlet,
  Grid,
  GridItem,
  Select,
  SelectItem,
} from 'nr1'
import CategoryMenu from '../../components/category-menu/CategoryMenu'
import MetricSidebar from '../../components/metric-sidebar/MetricSidebar'
import MetricDashboard from '../../components/dashboard/MetricDashboard'
import MetricDetail from '../../components/metric-detail/MetricDetail'
import Selected from '../../components/metric-sidebar/Selected'
import metricConfigs from '../../config/MetricConfig'
import {
  formatFilters,
  formatFacets,
  formatSinceAndCompare,
} from '../../utils/query-formatter'
import { loadMetricsForConfigs } from '../../utils/metric-data-loader'

export default class MandeContainer extends React.Component {
  constructor(props) {
    super(props)

    let metricCategories = metricConfigs.map(config => config.title)
    metricCategories = uniq(metricCategories)

    this.state = {
      accountId: null,
      threshold: 'All',
      selectedMetric: null,
      selectedStack: null,
      activeAttributes: [],
      facets: [],
      showFacetSidebar: true,
      metricData: [],
      metricCategories,
      metricRefreshInterval: 60000,
    }
  }

  loadAccounts = async () => {
    console.debug('**** loading accounts')
    const { data } = await NerdGraphQuery.query({
      query: `{
          actor {
            accounts {
              name
              id
            }
          }
        }`,
    })
    const { accounts } = data.actor
    console.debug('**** accounts loaded')
    return accounts
  }

  onChangeAccount = value => {
    this.setState({ accountId: value })
  }

  onChangeThreshold = (event, value) => {
    this.setState({ threshold: value })
  }

  onChangeInterval = (event, value) => {
    this.setState({ metricRefreshInterval: value })
  }

  onToggleMetric = (selected, init) => {
    console.debug('mandeContainer.onToggleMetric', selected)
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

      if (!init)
        this.setState({ selectedMetric: selected, selectedStack: stack[0] })
      else return stack[0]
    }
  }

  onToggleDetailView = (stackTitle, init) => {
    console.debug('mandeContainer.onToggleDetailView', stackTitle, init)
    const currentStack = this.state.selectedStack

    if (currentStack && currentStack.title === stackTitle) {
      this.setState({ selectedMetric: null, selectedStack: null })
    } else {
      const stack = metricConfigs.filter(config => config.title === stackTitle)
      if (!init)
        this.setState({ selectedMetric: null, selectedStack: stack[0] })
      else return stack[0]
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

  setupInterval = interval => {
    console.debug('**** mandeContainer.interval', interval)
    const duration = formatSinceAndCompare(
      this.props.launcherUrlState.timeRange
    )
    const { accountId } = this.state

    this.interval = setInterval(async () => {
      let metricData = []
      for (let config of metricConfigs) {
        if (config.metrics) {
          metricData = metricData.concat(
            config.metrics.map(metric => {
              return { def: metric, category: config.title, loading: true }
            })
          )
        }
      }

      console.debug('**** mandeContainer.interval reset metrics to loading')
      this.setState({ metricData })

      metricData = await loadMetricsForConfigs(
        metricConfigs,
        duration,
        accountId,
        null
      )

      console.debug('**** mandeContainer.interval reset metrics to loaded')
      this.setState({ metricData })
    }, interval)
  }

  async componentDidMount() {
    console.debug('**** mandeContainer.componentDidMount')
    const { timeRange } = this.props.launcherUrlState
    const duration = formatSinceAndCompare(timeRange)

    let { accountId } = this.props.nerdletUrlState
    const {
      threshold,
      selectedMetric,
      selectedStack,
    } = this.props.nerdletUrlState

    // no state can have been saved without also having saved accountId, so we can pivot based on presence of accountId
    const savedState = accountId !== undefined

    if (!accountId) {
      const accounts = await this.loadAccounts()
      accountId = accounts[0].id
    }

    let metricData = await loadMetricsForConfigs(
      metricConfigs,
      duration,
      accountId,
      null
    )

    // reset all state if an accountId was saved, otherwise, just set the default accountId state
    if (savedState) {
      let savedStack = selectedMetric
        ? this.onToggleMetric(selectedMetric, true)
        : selectedStack
          ? this.onToggleDetailView(selectedStack, true)
          : null
      this.setState({
        accountId,
        threshold,
        selectedMetric,
        selectedStack: savedStack,
        metricData,
      })
    } else {
      this.setState({ accountId, metricData })
    }

    this.setupInterval(this.state.metricRefreshInterval)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(this.state, nextState)) {
      console.debug('**** mandeContainer.shouldComponentUpdate state mismatch')
      return true
    }

    const { launcherUrlState } = this.props
    const nextLauncherState = nextProps.launcherUrlState
    if (!isEqual(launcherUrlState, nextLauncherState)) {
      console.debug(
        '**** mandeContainer.shouldComponentUpdate launcher state mismatch'
      )
      return true
    }

    return false
  }

  componentDidUpdate(prevProps, prevState) {
    console.debug('**** mandeContainer.componentDidUpdate')

    const {
      accountId,
      threshold,
      selectedMetric,
      selectedStack,
      metricRefreshInterval,
    } = this.state

    if (metricRefreshInterval !== prevState.metricRefreshInterval) {
      clearInterval(this.interval)
      this.setupInterval(metricRefreshInterval)
    }

    if (
      accountId != prevState.accountId ||
      threshold != prevState.threshold ||
      selectedMetric != prevState.selectedMetric ||
      !isEqual(selectedStack, prevState.selectedStack)
    ) {
      console.debug(
        '**** mandeContainer.componentDidUpdate updating nerdletUrlState'
      )
      nerdlet.setUrlState({
        accountId: accountId,
        threshold: threshold,
        selectedMetric,
        selectedStack: selectedStack ? selectedStack.title : null,
      })
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  renderOptionsBar = () => {
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
              <StackItem>
                <Stack directionType={Stack.DIRECTION_TYPE.VERTICAL}>
                  <div className="options-bar-label">Accounts</div>
                  <AccountPicker
                    value={this.state.accountId}
                    onChange={this.onChangeAccount}
                  />
                </Stack>
              </StackItem>
              <StackItem>
                <Stack directionType={Stack.DIRECTION_TYPE.VERTICAL}>
                  <div className="options-bar-label">Threshold</div>
                  <Select
                    onChange={this.onChangeThreshold}
                    value={this.state.threshold}
                  >
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Warning">Warning</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </Select>
                </Stack>
              </StackItem>
              <StackItem>
                <Stack directionType={Stack.DIRECTION_TYPE.VERTICAL}>
                  <div className="options-bar-label">Refresh Interval</div>
                  <Select
                    onChange={this.onChangeInterval}
                    value={this.state.metricRefreshInterval}
                  >
                    <SelectItem value="30000">30 seconds</SelectItem>
                    <SelectItem value="60000">1 minute</SelectItem>
                    <SelectItem value="180000">3 minutes</SelectItem>
                    <SelectItem value="300000">5 minutes</SelectItem>
                    <SelectItem value="600000">10 minutes</SelectItem>
                  </Select>
                </Stack>
              </StackItem>
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
    console.debug('**** mandeContainer.render')

    const { timeRange } = this.props.launcherUrlState
    const duration = formatSinceAndCompare(timeRange)

    const {
      accountId,
      threshold,
      selectedMetric,
      selectedStack,
      activeAttributes,
      facets,
      showFacetSidebar,
      metricData,
      metricCategories,
      metricRefreshInterval,
    } = this.state

    const filters = formatFilters(activeAttributes)
    const facetClause = formatFacets(facets)

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
              metricDefs={metricData}
              metricCategories={metricCategories}
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
            {this.renderOptionsBar()}
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
                      metricDefs={metricData}
                      metricCategories={metricCategories}
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
                      metricRefreshInterval={metricRefreshInterval}
                      activeMetric={selectedMetric}
                      toggleMetric={this.onToggleMetric}
                      stack={selectedStack}
                      activeFilters={filters}
                      facets={facetClause}
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
                  <StackItem className="sidebar-selected-title">
                    Facets
                  </StackItem>
                  {this.renderSelectedSidebar(true)}
                </React.Fragment>
              )}
              {activeAttributes && activeAttributes.length > 0 && (
                <React.Fragment>
                  <StackItem className="sidebar-selected-title">
                    Filters
                  </StackItem>
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
