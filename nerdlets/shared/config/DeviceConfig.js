export default {
  title: 'Frontend (Device, App, HTTP)',
  metrics: [
    {
      title: 'App Crashes - Mobile',
      query: {
        nrql: `SELECT count(*) as 'result' FROM MobileCrash`,
        lookup: 'result',
      },
    },
    {
      title: 'App Crashes - Android',
      query: {
        nrql: `SELECT count(*) as 'result' FROM MobileCrash where appName like \'%Android%\'`,
        lookup: 'result',
      },
    },
    {
      title: 'App Crashes - iOS',
      query: {
        nrql: `SELECT count(*) as 'result' FROM MobileCrash where appName like \'%iOS%\'`,
        lookup: 'result',
      },
    },
    {
      title: 'App Launch Time',
      query: '',
    },
    {
      title: 'Mobile HTTP: Error Free Users',
      query: {
        nrql: `SELECT (1-filter(uniqueCount(MobileRequestError.uuid), WHERE errorType='HTTPError') / uniqueCount(MobileSession.uuid)) * 100 as 'result' FROM MobileRequestError, MobileSession`,
        lookup: 'result',
      },
    },
    {
      title: 'Web HTTP: Error Free Sessions',
      invertCompareTo: 'true',
      query: {
        nrql: `SELECT (1 - uniqueCount(JavaScriptError.session) / uniqueCount(PageView.session)) * 100 as 'result' FROM JavaScriptError, PageView`,
        lookup: 'result',
      },
    },
    {
      title: 'Javascript Error Rate',
      query: {
        nrql: `SELECT filter(count(*), WHERE eventType() = 'JavaScriptError') / filter(count(*), WHERE eventType() = 'PageView') * 100  as 'result' FROM JavaScriptError,PageView`,
        lookup: 'result',
      },
    },
    {
      title: 'Mobile Request Throughput (ppm)',
      query: {
        nrql: `FROM MobileRequest SELECT rate(count(*), 1 minute) as result`,
        lookup: 'result',
      },
    },
    {
      title: 'SPA Throughput (ppm)',
      query: {
        nrql: `SELECT rate( count(*), 1 minute )  as 'result' FROM BrowserInteraction`,
        lookup: 'result',
      },
    },
    {
      title: 'Response Time (s): Mobile',
      query: {
        nrql: `SELECT percentile(responseTime, 50) as 'percentile' from MobileRequest`,
        lookup: 'percentile',
      },
    },
    {
      title: 'SPA Load Time (s)',
      query: {
        nrql: `SELECT percentile(duration, 50) as 'percentile' FROM BrowserInteraction`,
        lookup: 'percentile',
      },
    },
  ],
  overviewDashboard: [
    {
      nrql: `SELECT percentage(uniqueCount(sessionId), WHERE category = 'Crash') as 'Crash rate' FROM MobileSession, MobileCrash TIMESERIES `,
      columnStart: 1,
      columnEnd: 6,
      chartSize: 'small',
      chartType: 'area',
      title: 'Crash Rate - Mobile',
      useSince: true,
    },
    {
      nrql: `SELECT uniqueCount(MobileCrash.uuid) / uniqueCount(MobileSession.uuid) * 100 AS '% Users' FROM MobileCrash, MobileSession TIMESERIES `,
      columnStart: 7,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'line',
      title: '% Users Impacted by Mobile Crash',
      useSince: true,
    },
    {
      nrql: `SELECT uniqueCount(uuid) AS 'Users' FROM MobileSession FACET appVersion`,
      columnStart: 1,
      columnEnd: 4,
      chartSize: 'small',
      chartType: 'pie',
      title: 'Mobile App Version Usage',
      useSince: true,
    },
    {
      nrql: `SELECT (1-filter(uniqueCount(MobileRequestError.uuid), WHERE errorType='HTTPError') / uniqueCount(MobileSession.uuid)) * 100 as 'Percent' FROM MobileRequestError, MobileSession TIMESERIES`,
      columnStart: 5,
      columnEnd: 8,
      chartSize: 'small',
      chartType: 'area',
      title: 'Error-free % - Mobile Requests',
      useSince: true,
    },
    {
      nrql: `SELECT average(responseTime) from MobileRequest TIMESERIES `,
      columnStart: 9,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'area',
      title: 'Mobile Request Time',
      useSince: true,
    },
    {
      nrql: `FROM MobileRequest SELECT rate(count(*), 1 minute) TIMESERIES`,
      columnStart: 1,
      columnEnd: 4,
      chartSize: 'small',
      chartType: 'area',
      title: 'Mobile Request Throughput',
      useSince: true,
    },
    {
      nrql: `SELECT (1 - uniqueCount(JavaScriptError.session) / uniqueCount(PageView.session)) * 100 as 'Percent' FROM JavaScriptError, PageView TIMESERIES`,
      columnStart: 5,
      columnEnd: 8,
      chartSize: 'small',
      chartType: 'area',
      title: 'Error-free % - Web HTTP Requests',
      useSince: true,
    },
    {
      nrql: `SELECT percentile(duration, 50) as 'seconds' FROM BrowserInteraction TIMESERIES `,
      columnStart: 9,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'area',
      title: 'SPA Load Time',
      useSince: true,
    },
    {
      nrql: `SELECT rate( count(*), 1 minute )  as 'ppm' FROM BrowserInteraction TIMESERIES`,
      columnStart: 1,
      columnEnd: 4,
      chartSize: 'small',
      chartType: 'area',
      title: 'SPA Throughput',
      useSince: true,
    },
  ],
}