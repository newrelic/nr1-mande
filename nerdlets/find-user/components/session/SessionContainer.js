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
import { metricQualityScore, viewQualityScore } from './quality-score'
import SessionTable from './SessionTable'
import UserKpis from './UserKpis'

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

  collectSessionViews = (sessionViews, session, view) => {
    if (view.def.qualityScoreStrategy) {
      view.qualityScore = metricQualityScore(
        view.value,
        view.def.threshold.critical,
        view.def.qualityScoreStrategy
      )
    }

    const found = sessionViews.find(s => s.session === session)
    if (found) {
      const foundView = found.views.find(v => v.id === view.viewId)

      if (foundView) {
        foundView.details.push(view)
      } else {
        found.views.push({ id: view.viewId, details: [view] })
      }
    } else {
      sessionViews.push({
        session: session,
        views: [{ id: view.viewId, details: [view] }],
      })
    }
    return sessionViews
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
          id: view.def.id,
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
            id: view.def.id,
            name: metricName,
            threshold: view.def.threshold,
            viewCount: 1,
            value: view.value,
            qualityScoreStrategy: view.def.qualityScoreStrategy,
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
        id: view.def.id,
        name: metricName,
        threshold: view.def.threshold,
        viewCount: 1,
        value: view.value,
        qualityScoreStrategy: view.def.qualityScoreStrategy,
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

    sessionViews.forEach(s => {
      s.qualityScore = roundToTwoDigits(
        s.views.reduce((acc, v) => {
          v.qualityScore = viewQualityScore(v, videoConfig.qualityScore)
          acc += v.qualityScore
          return acc
        }, 0) / s.views.length
      )
    })

    sessionViews.qualityScore = roundToTwoDigits(
      sessionViews.reduce((acc, s) => {
        acc += s.qualityScore
        return acc
      }, 0) / sessionViews.length
    )

    sessionViews.totalViews = sessionViews.reduce((acc, s) => {
      acc += s.views.length
      return acc
    }, 0)

    console.info('sessionContainer.sessionViews', sessionViews)

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
    const { loading, userKpis, sessionViews } = this.state
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

                  <UserKpis sessionViews={sessionViews} userKpis={userKpis} />

                  <div className="session-table">
                    <SessionTable
                      accountId={accountId}
                      user={user}
                      duration={duration}
                      sessionViews={sessionViews}
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
