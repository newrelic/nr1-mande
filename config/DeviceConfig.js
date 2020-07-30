
export default {
  title: 'Devices',
  metrics: [
    {
      title: 'App Crashes',
      query: {
        nrql: `SELECT count(*) as 'result' FROM MobileCrash`,
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
      title: 'App Launch Time',
      query: '',
    },
  ],
}