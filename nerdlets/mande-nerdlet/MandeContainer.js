import React from 'react'
import uniq from 'lodash.uniq'
import cloneDeep from 'lodash.clonedeep'
import isEqual from 'lodash.isequal'
import {
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
  Spinner,
} from 'nr1'

import CategoryMenu from './components/category-menu/CategoryMenu'
import MetricSidebar from './components/metric-sidebar/MetricSidebar'
import MetricDashboard from './components/dashboard/MetricDashboard'
import CategoryDetail from './components/category-detail/CategoryDetail'
import Selected from './components/metric-sidebar/Selected'
import metricConfigs from '../shared/config/MetricConfig'
import { FIND_USER_ATTRIBUTE, VIDEO_EVENTS } from '../shared/config/constants'
import {
  formatFilters,
  formatFacets,
  formatSinceAndCompare,
} from '../shared/utils/query-formatter'
import { loadMetricsForConfigs } from '../shared/utils/metric-data-loader'
import Modal from '../shared/components/modal/modal'

export default class MandeContainer extends React.Component {
  constructor(props) {
    super(props)

    let metricCategories = metricConfigs.map(config => config.title)
    metricCategories = uniq(metricCategories)

    this.state = {
      loading: true,
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
      modal: true,
    }
  }

  async componentDidMount() {
    const { timeRange, accountId } = this.props.launcherUrlState
    const duration = formatSinceAndCompare(timeRange)
    const {
      threshold,
      selectedMetric,
      selectedStack,
    } = this.props.nerdletUrlState

    // check if we should load from a saved state
    const savedState = threshold || selectedMetric || selectedStack

    let metricData = await loadMetricsForConfigs(
      metricConfigs,
      duration,
      accountId,
      null
    )

    const showFindUserButton = await this.loadUserFlag(accountId, duration)

    // reset all state if a state was saved
    if (savedState) {
      let savedStack = selectedMetric
        ? this.onToggleMetric(selectedMetric, true)
        : selectedStack
        ? this.onToggleDetailView(selectedStack, true)
        : null
      this.setState({
        threshold,
        selectedMetric,
        selectedStack: savedStack,
        metricData,
        showFindUserButton,
        loading: false,
      })
    } else {
      this.setState({
        metricData,
        showFindUserButton,
        loading: false,
      })
    }
    this.setupInterval(this.state.metricRefreshInterval)
  }

  shouldComponentUpdate(nextProps, nextState) {
    let update = false

    if (!isEqual(this.state, nextState)) {
      update = true
    }

    const { launcherUrlState } = this.props
    const nextLauncherState = nextProps.launcherUrlState
    if (!isEqual(launcherUrlState, nextLauncherState)) {
      update = true
    }

    return update
  }

  async componentDidUpdate(prevProps, prevState) {
    const {
      threshold,
      selectedMetric,
      selectedStack,
      metricRefreshInterval,
      loading,
    } = this.state
    const { timeRange, accountId } = this.props.launcherUrlState
    const {
      timeRange: prevTimeRange,
      accountId: prevAccountId,
    } = prevProps.launcherUrlState

    if (prevAccountId !== accountId) {
      if (!loading) {
        this.setState({ metricData: [], loading: true }, async () => {
          const duration = formatSinceAndCompare(timeRange)
          let metricData = await loadMetricsForConfigs(
            metricConfigs,
            duration,
            accountId,
            null
          )
          const showFindUserButton = await this.loadUserFlag(
            accountId,
            duration
          )

          this.setState({ metricData, showFindUserButton, loading: false })
        })
      }
    }

    if (metricRefreshInterval !== prevState.metricRefreshInterval) {
      clearInterval(this.interval)
      this.setupInterval(metricRefreshInterval)
    }

    if (
      threshold != prevState.threshold ||
      selectedMetric != prevState.selectedMetric ||
      !isEqual(selectedStack, prevState.selectedStack)
    ) {
      nerdlet.setUrlState({
        threshold: threshold,
        selectedMetric,
        selectedStack: selectedStack ? selectedStack.title : null,
      })
    }

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

  setupInterval = interval => {
    this.interval = setInterval(async () => {
      const duration = formatSinceAndCompare(
        this.props.launcherUrlState.timeRange
      )
      const accountId = this.props.launcherUrlState.accountId

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

      this.setState({ metricData })

      metricData = await loadMetricsForConfigs(
        metricConfigs,
        duration,
        accountId,
        null
      )

      this.setState({ metricData })
    }, interval)
  }

  loadAccounts = async () => {
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
    return accounts
  }

  loadUserFlag = async (accountId, duration) => {
    let userFound = false

    let userClause = ''
    FIND_USER_ATTRIBUTE.forEach(u => {
      if (userClause) userClause += ' OR '
      userClause += `${u} IS NOT NULL`
    })

    const query = `{
      actor {
        account(id: ${accountId}) {
          nrql(query: "FROM ${VIDEO_EVENTS} SELECT count(*) WHERE ${userClause} ${duration.since}") {
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

    if (data) userFound = data.actor.account.nrql.results[0].count > 0

    return userFound
  }

  onFindUserClick = () => {
    navigation.openStackedNerdlet({
      id: 'find-user',
      urlState: {
        accountId: this.props.launcherUrlState.accountId,
      },
    })
  }

  onCloseModal = () => this.setState({ modal: false })
  onActionMenuClick = () => this.setState({ modal: true })

  onChangeAccount = (event, value) => {
    this.setState({ accountId: value })
  }

  onChangeThreshold = (event, value) => {
    this.setState({ threshold: value })
  }

  onChangeInterval = (event, value) => {
    this.setState({ metricRefreshInterval: value })
  }

  onToggleMetric = (metric, init) => {
    const currentMetric = this.state.selectedMetric
    const selected = metric.id ? metric.id : metric.title

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
      launcherUrlState: { accountId },
    } = this.props
    const {
      showFacetSidebar,
      facets,
      activeFilters,
      // accountId,
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
    const { timeRange, accountId } = this.props.launcherUrlState
    const duration = formatSinceAndCompare(timeRange)

    const {
      loading,
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

    return loading ? (
      <Spinner />
    ) : (
      <>
        {/* {this.state.modal && (
          <Modal
            style={{ width: '90%', height: '90%' }}
            onClose={this.closeModal}
          >
            <div>Testing Modal</div>
          </Modal>
        )} */}
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
