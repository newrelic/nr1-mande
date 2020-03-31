import VideoOverview from '../components/metric-detail/VideoOverview'
import VideoDetail from '../components/metric-detail/VIdeoDetail'

export default {
  title: 'Video',
  eventTypes: [
    {
      event: 'PageAction',
      eventSelector: { attribute: 'Delivery Type', value: 'Web' },
      attributes: [
        'appName',
        'playerVersion',
        'playerName',
        'isAd',
        'contentIsLive',
        'contentTitle',
        'contentSrc',
        'asnOrganization',
        'city',
        'countryCode',
        'regionCode',
        'userAgentName',
        'userAgentOS',
        'userAgentVersion',
      ],
    },
    {
      event: 'MobileVideo',
      eventSelector: { attribute: 'Delivery Type', value: 'Mobile' },
      attributes: [
        'appName',
        'playerVersion',
        'playerName',
        'isAd',
        'contentIsLive',
        'contentTitle',
        'contentSrc',
        'asnOrganization',
        'city',
        'countryCode',
        'regionCode',
        'device',
        'deviceGroup',
        'deviceType',
        'osName',
        'osVersion',
      ],
    },
  ],
  overview: (props, filters) => {
    return (
      <VideoOverview
        accountId={props.accountId}
        duration={props.duration}
        filters={filters}
      />
    )
  },
  detailView: (props, filters) => {
    return (
      <VideoDetail
        accountId={props.accountId}
        duration={props.duration}
        stack={props.stack}
        activeMetric={props.activeMetric}
        filters={filters}
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
        nrql: `SELECT percentile(timeSinceLoad, 50) as 'percentile' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'PLAYER_READY'`,
        lookup: 'percentile',
      },
      detailConfig: [
        {
          nrql: `SELECT average(timeSinceLoad) as 'Player Ready Time' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'PLAYER_READY' `,
          facets: `deviceType`,
          columnStart: 1,
          columnEnd: 2,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Player Ready Time (50%)',
          useSince: true,
        },
        {
          nrql: `SELECT average(timeSinceLoad) as 'Player Ready Time' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'PLAYER_READY' TIMESERIES MAX `,
          columnStart: 3,
          columnEnd: 7,
          chartSize: 'medium',
          chartType: 'scatter',
          title: 'Player Ready Time (Average)',
          useSince: true,
        },
        {
          nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT percentile(timeSinceLoad, 50) WHERE actionName = 'PLAYER_READY' TIMESERIES auto `,
          facets: `deviceType`,
          columnStart: 8,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'area',
          title: 'Player Ready Time by Device Type',
          useSince: true,
        },
        {
          nrql: `SELECT average(timeSinceLoad) as 'Time To Player Ready (Average)' FROM PageAction, MobileVideo, RokuVideo `,
          facets: `session`,
          columnStart: 1,
          columnEnd: 6,
          chartSize: 'medium',
          chartType: 'bar',
          title: 'Average Player Ready Time by Session ID',
          useSince: true,
          click: 'openSession',
        },
        {
          nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT histogram(timeSinceLoad, buckets: 10, width: 20) WHERE actionName = 'PLAYER_READY' `,
          facets: `deviceType`,
          columnStart: 7,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'heatmap',
          title: 'Player Ready Time by Device Type',
          useSince: true,
        },
      ],
    },
    {
      title: 'Video Start Failure',
      query: {
        nrql: `SELECT count(*) AS 'result' FROM PageAction, MobileVideo, RokuVideo  WHERE actionName = 'CONTENT_ERROR' and contentPlayhead = 0`,
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
      detailConfig: [
        {
          nrql: `SELECT filter(count(*), WHERE actionName = 'CONTENT_ERROR') / filter(count(*), WHERE actionName = 'CONTENT_REQUEST') AS 'Video Error Rate' FROM PageAction, MobileVideo, RokuVideo TIMESERIES MAX `,
          columnStart: 1,
          columnEnd: 10,
          chartSize: 'small',
          chartType: 'line',
          title: 'Video Error Rate',
          useSince: true,
          useCompare: true,
        },
        {
          nrql: `SELECT count(session) as 'Viewers' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'CONTENT_ERROR'`,
          columnStart: 11,
          columnEnd: 12,
          chartSize: 'small',
          chartType: 'billboard',
          title: '# of Viewers',
          useSince: true,
          useCompare: true,
        },
        {
          nrql: `SELECT average(timeSinceLoad) as 'Sessions' FROM PageAction, MobileVideo, RokuVideo FACET session WHERE actionName = 'CONTENT_ERROR'`,
          columnStart: 1,
          columnEnd: 12,
          chartSize: 'large',
          chartType: 'bar',
          title: 'Sessions with Errors (Average Time To Player Ready)',
          useSince: true,
          click: 'openSession',
        },
      ],
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
          nrql: `SELECT average(timeSinceRequested) as 'Time To First Frame' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'CONTENT_START' TIMESERIES MAX `,
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
}
