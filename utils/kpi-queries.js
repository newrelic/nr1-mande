export const kpiIds = [
  'secondsToFirstFrame',
  'videosWithBufferEvents',
  'errorRate',
  'exitsBeforeVideoStart'
];

export const multiFacetChartTitles = {
  videosWithBufferEvents: '% views with buffer events',
  errorRate: '% views with errors',
  exitsBeforeVideoStart: '% of exits before the video starts',
  secondsToFirstFrame: 'Average seconds to first frame',
};

export const generateQueries = (durationInMinutes, eventType, whereClause) => {
  const since = ` SINCE ${durationInMinutes} MINUTES AGO`;
  const sinceCompare = since + ` COMPARE WITH ${durationInMinutes*2} MINUTES AGO`;
  const queries = {
    kpiQueries: {
      videosWithBufferEvents: (compare = false, timeseries = false) => {
        return `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START')/uniqueCount(viewId))*100  as 'videosWithBufferEvents' FROM ${eventType} ${whereClause} ${compare ? sinceCompare : since } ${timeseries ? 'TIMESERIES' : ''}`
      },
      errorRate: (compare = false, timeseries = false) => {
        return `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_ERROR') / uniqueCount(viewId))*100 as 'errorRate' FROM ${eventType} ${whereClause} ${compare ? sinceCompare : since } ${timeseries ? 'TIMESERIES' : ''}`
      },
      exitsBeforeVideoStart: (compare = false, timeseries = false) => {
        return `SELECT ((filter(count(viewId), WHERE actionName = 'CONTENT_REQUEST')-filter(count(viewId), WHERE actionName = 'CONTENT_START'))/ filter(count(viewId), WHERE actionName = 'CONTENT_START'))*100 as 'exitsBeforeVideoStart' FROM ${eventType} ${whereClause} ${compare ? sinceCompare : since } ${timeseries ? 'TIMESERIES' : ''}`
      },
      secondsToFirstFrame: (compare = false, timeseries = false) => {
        return `SELECT average(timeSinceRequested)/1000 as 'secondsToFirstFrame' FROM ${eventType} WHERE actionName = 'CONTENT_START' ${whereClause} ${compare ? sinceCompare : since } ${timeseries ? 'TIMESERIES' : ''}`
      }
    },
    facetFilterQuery: `SELECT count(viewId) FROM ${eventType} ${since}`
  };
  return queries;
}