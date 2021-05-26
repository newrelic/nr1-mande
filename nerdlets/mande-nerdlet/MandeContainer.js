import React from 'react'
import uniq from 'lodash.uniq'
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
import ActionSidebar from './components/action-sidebar/ActionSidebar'
import MetricDashboard from './components/dashboard/MetricDashboard'
import CategoryDetail from './components/category-detail/CategoryDetail'
import metricConfigs from '../shared/config/MetricConfig'
import { FIND_USER_ATTRIBUTE, VIDEO_EVENTS } from '../shared/config/constants'
import { formatSinceAndCompare } from '../shared/utils/query-formatter'
import { loadMetricsForConfigs } from '../shared/utils/metric-data-loader'
import Modal from '../shared/components/modal/modal'
import { withFacetFilterContext } from '../shared/context/FacetFilterContext'

class MandeContainer extends React.Component {
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
      showFindUserButton: false,
      metricData: [],
      metricCategories,
      metricRefreshInterval: 180000,
      modal: false,
      modalContent: null,
      modalStyles: {},
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

    const showFindUserButton = this.userLookupIsEnabled()

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
      // if (!loading) {
      this.setState({ metricData: [], loading: true }, async () => {
        const duration = formatSinceAndCompare(timeRange)
        let metricData = await loadMetricsForConfigs(
          metricConfigs,
          duration,
          accountId,
          null
        )
        const showFindUserButton = await this.loadUserFlag(accountId, duration)

        this.setState({ metricData, showFindUserButton, loading: false })
      })
      // }
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

  userLookupIsEnabled = () => !!FIND_USER_ATTRIBUTE

  onFindUserClick = () => {
    navigation.openStackedNerdlet({
      id: 'find-user',
      urlState: {
        accountId: this.props.launcherUrlState.accountId,
      },
    })
  }

  onCloseModal = () => this.setState({ modal: false })
  onOpenModal = (content, styles) => {
    this.setState({ modal: true, modalContent: content, modalStyles: styles })
  }

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
        if (!currentStack || currentStack.title !== metricStack.title) {
          this.props.facetContext.reset()
          this.setState({
            selectedMetric: selected,
            selectedStack: metricStack,
            showFacetSidebar: true,
          })
        } else this.setState({ selectedMetric: selected })
      } else return stack[0]
    }
  }

  onToggleDetailView = (stackTitle, init) => {
    const currentStack = this.state.selectedStack

    if (currentStack && currentStack.title === stackTitle) {
      this.props.facetContext.reset()
      this.setState({
        selectedMetric: null,
        selectedStack: null,
        showFacetSidebar: true,
      })
    } else {
      const stack = metricConfigs.filter(config => config.title === stackTitle)
      if (!init) {
        this.props.facetContext.reset()
        this.setState({
          selectedMetric: null,
          selectedStack: stack[0],
          showFacetSidebar: true,
        })
      } else return stack[0]
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

  render() {
    const { timeRange, accountId } = this.props.launcherUrlState
    const duration = formatSinceAndCompare(timeRange)

    const {
      loading,
      threshold,
      selectedMetric,
      selectedStack,
      metricData,
      metricCategories,
      metricRefreshInterval,
    } = this.state

    return loading ? (
      <Spinner />
    ) : (
      <>
        {this.state.modal && (
          <Modal
            style={{ width: '90%', height: '90%', ...this.state.modalStyles }}
            onClose={this.onCloseModal}
          >
            {this.state.modalContent}
          </Modal>
        )}
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
                        actionMenuSelect={this.onOpenModal}
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
              <ActionSidebar
                accountId={accountId}
                duration={duration}
                stack={selectedStack}
                timeRange={timeRange}
              />
            </GridItem>
          )}
        </Grid>
      </>
    )
  }
}

export default withFacetFilterContext(MandeContainer)
