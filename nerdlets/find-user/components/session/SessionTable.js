import React from 'react'
import PropTypes from 'prop-types'
import {
  Spinner,
  NrqlQuery,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
} from 'nr1'
import {
  formatTimestampAsDate,
  formatTimeAsString,
  milliseconds,
} from '../../../../utils/date-formatter'

export default class SessionTable extends React.Component {
  getViewQualityCount = (views, threshold, above) => {
    const count = views.reduce((acc, v) => {
      if (above && v.qualityScore >= threshold) {
        acc += 1
      }
      
      if (!above && v.qualityScore < threshold) {
        acc += 1
      }

      return acc
    }, 0)

    return count
  }

  render() {
    const { accountId, duration, user, sessionViews } = this.props
    const nrql = `FROM PageAction, MobileVideo, RokuVideo SELECT min(timestamp), max(timestamp) WHERE userId = '${user}' LIMIT MAX ${duration.since} facet viewSession`
    console.info('renderSessionList nrql', nrql)

    return (
      <NrqlQuery accountId={accountId} query={nrql}>
        {({ data, error, loading }) => {
          if (loading) return <Spinner fillContainer />
          if (error) return <BlockText>{error.message}</BlockText>

          if (!data) return <div></div>
          // console.info('renderSessionList data', data)

          const timedSessions = sessionViews.map(s => {
            const timedResults = data.filter(
              d => d.metadata.groups[1].value === s.session
            )

            let minTime = 0
            let maxTime = 0

            timedResults.forEach(t => {
              if (t.data[0]['Min timestamp'])
                minTime = t.data[0]['Min timestamp']
              if (t.data[0]['Max timestamp'])
                maxTime = t.data[0]['Max timestamp']
            })

            const timedSession = {
              session: s.session,
              // kpis: [...s.kpis],
              totalViews: s.views.length,
              goodViews: this.getViewQualityCount(s.views, 90, true),
              badViews: this.getViewQualityCount(s.views, 90, false),
              minTime,
              maxTime,
              duration: maxTime - minTime,
            }
            // console.info('timedSession', timedSession)

            return timedSession
          })

          return (
            <Table items={timedSessions}>
              <TableHeader>
                <TableHeaderCell className="session-table__table-header">
                  Session Id
                </TableHeaderCell>
                <TableHeaderCell className="session-table__table-header">
                  Start Time
                </TableHeaderCell>
                <TableHeaderCell className="session-table__table-header">
                  End Time
                </TableHeaderCell>
                <TableHeaderCell className="session-table__table-header">
                  Duration
                </TableHeaderCell>
                <TableHeaderCell className="session-table__table-header">
                  Total Streams
                </TableHeaderCell>
                <TableHeaderCell className="session-table__table-header">
                  High Quality Streams
                </TableHeaderCell>
                <TableHeaderCell className="session-table__table-header">
                  Low Quality Streams
                </TableHeaderCell>
              </TableHeader>

              {({ item }) => (
                <TableRow onClick={this.onChooseSession}>
                  <TableRowCell className="session-table__row">
                    {item.session}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {formatTimestampAsDate(item.minTime)}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {formatTimestampAsDate(item.maxTime)}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {formatTimeAsString(item.duration, milliseconds)}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {item.totalViews}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {item.goodViews}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {item.badViews}
                  </TableRowCell>
                </TableRow>
              )}
            </Table>
          )
        }}
      </NrqlQuery>
    )
  }
}

SessionTable.propTypes = {
  duration: PropTypes.object.isRequired,
  accountId: PropTypes.number.isRequired,
  user: PropTypes.string.isRequired,
  sessionViews: PropTypes.array.isRequired,
  chooseSession: PropTypes.func.isRequired,
}