import React from 'react'
import { uniq, cloneDeep, isEqual } from 'lodash'
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
  Button,
  navigation,
} from 'nr1'

import CategoryMenu from '../../components/category-menu/CategoryMenu'
import MetricSidebar from '../../components/metric-sidebar/MetricSidebar'
import MetricDashboard from '../../components/dashboard/MetricDashboard'
import CategoryDetail from '../../components/category-detail/CategoryDetail'
import Selected from '../../components/metric-sidebar/Selected'
import metricConfigs from '../../config/MetricConfig'
import { FIND_USER_ATTRIBUTE } from '../../config/MetricConfig'
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
      selectedUser: '',
      activeFilters: [],
      facets: [],
      showFacetSidebar: true,
      showFindUserButton: false,
      metricData: [],
      metricCategories,
      metricRefreshInterval: 180000,
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

  loadUserFlag = async (accountId, duration) => {
    let userFound = false

    const query = `{
      actor {
        account(id: ${accountId}) {
          nrql(query: "FROM PageAction, MobileVideo, RokuVideo SELECT latest(${FIND_USER_ATTRIBUTE}) ${duration.since}") {
            results
          }
        }
      }
    }`

    const { data, errors } = await NerdGraphQuery.query({ query })

    if (errors) {
      console.error('error checking for userId', errors)
      return false
    }

    if (data) {
      userFound =
        data.actor.account.nrql.results[0][`latest.${FIND_USER_ATTRIBUTE}`] !==
        null
    }

    return userFound
  }

  onFindUserClick = () => {
    navigation.openStackedNerdlet({
      id: 'find-user',
      urlState: {
        accountId: this.state.accountId,
      },
    })
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

      const metricStack = stack[0]
      const currentStack = this.state.selectedStack

      if (!init) {
        if (!currentStack || currentStack.title !== metricStack.title)
          this.setState({
            selectedMetric: selected,
            selectedStack: metricStack,
            activeFilters: [],
            facets: [],
            showFacetSidebar: true,
          })
        else this.setState({ selectedMetric: selected })
      } else return stack[0]
    }
  }

  onToggleDetailView = (stackTitle, init) => {
    console.debug('mandeContainer.onToggleDetailView', stackTitle, init)
    const currentStack = this.state.selectedStack

    if (currentStack && currentStack.title === stackTitle) {
      this.setState({
        selectedMetric: null,
        selectedStack: null,
        activeFilters: [],
        facets: [],
        showFacetSidebar: true,
      })
    } else {
      const stack = metricConfigs.filter(config => config.title === stackTitle)
      if (!init)
        this.setState({
          selectedMetric: null,
          selectedStack: stack[0],
          activeFilters: [],
          facets: [],
          showFacetSidebar: true,
        })
      else return stack[0]
    }
  }

  onSidebarToggle = () => {
    const { showFacetSidebar } = this.state
    this.setState({ showFacetSidebar: !showFacetSidebar })
  }

  onSelectFilter = (attribute, value, add) => {
    let clonedActiveAttributes = []
    if (this.state.activeFilters)
      clonedActiveAttributes = cloneDeep(this.state.activeFilters)

    if (add) {
      clonedActiveAttributes.push({ attribute, value })
      this.setState({ activeFilters: clonedActiveAttributes })
      return
    }

    let updatedActiveAttributes = []
    if (!add) {
      updatedActiveAttributes = clonedActiveAttributes.filter(
        active => !(active.attribute === attribute && active.value === value)
      )
      this.setState({ activeFilters: updatedActiveAttributes })
    }
  }

  onSelectFacet = (attribute, add) => {
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
    this.interval = setInterval(async () => {
      const duration = formatSinceAndCompare(
        this.props.launcherUrlState.timeRange
      )
      const { accountId } = this.state

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

    const showFindUserButton = await this.loadUserFlag(accountId, duration)

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
        showFindUserButton,
      })
    } else {
      this.setState({ accountId, metricData, showFindUserButton })
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

  async componentDidUpdate(prevProps, prevState) {
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

    const { timeRange } = this.props.launcherUrlState
    const prevTimeRange = prevProps.launcherUrlState.timeRange

    if (
      prevTimeRange.begin_time !== timeRange.begin_time ||
      prevTimeRange.end_time !== timeRange.end_time ||
      prevTimeRange.duration !== timeRange.duration
    ) {
      const duration = formatSinceAndCompare(timeRange)
      let metricData = await loadMetricsForConfigs(
        metricConfigs,
        duration,
        accountId,
        null
      )
      const showFindUserButton = await this.loadUserFlag(accountId, duration)

      this.setState({ metricData, showFindUserButton })
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
              {this.state.showFindUserButton && (
                <StackItem style={{ alignSelf: 'center', marginLeft: 'auto' }}>
                  <Button
                    type={Button.TYPE.PRIMARY}
                    onClick={this.onFindUserClick}
                  >
                    Find User
                  </Button>
                </StackItem>
              )}
            </Stack>
          </StackItem>
        </Stack>
      </React.Fragment>
    )
  }

  renderSelectedSidebar = facet => {
    const { facets, activeFilters } = this.state
    const selected = facet ? facets : activeFilters
    const toggle = facet ? this.onSelectFacet : this.onSelectFilter

    return <Selected showFacets={facet} selected={selected} toggle={toggle} />
  }

  renderSidebar = duration => {
    const {
      showFacetSidebar,
      facets,
      activeFilters,
      accountId,
      selectedStack,
    } = this.state

    return (
      <React.Fragment>
        <MetricSidebar
          showFacets={showFacetSidebar}
          selected={showFacetSidebar ? facets : activeFilters}
          toggle={showFacetSidebar ? this.onSelectFacet : this.onSelectFilter}
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
      activeFilters,
      facets,
      showFacetSidebar,
      metricData,
      metricCategories,
      metricRefreshInterval,
    } = this.state

    const filters = formatFilters(activeFilters)
    const facetClause = formatFacets(facets)

    return (
      <>
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

          {!accountId && (
            <GridItem
              className="category-menu-grid-item"
              columnSpan={2}
              collapseGapAfter
            >
              <Stack
                fullHeight
                fullWidth
                className="category-menu"
                directionType={Stack.DIRECTION_TYPE.VERTICAL}
              >
                <Stack
                  className="category-menu-title"
                  fullWidth
                  directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
                  verticalType={Stack.VERTICAL_TYPE.CENTER}
                >
                  <StackItem>""</StackItem>
                </Stack>
              </Stack>
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
                      <CategoryDetail
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
                {activeFilters && activeFilters.length > 0 && (
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
      </>
    )
  }
}
