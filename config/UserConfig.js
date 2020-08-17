export default {
  title: 'Audience',
  metrics: [
    {
      title: '# of Active Viewers',
      threshold: {
        critical: 1500,
        warning: 1800,
        type: 'below',
      },
      invertCompareTo: 'true',
      query: {
        nrql: `SELECT uniqueCount(userId) as 'result' FROM PageAction where actionName = 'CONTENT_START'`,
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
      invertCompareTo: 'true',
      threshold: {
        critical: 150,
        warning: 175,
        type: 'below'
      },
      query: {
        nrql: `SELECT sum(playtimeSinceLastEvent)/60000 as 'result' from PageAction`,
        lookup: 'result',
      }
    },
    {
      title: 'Crash-free User % (Mobile)',
      invertCompareTo: 'true',
      threshold: {
        critical: 98,
        warning: 96,
        type: 'below'
      },
      query: {
        nrql: `SELECT (1-(uniqueCount(MobileCrash.uuid) / uniqueCount(MobileSession.uuid))) * 100 AS 'result' FROM MobileCrash, MobileSession`,
        lookup: 'result',
      },
    },
    {
      title: 'Error-free User %',
      invertCompareTo: 'true',
      threshold: {
        critical: 98,
        warning: 96,
        type: 'below'
      },
      query: {
        nrql: `FROM PageAction SELECT (1- (filter(uniqueCount(userId), WHERE actionName = 'CONTENT_ERROR') / uniqueCount(userId))) * 100 as 'result'`,
        lookup: 'result',
      },
    },
    {
      title: 'Rebuffer-free User %',
      invertCompareTo: 'true',
      threshold: {
        critical: 98,
        warning: 96,
        type: 'below'
      },
      query: {
        nrql: `FROM PageAction SELECT (1- (filter(uniqueCount(userId), WHERE actionName = 'CONTENT_BUFFER_START' and contentPlayhead = 0) / uniqueCount(userId))) * 100 as 'result'`,
        lookup: 'result',
      },
    },
  ],
}