const kpiIds = [
  'secondsToFirstFrame',
  'videosWithBufferEvents',
  'errorRate',
  'exitsBeforeVideoStart'
];

const multiFacetChartTitles = {
  videosWithBufferEvents: '% views with buffer events',
  errorRate: '% views with errors',
  exitsBeforeVideoStart: '% of exits before the video starts',
  secondsToFirstFrame: 'Average seconds to first frame',
};

const generateQueries = (durationInMinutes, eventType, whereClause) => {
  const since = ` SINCE ${durationInMinutes} MINUTES AGO`;
  const sinceCompare = since + ` COMPARE WITH ${durationInMinutes*2} MINUTES AGO`;
  const queries = {
    kpiQueries: {
      videosWithBufferEvents: (compare = false, timeseries = false) => {
        return `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START')/uniqueCount(viewId))*100  as '% Videos with Buffer Events' FROM ${eventType} ${whereClause} ${compare ? sinceCompare : since } ${timeseries ? 'TIMESERIES' : ''}`
      },
      errorRate: (compare = false, timeseries = false) => {
        return `SELECT (filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_ERROR') / uniqueCount(viewId))*100 as 'Error Rate' FROM ${eventType} ${whereClause} ${compare ? sinceCompare : since } ${timeseries ? 'TIMESERIES' : ''}`
      },
      exitsBeforeVideoStart: (compare = false, timeseries = false) => {
        return `SELECT ((filter(count(viewId), WHERE actionName = 'CONTENT_REQUEST')-filter(count(viewId), WHERE actionName = 'CONTENT_START'))/ filter(count(viewId), WHERE actionName = 'CONTENT_START'))*100 as '% Exits before Video Start' FROM ${eventType} ${whereClause} ${compare ? sinceCompare : since } ${timeseries ? 'TIMESERIES' : ''}`
      },
      secondsToFirstFrame: (compare = false, timeseries = false) => {
        return `SELECT average(timeSinceRequested)/1000 as 'Seconds to First Frame' FROM ${eventType} WHERE actionName = 'CONTENT_START' ${whereClause} ${compare ? sinceCompare : since } ${timeseries ? 'TIMESERIES' : ''}`
      }
    },
    facetFilterQuery: `SELECT count(viewId) FROM ${eventType} ${since}`
  };
  return queries;
}

export default { generateQueries, kpiIds, multiFacetChartTitles };