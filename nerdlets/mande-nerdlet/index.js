import React from 'react'

import { PlatformStateContext, NerdGraphQuery, Stack, StackItem } from 'nr1'

import DimensionContainer from './DimensionContainer'
import MetricStackContainer from './MetricStackContainer'
import MetricDetailContainer from './MetricDetailContainer'
import metricConfigs from './MetricConfig'

export default class Mande extends React.Component {
  static contextType = PlatformStateContext

  state = {
    accountId: null,
    threshold: 'All',
    selectedMetric: null,
    selectedStack: null,
  }

  /** INITIALIZE DATA ***************** */
  dimensionConfigs = [
    {
      name: 'Accounts',
      mandatory: true,
      data: async () => {
        const { data } = await this.query(`{
            actor {
              accounts {
                name
                id
              }
            }
          }`)
        const { accounts } = data.actor
        return accounts
      },
      handler: account => {
        this.setState({ accountId: account.id })
      },
    },
    {
      name: 'Level',
      mandatory: true,
      data() {
        return [
          { id: 1, name: 'All' },
          { id: 2, name: 'Warning' },
          { id: 3, name: 'Critical' },
        ]
      },
      handler: level => {
        this.setState({ threshold: level.name })
      },
    },
  ]

  query = async graphql => {
    return await NerdGraphQuery.query({ query: graphql })
  }

  onToggleMetric = selected => {
    const currentMetric = this.state.selectedMetric

    if (currentMetric && currentMetric === selected)
      this.setState({ selectedMetric: null })
    else {
      const stack = metricConfigs.filter(config => {
        const metricFound =
          config.metrics &&
          config.metrics.filter(metric => metric.title === selected)

        if (metricFound && metricFound.length > 0) return config
      })

      this.setState({ selectedMetric: selected, selectedStack: stack[0] })
    }
  }

  onToggleDetailView = stackTitle => {
    const currentStack = this.state.selectedStack

    if (currentStack && currentStack.title === stackTitle) {
      this.setState({ selectedMetric: null, selectedStack: null })
    } else {
      const stack = metricConfigs.filter(config => config.title === stackTitle)
      this.setState({ selectedStack: stack[0] })
    }
  }

  render() {
    console.info('mande-nerdlet.index.render')

    const { accountId, threshold, selectedMetric, selectedStack } = this.state
    const {
      timeRange: { duration },
    } = this.context
    const durationInMinutes = duration / 1000 / 60

    return (
      <div className="container">
        <DimensionContainer configs={this.dimensionConfigs} />
        {accountId && (
          <Stack
            fullWidth={true}
            directionType={Stack.DIRECTION_TYPE.VERTICAL}
            horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
            gapType={Stack.GAP_TYPE.SMALL}
            className="main-panel"
          >
            <StackItem grow>
              <MetricStackContainer
                accountId={accountId}
                threshold={threshold}
                duration={durationInMinutes}
                metricConfigs={metricConfigs}
                selectedStack={selectedStack}
                toggleMetric={this.onToggleMetric}
                toggleDetails={this.onToggleDetailView}
              />
            </StackItem>
            {selectedStack && (
              <StackItem grow>
                <MetricDetailContainer
                  accountId={accountId}
                  duration={durationInMinutes}
                  threshold={threshold}
                  activeMetric={selectedMetric}
                  toggleMetric={this.onToggleMetric}
                  stack={selectedStack}
                />
              </StackItem>
            )}
          </Stack>
        )}
      </div>
    )
  }
}
