import React from 'react'
import PropTypes from 'prop-types'

import { Stack, StackItem, HeadingText, Spinner } from 'nr1'
import { dateFormatter } from '../../../../utils/date-formatter'
import { roundToTwoDigits } from '../../../../utils/number-formatter'
import {
  loadMetricsForConfig,
  facetParser,
} from '../../../../utils/metric-data-loader'
import videoConfig from '../../../../config/VideoConfig'
import MetricValue from '../../../../components/metric/MetricValue'
import SessionTable from './SessionTable'

export default class SessionContainer extends React.Component {
  state = {
    sessionViews: null,
    sessionKpis: null,
    userKpis: null,
    session: null,
    loading: true,
  }

  loadData = async () => {
    const { accountId, duration, user } = this.props

    const querySuffix = `WHERE userId = '${user}' FACET viewSession, viewId LIMIT MAX`

    let metricDefs = await loadMetricsForConfig(
      videoConfig,
      duration,
      accountId,
      querySuffix,
      facetParser,
      'findUser'
    )

    // console.info('sessionContainer.loadData metricDefs', metricDefs)

    return metricDefs
  }

  collectSessionViews = (views, session, view) => {
    const found = views.find(s => s.session === session)
    if (found) {
      const foundView = found.views.find(v => v.id === view.viewId)

      if (foundView) {
        foundView.details.push(view)
      } else {
        found.views.push({ id: view.viewId, details: [view] })
      }
    } else {
      views.push({
        session: session,
        views: [{ id: view.viewId, details: [view] }],
      })
    }
    return views
  }

  collectSessionKpis = (sessions, session, view) => {
    const found = sessions.find(s => s.session === session)
    const metricName = view.def.title

    if (found) {
      const kpi = found.kpis.find(k => k.name === metricName)
      if (kpi) {
        kpi.viewCount += 1
        kpi.value = (kpi.value + view.value) / kpi.viewCount
      } else {
        found.kpis.push({
          name: metricName,
          threshold: view.def.threshold,
          viewCount: 1,
          value: view.value,
        })
      }
    } else {
      sessions.push({
        session: session,
        kpis: [
          {
            name: metricName,
            threshold: view.def.threshold,
            viewCount: 1,
            value: view.value,
          },
        ],
      })
    }

    return sessions
  }

  collectUserKpis = (kpis, view) => {
    const metricName = view.def.title
    const found = kpis.find(k => k.name === metricName)

    if (found) {
      found.viewCount += 1
      found.value += view.value
    } else {
      kpis.push({
        name: metricName,
        threshold: view.def.threshold,
        viewCount: 1,
        value: view.value,
      })
    }

    return kpis
  }

  loadSessions = async () => {
    const data = await this.loadData()

    let sessionViews = []
    let sessionKpis = []
    let userKpis = []

    data.forEach(d => {
      // TODO: add a check in here for total results - if the number is 2k, probably the user has to reduce the time period (the results will not be accurate)

      d.results &&
        d.results.forEach(r => {
          const metricValue = r.value

          if (metricValue || metricValue === 0) {
            const view = { viewId: r.facets[1], value: metricValue, def: d.def }
            const viewSession = r.facets[0]

            sessionViews = this.collectSessionViews(
              sessionViews,
              viewSession,
              view
            )

            sessionKpis = this.collectSessionKpis(
              sessionKpis,
              viewSession,
              view
            )

            userKpis = this.collectUserKpis(userKpis, view)
          }
        })
    })

    // sessionViews.forEach(v =>
    //   console.info(
    //     'sessionContainer.loadSessions >> sessionViews',
    //     v.session,
    //     v.views
    //   )
    // )
    // sessionKpis.forEach(s =>
    //   console.info(
    //     'sessionContainer.loadSessions >> sessionKpis',
    //     s.session,
    //     s.kpis
    //   )
    // )
    // userKpis.forEach(k =>
    //   console.info('sessionContainer.loadSessions >> collectUserKpis', k, k.value / k.viewCount)
    // )

    return { sessionViews, sessionKpis, userKpis }
  }

  async componentDidMount() {
    console.debug('**** sessionContainer.componentDidMount')
    const { sessionViews, sessionKpis, userKpis } = await this.loadSessions()

    this.setState({ loading: false, sessionViews, sessionKpis, userKpis })
  }

  async componentDidUpdate(prevProps, prevState) {
    console.debug('**** sessionContainer.componentDidUdpate')
    if (prevProps !== this.props) {
      this.setState({ loading: true })
      const { sessionViews, sessionKpis, userKpis } = await this.loadSessions()
      this.setState({ loading: false, sessionViews, sessionKpis, userKpis })
    }
  }

  onChooseSession = () => {
    console.info('handleChooseSession triggered')
  }

  render() {
    const { user, duration, accountId } = this.props
    const { loading, userKpis, sessionKpis } = this.state
    const formattedDuration = dateFormatter(duration.timeRange)

    console.info('**** sessionContainer.render')

    return (
      <React.Fragment>
        {user && (
          <Stack
            fullWidth
            horizontalType={Stack.HORIZONTAL_TYPE.FILL}
            directionType={Stack.DIRECTION_TYPE.VERTICAL}
            style={{ height: '100%' }}
          >
            {loading && <Spinner />}

            {!loading && (
              <React.Fragment>
                <div className="session-container">
                  <StackItem>
                    <HeadingText
                      className="panel-header"
                      type={HeadingText.TYPE.HEADING_4}
                    >
                      Sessions for User <strong>{user}</strong>
                      <span className="date-header">{formattedDuration}</span>
                    </HeadingText>
                  </StackItem>

                  {userKpis && (
                    <Stack className="session-kpi-group" fullWidth>
                      {userKpis.map((kpi, idx) => {
                        return (
                          <div
                            key={kpi.name + idx}
                            className="sessionSectionBase"
                          >
                            <div className="metric-chart">
                              <div className="chart-title">{kpi.name}</div>
                              <div className="chart-title-tooltip">
                                {kpi.name}
                              </div>
                              <MetricValue
                                threshold={kpi.threshold}
                                value={
                                  // eslint-disable-next-line prettier/prettier
                                  roundToTwoDigits(kpi.value / kpi.viewCount)
                                }
                              />
                            </div>
                          </div>
                        )
                      })}
                    </Stack>
                  )}

                  <div className="session-table">
                    <SessionTable
                      accountId={accountId}
                      user={user}
                      duration={duration}
                      sessionKpis={sessionKpis}
                      chooseSession={this.onChooseSession}
                    />
                  </div>
                </div>
              </React.Fragment>
            )}
          </Stack>
        )}
      </React.Fragment>
    )
  }
}

SessionContainer.propTypes = {
  duration: PropTypes.object.isRequired,
  accountId: PropTypes.number.isRequired,
  user: PropTypes.string.isRequired,
}
