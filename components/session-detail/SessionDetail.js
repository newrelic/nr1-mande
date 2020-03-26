import React from 'react'
import { chunk } from 'lodash'
import { Grid, GridItem, Stack, StackItem, NrqlQuery, Spinner } from 'nr1'
import MetricValue from '../metric/MetricValue'

const sessionDetail = props => {
  const { accountId, session, stack, duration } = props
  const since = ` SINCE ${duration} MINUTES AGO`

  const composeNrqlQuery = (query, dataHandler, handlerParams) => {
    const nrql = query + since
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

  const buildSessionDetailGrid = data => {
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

  const buildKpiStackItem = (results, metric) => {
    let value = results[0].data[0][metric.query.lookup]
    return (
      <MetricValue
        threshold={metric.threshold}
        value={Math.round(value * 100) / 100}
      />
    )
  }

  // convert our stack metric list into arrays of 2 each
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
            {composeNrqlQuery(
              `SELECT latest(userAgentName), latest(userAgentOS), latest(userAgentVersion), latest(appName), latest(deviceType), latest(contentTitle), latest(countryCode), latest(city) FROM PageAction, MobileVideo, RokuVideo WHERE session='${session}'`,
              buildSessionDetailGrid
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
                      {composeNrqlQuery(
                        metric.query.nrql + ` WHERE session='${session}'`,
                        buildKpiStackItem,
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

export default sessionDetail
