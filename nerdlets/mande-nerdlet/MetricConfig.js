import VideoDetail from '../../components/metric-detail/VideoDetail'

export default [
  {
    title: 'Users',
    navigateTo: '',
    metrics: [
      {
        title: '# of Viewers',
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
    detailView: props => {
      return (
        <VideoDetail accountId={props.accountId} duration={props.duration} />
      )
    },
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
    title: 'Ads',
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