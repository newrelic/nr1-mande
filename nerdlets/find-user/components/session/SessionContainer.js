import React from 'react'
import PropTypes from 'prop-types'

import {
  Stack,
  StackItem,
  HeadingText,
  NrqlQuery,
  Spinner,
  BlockText,
  Table,
} from 'nr1'
import { dateFormatter } from '../../../../utils/date-formatter'
import videoConfig from '../../../../config/VideoConfig'
import MetricValue from '../../../../components/metric/MetricValue'

export default class SessionContainer extends React.Component {
  state = {
    session: '',
  }

  renderKpiItem = metric => {
    const { accountId, duration, user } = this.props
    const nrql = `${metric.query.nrql} WHERE userId = ${user} ${duration.since}`

    console.info('sessionContainer.renderKpiItem nrql', nrql)

    return (
      <NrqlQuery accountId={accountId} query={nrql}>
        {({ data, error, loading }) => {
          if (loading) return <Spinner fillContainer />
          if (error) return <BlockText>{error.message}</BlockText>

          if (!data) return <div></div>
          let value = data[0].data[0][metric.query.lookup]
          return (
            <MetricValue
              threshold={metric.threshold}
              value={Math.round(value * 100) / 100}
            />
          )
        }}
      </NrqlQuery>
    )
  }

  renderSessionList = () => {
    return <div>Session table placeholder</div>
  }

  render() {
    const { user, duration } = this.props
    const formattedDuration = dateFormatter(duration.timeRange)

    console.info('sessionContainer.render videoConfig', videoConfig)
    return (
      <React.Fragment>
        {user && (
          <Stack
            fullWidth
            horizontalType={Stack.HORIZONTAL_TYPE.FILL}
            directionType={Stack.DIRECTION_TYPE.VERTICAL}
            style={{ height: '100%' }}
          >
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

              {videoConfig.metrics && (
                <Stack className="session-kpi-group" fullWidth>
                  {videoConfig.metrics.map((metric, idx) => {
                    return (
                      <div
                        key={metric.title + idx}
                        className="sessionSectionBase"
                      >
                        <div className="metric-chart">
                          <div className="chart-title">{metric.title}</div>
                          <div className="chart-title-tooltip">
                            {metric.title}
                          </div>
                          {this.renderKpiItem(metric)}
                        </div>
                      </div>
                    )
                  })}
                </Stack>
              )}

              <div className="session-table">{this.renderSessionList()}</div>
            </div>
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
