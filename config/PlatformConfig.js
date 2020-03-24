export default {
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
}