import React from 'react'
import { Stack, navigation } from 'nr1'
import MetricStack from '../../components/metric/MetricStack'

const mandeContainer = props => {
  /** NAVIGATION CONFIGURATION ******************* */
  const getNavigation = target => {
    return navigation.getReplaceNerdletLocation(target)
  }

  const videoQosNerdlet = () => {
    return {
      id: 'video-qos-nerdlet',
      urlStateOptions: '',
    }
  }

  /** INITIALIZE METRIC DEFINITIONS ***************** */
  const metricConfigs = [
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
            critical: 10,
            warning: 30,
            type: 'below',
          },
          invertCompareTo: 'true',
          query: {
            nrql: `SELECT count(*) FROM PageAction, MobileVideo, RokuVideo  WHERE actionName IN ('CONTENT_START', 'CONTENT_NEXT')`,
            lookup: 'count',
          }
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
            nrql: `SELECT filter(count(*), WHERE eventType() = 'JavaScriptError') / filter(count(*), WHERE eventType() = 'PageView') * 100 FROM JavaScriptError,PageView`,
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
            nrql: `SELECT percentage(count(*), where httpResponseCode like '5%') FROM Transaction`,
            lookup: 'result',
          },
        },
        {
          title: 'Non 5xx Error Rate',
          query: {
            nrql: `SELECT percentage(count(*), where httpResponseCode like '4%') FROM Transaction`,
            lookup: 'result',
          },
        },
        {
          title: 'Latency 90th Percentile',
          query: {
            nrql: `SELECT percentile(duration, 90) FROM Transaction`,
            lookup: 'percentiles',
          },
        },
      ],
    },
    {
      title: 'Video',
      navigateTo: getNavigation(videoQosNerdlet()),
      metrics: [
        {
          title: 'Player Ready',
          query: {
            nrql: `SELECT percentile(timeSinceLoad, 50) as 'Player Ready' FROM PageAction`,
            lookup: 'percentiles',
          },
        },
        {
          title: 'Video Start Failure',
          query: {
            nrql: `SELECT count(*) AS 'Video Start Failure' FROM PageAction, MobileVideo, RokuVideo  WHERE actionName = 'CONTEN_ERROR' and contentPlayhead = 0`,
            lookup: 'count',
          },
        },
        {
          title: 'Exit Before Video Start',
          query: {
            nrql: `SELECT filter(count(*), WHERE actionName IN ('CONTENT_REQUEST', 'CONTENT_NEXT')) - filter(count(*), WHERE actionName = 'CONTENT_START') as 'Exits Before Video Start' FROM PageAction, MobileVideo, RokuVideo`,
            lookup: 'result',
          },
        },
        {
          title: 'Time to First Frame',
          query: {
            nrql: `SELECT percentile(timeSinceRequested/1000, 50) as 'Time To First Frame' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'CONTENT_START'`,
            lookup: 'percentiles',
          },
        },
        {
          title: 'Rebuffer Ratio',
          query: {
            nrql: `SELECT filter(sum(timeSinceBufferBegin), WHERE actionName = 'CONTENT_BUFFER_END' and isInitialBuffering = 0) / filter(sum(playtimeSinceLastEvent), WHERE contentPlayhead is not null) as 'Rebuffer Ratio' FROM PageAction, MobileVideo, RokuVideo`,
            lookup: 'result',
          },
        },
        {
          title: 'Interruption Ratio',
          query: {
            nrql: `SELECT filter(count(*), where actionName = 'CONTENT_BUFFER_START') / filter(count(*), where actionName = 'CONTENT_START') AS 'Interruption Ratio' FROM PageAction, MobileVideo, RokuVideo`,
            lookup: 'result',
          },
        },
      ],
    },
    {
      title: 'CDN',
      navigateTo: '',
      metrics: [
        {
          title: '...',
          query: '',
        },
      ],
    },
    {
      title: 'Origin/Packaging',
      navigateTo: '',
      metrics: [
        {
          title: '...',
          query: '',
        },
      ],
    },
    {
      title: 'Ingest/Encode',
      navigateTo: '',
      metrics: [
        {
          title: '...',
          query: '',
        },
      ],
    },
    {
      title: 'Content/Source',
      navigateTo: '',
      metrics: [
        {
          title: '...',
          query: '',
        },
      ],
    },
  ]

  // convert metricStacks from state into components
  const { accountId } = props
  const metricStacks = metricConfigs
    .map(config => {
      return [...Array(config)].map((_, idx) => {
        return (
          <MetricStack
            key={config.title + idx}
            config={config}
            accountId={accountId}
            duration={props.duration}
          />
        )
      })
    })
    .reduce((arr, val) => {
      return arr.concat(val)
    }, [])

  return (
    <Stack
      fullWidth={true}
      directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
      horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY}
    >
      {metricStacks}
    </Stack>
  )
}

export default mandeContainer
