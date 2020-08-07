
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
}