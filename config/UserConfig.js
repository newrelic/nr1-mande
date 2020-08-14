export default {
  title: 'Audience',
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
      title: 'Total View Time (m)',
      threshold: {
        critical: 200,
        warning: 300,
        type: 'below'
      },
      query: {
        nrql: `SELECT sum(playtimeSinceLastEvent)/60000 as 'result' from PageAction`,
        lookup: 'result',
      }
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
}