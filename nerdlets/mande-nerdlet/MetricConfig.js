import VideoOverview from '../../components/metric-detail/VideoOverview'
import VideoDetail from '../../components/metric-detail/VideoDetail'

export default [
  {
    title: 'Users',
    metrics: [
      {
        title: '# of Active Viewers',
        invertCompareTo: 'true',
        query: {
          nrql: `SELECT uniqueCount(session) as 'result' FROM PageAction WHERE actionName LIKE 'CONTENT_%' AND actionName not in ('CONTENT_END','CONTENT_ERROR')`,
          lookup: 'result',
        },
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
      {
        title: 'User Error Rate',
        threshold: {
          critical: 2,
          warning: 1,
        },
        query: {
          nrql: `SELECT filter(uniqueCount(session), WHERE actionName = 'CONTENT_ERROR') / filter(uniqueCount(session), WHERE eventType() = 'PageAction' AND actionName like 'CONTENT_*') * 100  as 'result' FROM PageAction`,
          lookup: 'result',
        },
      },
    ],
  },
  {
    title: 'Platform/Client/App',
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
    overview: props => {
      return (
        <VideoOverview accountId={props.accountId} duration={props.duration} />
      )
    },
    detailView: props => {
      return (
        <VideoDetail
          accountId={props.accountId}
          duration={props.duration}
          stack={props.stack}
          activeMetric={props.activeMetric}
        />
      )
    },
    metrics: [
      {
        title: 'Player Ready (Seconds)',
        threshold: {
          critical: 10,
          warning: 5,
        },
        query: {
          nrql: `SELECT percentile(timeSinceLoad, 50) as 'percentile' FROM PageAction`,
          lookup: 'percentile',
        },
        detailConfig: [
          {
            nrql: `SELECT average(timeSinceLoad) as 'Time to Player Ready' FROM PageAction TIMESERIES MAX `,
            columnStart: 1,
            columnEnd: 6,
            chartSize: 'small',
            chartType: 'scatter',
            title: 'Time To First Frame (Average)',
            useSince: true,
          },
          {
            nrql: `SELECT percentile(timeSinceLoad, 50) as 'Time To Player Ready' FROM PageAction, MobileVideo, RokuVideo TIMESERIES `,
            columnStart: 7,
            columnEnd: 10,
            chartSize: 'small',
            chartType: 'line',
            title: 'Player Ready (Percentile Comparison)',
            useSince: true,
            useCompare: true,
          },
          {
            nrql: `SELECT count(session) as 'Viewers' FROM PageAction, MobileVideo, RokuVideo WHERE timeSinceLoad > 0 AND actionName = 'CONTENT_START'`,
            columnStart: 11,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'billboard',
            title: '# of Viewers',
            useSince: true,
            useCompare: true,
          },
          {
            nrql: `SELECT average(timeSinceLoad) as 'Time To Player Ready (Average)' FROM PageAction, MobileVideo, RokuVideo FACET session`,
            columnStart: 1,
            columnEnd: 6,
            chartSize: 'large',
            chartType: 'bar',
            title: 'Sessions (Average Time To Player Ready)',
            useSince: true,
            click: 'openSession',
          },
          {
            nrql: `SELECT histogram(timeSinceLoad, width: 15, buckets: 50) FROM PageAction, MobileVideo, RokuVideo FACET hourOf(timestamp) SINCE 1 day ago`,
            columnStart: 7,
            columnEnd: 12,
            chartSize: 'large',
            chartType: 'heatmap',
            title: 'Average Time To Player Ready',
          },
        ],
      },
      {
        title: 'Video Start Failure',
        query: {
          nrql: `SELECT count(*) AS 'result' FROM PageAction, MobileVideo, RokuVideo  WHERE actionName = 'CONTEN_ERROR' and contentPlayhead = 0`,
          lookup: 'result',
        },
      },
      {
        title: 'Video Error Rate',
        threshold: {
          critical: 1,
          warning: 0.5,
        },
        query: {
          nrql: `SELECT filter(count(*), WHERE actionName = 'CONTENT_ERROR') / filter(count(*), WHERE actionName = 'CONTENT_REQUEST') AS 'result' FROM PageAction, MobileVideo, RokuVideo`,
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
        detailConfig: [
          {
            nrql: `SELECT average(timeSinceRequested) as 'Time To First Frame' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'CONTENT_START' TIMESERIES MAX WHERE timeSinceRequested > 10000`,
            columnStart: 1,
            columnEnd: 6,
            chartSize: 'small',
            chartType: 'scatter',
            title: 'Time To First Frame (Average)',
            useSince: true,
          },
          {
            nrql: `SELECT percentile(timeSinceRequested/1000, 50) as 'Time To First Frame' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'CONTENT_START' TIMESERIES `,
            columnStart: 7,
            columnEnd: 10,
            chartSize: 'small',
            chartType: 'line',
            title: 'Time To First Frame (Percentile Comparison)',
            useSince: true,
            useCompare: true,
          },
          {
            nrql: `SELECT count(session) as 'Viewers' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'CONTENT_START'`,
            columnStart: 11,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'billboard',
            title: '# of Viewers',
            useSince: true,
            useCompare: true,
          },
          {
            nrql: `SELECT average(timeSinceRequested/1000) as 'Time To First Frame (Average)' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'CONTENT_START' FACET session`,
            columnStart: 1,
            columnEnd: 6,
            chartSize: 'large',
            chartType: 'bar',
            title: 'Sessions (Average Time To First Frame)',
            useSince: true,
            click: 'openSession',
          },
          {
            nrql: `SELECT histogram(timeSinceRequested/1000, width: 15, buckets: 50) FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'CONTENT_START' FACET hourOf(timestamp) SINCE 1 day ago`,
            columnStart: 7,
            columnEnd: 12,
            chartSize: 'large',
            chartType: 'heatmap',
            title: 'Average Time To First Frame',
          },
        ],
      },
      {
        title: 'Rebuffer Ratio (Seconds)',
        query: {
          nrql: `SELECT filter(sum(timeSinceBufferBegin), WHERE actionName = 'CONTENT_BUFFER_END' and isInitialBuffering = 0) / filter(sum(playtimeSinceLastEvent), WHERE contentPlayhead is not null) as 'result' FROM PageAction, MobileVideo, RokuVideo`,
          lookup: 'result',
        },
      },
      {
        title: 'Average Bitrate',
        query: {
          nrql: `SELECT filter(sum(timeSinceBufferBegin), WHERE actionName = 'CONTENT_BUFFER_END' and isInitialBuffering = 0) / filter(sum(playtimeSinceLastEvent), WHERE contentPlayhead is not null) as 'result' FROM PageAction, MobileVideo, RokuVideo`,
          lookup: 'result',
        },
      },
      // {
      //   title: 'Rebuffer Rate',
      //   query: {
      //     nrql: `SELECT filter(count(*), where actionName = 'CONTENT_BUFFER_START') / filter(count(*), where actionName = 'CONTENT_START') AS 'result' FROM PageAction, MobileVideo, RokuVideo`,
      //     lookup: 'result',
      //   },
      // },
      {
        title: 'Rendition Change Rate',
        query: {
          nrql: `SELECT filter(count(*), WHERE actionName = 'CONTENT_RENDITION_CHANGE') / filter(count(*), WHERE actionName = 'CONTENT_START') AS 'result' FROM PageAction, MobileVideo, RokuVideo`,
          lookup: 'result',
        },
      },
      // { // is this an operationally relevant metric (i.e. does it indicate some kind of issue with video delivery?)
      //   title: 'Exit Before Video Start',
      //   query: {
      //     nrql: `SELECT filter(count(*), WHERE actionName IN ('CONTENT_REQUEST', 'CONTENT_NEXT')) - filter(count(*), WHERE actionName = 'CONTENT_START') as 'result' FROM PageAction, MobileVideo, RokuVideo`,
      //     lookup: 'result',
      //   },
      // },
    ],
  },
  {
    title: 'Ads',
  },
  {
    title: 'CDN',
  },
  {
    title: 'Origin/Packaging',
  },
  {
    title: 'Ingest/Encode',
  },
  {
    title: 'Content/Source',
  },
]