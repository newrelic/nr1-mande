import React from 'react'
import { Grid, GridItem, ChartGroup } from 'nr1'
import Chart from './Chart'

const chartGrid = props => {
  const { accountId, duration, chartDefs, actionMenuSelect } = props

  return (
    <ChartGroup>
      <div className="detail-grid">
        {chartDefs && (
          <Grid spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}>
            {chartDefs.map((chartDef, idx) => {
              return (
                <GridItem
                  key={chartDef.title + idx}
                  columnStart={chartDef.columnStart}
                  columnEnd={chartDef.columnEnd}
                >
                  <Chart
                    accountId={accountId}
                    duration={duration}
                    chartDef={chartDef}
                    actionMenuSelect={actionMenuSelect}
                  />
                </GridItem>
              )
            })}
          </Grid>
        )}
      </div>
    </ChartGroup>
  )
}

export default chartGrid
