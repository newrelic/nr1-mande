import React from 'react'
import PropTypes from 'prop-types'
import { isEqual } from 'lodash'
import { Grid, GridItem } from 'nr1'
import Metric from '../metric/Metric'

export default class QosKpiGrid extends React.Component {

  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(nextProps.kpis, this.props.kpis)) return true
    else return false
  }

  render() {
    const { qualityScore, kpis, threshold } = this.props

    return (
      <React.Fragment>
        {kpis && (
          <Grid className="session-user-kpis">
            <GridItem columnStart={1} columnEnd={4}>
              <div className="session-qos-base">
                <Metric
                  metric={{
                    value: qualityScore,
                    title: 'Aggregate View Quality Score',
                    decoration: ' %',
                  }}
                  threshold={{ ...threshold, showGreenLight: true }}
                  showTooltip={true}
                  valueSize="large"
                />
              </div>
            </GridItem>
            <GridItem columnStart={5} columnEnd={12}>
              <div className="session-kpi-group">
                {kpis.map((kpi, idx) => {
                  const value = kpi.value / kpi.viewCount
                  return (
                    <div key={kpi.name + idx} className="session-kpi">
                      <Metric
                        metric={{
                          value: value,
                          title: kpi.name,
                        }}
                        threshold={kpi.threshold}
                        showTooltip={true}
                        valueSize="large"
                      />
                    </div>
                  )
                })}
              </div>
            </GridItem>
          </Grid>
        )}
      </React.Fragment>
    )
  }
}

QosKpiGrid.propTypes = {
  qualityScore: PropTypes.number.isRequired,
  kpis: PropTypes.array.isRequired,
  threshold: PropTypes.object.isRequired,
}
