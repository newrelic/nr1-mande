import React from 'react'
import PropTypes from 'prop-types'
import { Stack, StackItem, HeadingText, Spinner } from 'nr1'
import { dateFormatter } from '../../../../utils/date-formatter'
import { roundToTwoDigits } from '../../../../utils/number-formatter'
import ViewTable from './ViewTable'
import KpiGrid from '../kpi/KpiGrid'

export default class ViewContainer extends React.Component {
  collectKpis = views => {
    let kpis = []
    views.forEach(view => {
      console.log('view', view)
      view.details.forEach(d => {
        console.info('detail', d)

        const metricName = d.def.title
        const found = kpis.find(k => k.name === metricName)

        if (found) {
          found.viewCount += 1
          found.value += d.value
        } else {
          kpis.push({
            id: d.def.id,
            name: metricName,
            threshold: d.def.threshold,
            viewCount: 1,
            value: d.value,
          })
        }
      })
    })

    return kpis
  }

  render() {
    console.debug('**** viewContainer.render')

    const { user, duration, selected, clearSession } = this.props
    const formattedDuration = dateFormatter(duration.timeRange)

    return (
      <React.Fragment>
        <Stack
          fullWidth
          horizontalType={Stack.HORIZONTAL_TYPE.FILL}
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          style={{ height: '100%' }}
        >
          <div className="session-container">
            <StackItem className="view-header">
              <HeadingText
                className="panel-header"
                type={HeadingText.TYPE.HEADING_4}
              >
                {/* <span
                  className="panel-header-breadcrumb"
                  onClick={clearSession}
                >{`User ${user} >>`}</span>{' '} */}
                Views for Session <strong>{selected.session.session}</strong>
                <div className="date-header">{formattedDuration}</div>
              </HeadingText>
              <div className="close-view" onClick={clearSession}>X</div>
            </StackItem>

            <KpiGrid
              qualityScore={selected.session.qualityScore}
              kpis={this.collectKpis(selected.session.views)}
            />

            <div className="session-table">
              <ViewTable
                accountId={this.props.accountId}
                duration={duration}
                selected={selected}
              />
            </div>
          </div>
        </Stack>
      </React.Fragment>
    )
  }
}

ViewContainer.propTypes = {
  duration: PropTypes.object.isRequired,
  accountId: PropTypes.number.isRequired,
  user: PropTypes.string.isRequired,
  selected: PropTypes.object.isRequired,
  clearSession: PropTypes.func.isRequired,
}
