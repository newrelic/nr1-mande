import React from 'react'
import { chunk } from 'lodash'
import { Grid, GridItem, Stack, StackItem, NrqlQuery, Spinner } from 'nr1'
import MetricValue from '../metric/MetricValue'
import { render } from 'react-dom'

export default class SessionDetail extends React.PureComponent {

  composeNrqlQuery = (query, dataHandler, handlerParams) => {
    const { accountId, duration } = this.props
    const nrql = query + ` SINCE ${duration} MINUTES AGO`

    console.debug('sessionDetail sessionDetails query', nrql)

    return (
      <NrqlQuery accountId={accountId} query={nrql}>
        {({ data, error, loading }) => {
          if (loading) return <Spinner fillContainer />
          if (error) return <BlockText>{error.message}</BlockText>

          if (!data) return <div></div>
          return dataHandler(data, handlerParams)
        }}
      </NrqlQuery>
    )
  }

  buildSessionDetailGrid = data => {
    const gridItems = data.map((dataItem, idx) => {
      let key = dataItem.metadata.name.replace(/\s+/g, '')
      key = key.charAt(0).toLowerCase() + key.slice(1)

      return (
        <GridItem
          columnSpan={6}
          className="session-detail-grid-item"
          key={key + idx}
        >
          <div className="session-detail-item">
            <span className="session-detail-label">
              {dataItem.metadata.name}
            </span>
            <span className="session-detail-divider">:</span>
            <span className="session-detail-value">
              {dataItem.data[0][key]}
            </span>
          </div>
        </GridItem>
      )
    })

    return <Grid className="session-detail-grid">{gridItems}</Grid>
  }

  buildKpiStackItem = (results, metric) => {
    let value = results[0].data[0][metric.query.lookup]
    return (
      <MetricValue
        threshold={metric.threshold}
        value={Math.round(value * 100) / 100}
      />
    )
  }

  render() {
    const { session, stack } = this.props

    const chunkedMetrics = chunk(stack.metrics, 2)
    return (
      <Stack
        className="sessionStack"
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
      >
        <Stack fullWidth={true} fullHeight={true}>
          <StackItem grow className="sessionStackItem sessionSectionBase">
            <div className="chart-container">
              <div className="chart-title">Session Details</div>
              {this.composeNrqlQuery(
                `SELECT latest(userAgentName), latest(userAgentOS), latest(userAgentVersion), latest(appName), latest(deviceType), latest(contentTitle), latest(countryCode), latest(city) FROM PageAction, MobileVideo, RokuVideo WHERE viewId='${session}'`,
                this.buildSessionDetailGrid
              )}
            </div>
          </StackItem>
        </Stack>

        {chunkedMetrics &&
          chunkedMetrics.map((chunk, idx) => {
            return (
              <Stack fullWidth={true} fullHeight={true} key={idx}>
                {chunk.map((metric, idx) => {
                  return (
                    <StackItem
                      grow
                      key={metric.title + idx}
                      className="sessionStackItem sessionSectionBase"
                    >
                      <div className="chart-container">
                        <div className="chart-title">{metric.title}</div>
                        {this.composeNrqlQuery(
                          metric.query.nrql + ` WHERE viewId='${session}'`,
                          this.buildKpiStackItem,
                          metric
                        )}
                      </div>
                    </StackItem>
                  )
                })}
                {chunk.length === 1 && (
                  <StackItem
                    grow
                    className="sessionStackItem sessionSectionBase  blank"
                  >
                    <div />
                  </StackItem>
                )}
              </Stack>
            )
          })}
      </Stack>
    )
  }
}
