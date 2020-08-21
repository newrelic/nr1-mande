import React from 'react'
import PropTypes from 'prop-types'
import { isEqual } from 'lodash'
import { Stack, Grid, GridItem } from 'nr1'
import { roundToTwoDigits } from '../../../../utils/number-formatter'
import MetricValue from '../../../../components/metric/MetricValue'

export default class KpiGrid extends React.Component {

  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(nextProps.kpis, this.props.kpis)) return true
    else return false
  }

  render() {
    console.debug('**** kpiGrid.render')
    const { qualityScore, kpis } = this.props
    const qosThreshold = {
      critical: 80,
      warning: 90,
      type: 'below',
    }

    return (
      <React.Fragment>
        {kpis && (
          <Grid className="session-user-kpis">
            <GridItem columnStart={1} columnEnd={4}>
              <div className="session-qos-base sessionSectionBase">
                <div className="metric-chart">
                  <div className="chart-title">
                    Aggregate View Quality Score
                  </div>
                  <MetricValue
                    threshold={qosThreshold}
                    value={qualityScore}
                    greenLight={true}
                    decoration=" %"
                  />
                </div>
              </div>
            </GridItem>
            <GridItem columnStart={5} columnEnd={12}>
              <Stack className="session-kpi-group" fullWidth>
                {kpis.map((kpi, idx) => {
                  return (
                    <div key={kpi.name + idx} className="sessionSectionBase">
                      <div className="metric-chart">
                        <div className="chart-title">{kpi.name}</div>
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
            </GridItem>
          </Grid>
        )}
      </React.Fragment>
    )
  }
}

KpiGrid.propTypes = {
  qualityScore: PropTypes.number.isRequired,
  kpis: PropTypes.array.isRequired,
}
