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
import { roundToTwoDigits } from '../../../../utils/number-formatter'

export default class SessionTable extends React.Component {
  render() {
    const { accountId, duration, user, sessionKpis } = this.props
    const nrql = `FROM PageAction, MobileVideo, RokuVideo SELECT min(timestamp), max(timestamp) WHERE userId = '${user}' LIMIT MAX ${duration.since} facet viewSession`
    console.info('renderSessionList nrql', nrql)

    return (
      <NrqlQuery accountId={accountId} query={nrql}>
        {({ data, error, loading }) => {
          if (loading) return <Spinner fillContainer />
          if (error) return <BlockText>{error.message}</BlockText>

          if (!data) return <div></div>
          // console.info('renderSessionList data', data)

          const timedSessions = sessionKpis.map(s => {
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
              kpis: [...s.kpis],
              minTime,
              maxTime,
              duration: maxTime - minTime,
            }
            console.info('timedSession', timedSession)

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
                  Good Streams
                </TableHeaderCell>
                <TableHeaderCell className="session-table__table-header">
                  Bad Streams
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
  sessionKpis: PropTypes.array.isRequired,
  chooseSession: PropTypes.func.isRequired,
}