import React from 'react'
import PropTypes from 'prop-types'
import isEqual from 'lodash.isequal'
import { Stack, StackItem, HeadingText, Spinner } from 'nr1'
import { dateFormatter } from '../../../shared/utils/date-formatter'
import { roundToTwoDigits } from '../../../shared/utils/number-formatter'
import {
  loadMetricsForConfig,
  facetParser,
} from '../../../shared/utils/metric-data-loader'
import videoConfig from '../../../shared/config/VideoConfig'
import {
  metricQualityScore,
  viewQualityScore,
} from '../../../shared/utils/quality-score'
import QosKpiGrid from '../../../shared/components/qos/QosKpiGrid'
import SessionTable from './SessionTable'
import { FIND_USER_ATTRIBUTE } from '../../../shared/config/constants'

export default class SessionContainer extends React.Component {
  state = {
    sessionViews: null,
    userKpis: null,
    loading: true,
  }

  loadData = async () => {
    const { accountId, duration, user } = this.props

    let userClause = ''
    FIND_USER_ATTRIBUTE.forEach(u => {
      if (userClause) userClause += ' OR '
      userClause += `${u} = '${user}'`
    })
    const querySuffix = `WHERE ${userClause} FACET viewSession, viewId LIMIT MAX`

    let metricDefs = await loadMetricsForConfig(
      videoConfig,
      duration,
      accountId,
      querySuffix,
      { parser: facetParser, parserName: 'facetParser' },
      'findUser'
    )

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

    return { sessionViews, userKpis }
  }

  async componentDidMount() {
    const { sessionViews, userKpis } = await this.loadSessions()

    this.setState({ loading: false, sessionViews, userKpis })
  }

  async componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps, this.props)) {
      this.setState({ loading: true })
      const { sessionViews, userKpis } = await this.loadSessions()
      this.setState({ loading: false, sessionViews, userKpis })
    }
  }

  render() {
    const { user, duration, accountId, chooseSession } = this.props
    const { loading, userKpis, sessionViews } = this.state
    const formattedDuration = dateFormatter(duration.timeRange)

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
                      <div className="date-header">{formattedDuration}</div>
                    </HeadingText>
                  </StackItem>

                  <QosKpiGrid
                    qualityScore={sessionViews.qualityScore}
                    kpis={userKpis}
                    threshold={videoConfig.qualityScore.threshold}
                  />

                  <div className="session-table">
                    <SessionTable
                      accountId={accountId}
                      user={user}
                      duration={duration}
                      sessionViews={sessionViews}
                      chooseSession={chooseSession}
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
  chooseSession: PropTypes.func.isRequired,
}
