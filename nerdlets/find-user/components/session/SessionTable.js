import React from 'react'
import PropTypes from 'prop-types'
import { isEqual } from 'lodash'
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
import { getThresholdClass } from '../../../../utils/threshold'
import videoConfig from '../../../../config/VideoConfig'

export default class SessionTable extends React.Component {
  getTableActions = () => {
    return [
      {
        label: 'View Streams',
        iconType:
          TableRow.ACTIONS_ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__BROWSER,
        onClick: (evt, { item, index }) => {
          this.onViewSession(evt, { item, index }, 'all')
        },
      },
      // {
      //   label: 'View High Quality Streams',
      //   iconType:
      //     TableRow.ACTIONS_ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__BROWSER__A_CHECKED,
      //   onClick: (evt, { item, index }) => {
      //     this.onViewSession(evt, { item, index }, 'good')
      //   },
      // },
      // {
      //   label: 'View Low Quality Streams',
      //   iconType:
      //     TableRow.ACTIONS_ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__BROWSER__S_ERROR,
      //   onClick: (evt, { item, index }) => {
      //     this.onViewSession(evt, { item, index }, 'bad')
      //   },
      // },
    ]
  }

  getViewQualityCount = (views, threshold, above) => {
    const count = views.reduce((acc, v) => {
        if (
          (above && v.qualityScore >= threshold) ||
          (!above && v.qualityScore < threshold)
        ) {
          acc.count += 1
          acc.views.push(v.id)
        }
        return acc
      },
      { count: 0, views: [] }
    )

    return count
  }

  onViewSession = (evt, { item, index }, scope) => {
    const session = this.props.sessionViews.find(
      s => s.session === item.session
    )

    this.props.chooseSession(session, scope)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(nextProps.sessionViews, this.props.sessionViews)) return true
    else return false
  }

  render() {
    console.debug('**** sessionTable.render')

    const { accountId, duration, user, sessionViews } = this.props
    const nrql = `FROM PageAction, MobileVideo, RokuVideo SELECT min(timestamp), max(timestamp) WHERE userId = '${user}' LIMIT MAX ${duration.since} facet viewSession`

    console.info('renderSessionList nrql', nrql)

    return (
      <NrqlQuery accountId={accountId} query={nrql}>
        {({ data, error, loading }) => {
          if (loading) return <Spinner fillContainer />
          if (error) return <BlockText>{error.message}</BlockText>

          if (!data) return <div></div>

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
              qualityScore: s.qualityScore,
              totalViews: s.views.reduce((acc, v) => { acc.push(v.id); return acc }, []),
              good: this.getViewQualityCount(s.views, 90, true),
              bad: this.getViewQualityCount(s.views, 90, false),
              minTime,
              maxTime,
              duration: maxTime - minTime,
            }

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
                  Quality Score
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
                <TableRow
                  onClick={this.onViewSession}
                  actions={this.getTableActions()}
                >
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
                  <TableRowCell
                    className={`session-table__row bold ${getThresholdClass(
                      videoConfig.qualityScore.threshold,
                      item.qualityScore,
                      'greenLight'
                    )}`}
                  >
                    {item.qualityScore + ' %'}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {item.totalViews.length}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {item.good.count}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {item.bad.count}
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