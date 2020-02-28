import React from 'react'

import { PlatformStateContext, NerdGraphQuery, Stack, StackItem } from 'nr1'

import DimensionContainer from './DimensionContainer'
import MetricStackContainer from './MetricStackContainer'
import MetricDetailContainer from './MetricDetailContainer'

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

  metricConfigs = [
    {
      title: 'Users',
      navigateTo: '',
      metrics: [
        {
          title: '# of Viewers',
          query: '',
        },
        {
          title: 'Stream Joins',
          threshold: {
            critical: 40,
            warning: 43,
            type: 'below',
          },
          invertCompareTo: 'true',
          query: {
            nrql: `SELECT count(*)  as 'result' FROM PageAction, MobileVideo, RokuVideo  WHERE actionName IN ('CONTENT_START', 'CONTENT_NEXT')`,
            lookup: 'result',
          },
        },
        {
          title: 'Total View Time',
          query: '',
        },
      ],
    },
    {
      title: 'Platform/Client/App',
      navigateTo: '',
      metrics: [
        {
          title: 'Crash Rate',
          query: '',
        },
        {
          title: 'Javascript Error Rate',
          query: {
            nrql: `SELECT filter(count(*), WHERE eventType() = 'JavaScriptError') / filter(count(*), WHERE eventType() = 'PageView') * 100  as 'result' FROM JavaScriptError,PageView`,
            lookup: 'result',
          },
        },
        {
          title: 'App Launch Time',
          query: '',
        },
      ],
    },
    {
      title: 'APIs',
      navigateTo: '',
      metrics: [
        {
          title: '5xx Error Rate',
          query: {
            nrql: `SELECT percentage(count(*), where httpResponseCode like '5%') as 'result' FROM Transaction`,
            lookup: 'result',
          },
        },
        {
          title: 'Non 5xx Error Rate',
          threshold: {
            critical: 5.5,
            warning: 4.9,
          },
          query: {
            nrql: `SELECT percentage(count(*), where httpResponseCode like '4%') as 'result' FROM Transaction`,
            lookup: 'result',
          },
        },
        {
          title: 'Latency 90th Percentile',
          query: {
            nrql: `SELECT percentile(duration, 90) as 'percentile' FROM Transaction`,
            lookup: 'percentile',
          },
        },
      ],
    },
    {
      title: 'Video',
      navigateTo: '',
      metrics: [
        {
          title: 'Player Ready',
          threshold: {
            critical: 10,
            warning: 5,
          },
          query: {
            nrql: `SELECT percentile(timeSinceLoad, 50) as 'percentile' FROM PageAction`,
            lookup: 'percentile',
          },
        },
        {
          title: 'Video Start Failure',
          query: {
            nrql: `SELECT count(*) AS 'result' FROM PageAction, MobileVideo, RokuVideo  WHERE actionName = 'CONTEN_ERROR' and contentPlayhead = 0`,
            lookup: 'result',
          },
        },
        {
          title: 'Exit Before Video Start',
          query: {
            nrql: `SELECT filter(count(*), WHERE actionName IN ('CONTENT_REQUEST', 'CONTENT_NEXT')) - filter(count(*), WHERE actionName = 'CONTENT_START') as 'result' FROM PageAction, MobileVideo, RokuVideo`,
            lookup: 'result',
          },
        },
        {
          title: 'Time to First Frame',
          threshold: {
            critical: 5,
            warning: 3,
          },
          query: {
            nrql: `SELECT percentile(timeSinceRequested/1000, 50) as 'percentile' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'CONTENT_START'`,
            lookup: 'percentile',
          },
        },
        {
          title: 'Rebuffer Ratio',
          query: {
            nrql: `SELECT filter(sum(timeSinceBufferBegin), WHERE actionName = 'CONTENT_BUFFER_END' and isInitialBuffering = 0) / filter(sum(playtimeSinceLastEvent), WHERE contentPlayhead is not null) as 'result' FROM PageAction, MobileVideo, RokuVideo`,
            lookup: 'result',
          },
        },
        {
          title: 'Interruption Ratio',
          query: {
            nrql: `SELECT filter(count(*), where actionName = 'CONTENT_BUFFER_START') / filter(count(*), where actionName = 'CONTENT_START') AS 'result' FROM PageAction, MobileVideo, RokuVideo`,
            lookup: 'result',
          },
        },
      ],
    },
    {
      title: 'CDN',
      navigateTo: '',
    },
    {
      title: 'Origin/Packaging',
      navigateTo: '',
    },
    {
      title: 'Ingest/Encode',
      navigateTo: '',
    },
    {
      title: 'Content/Source',
      navigateTo: '',
    },
  ]

  query = async graphql => {
    return await NerdGraphQuery.query({ query: graphql })
  }

  onSelectMetric = selected => {
    const stack = this.metricConfigs.filter(config => {
      const metricFound =
        config.metrics &&
        config.metrics.filter(metric => metric.title === selected)

      if (metricFound && metricFound.length > 0) return config
    })

    this.setState({ selectedMetric: selected, selectedStack: stack[0] })
  }

  render() {
    console.info('mande-nerdlet.index.render')

    const { accountId, threshold, selectedStack } = this.state
    const {
      timeRange: { duration },
    } = this.context
    const durationInMinutes = duration / 1000 / 60

    return (
      <React.Fragment>
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
                metricConfigs={this.metricConfigs}
                selectedStack={selectedStack}
                selectMetric={this.onSelectMetric}
              />
            </StackItem>
            {selectedStack && (
              <StackItem grow>
                <MetricDetailContainer stack={selectedStack} />
              </StackItem>
            )}
          </Stack>
        )}
      </React.Fragment>
    )
  }
}
