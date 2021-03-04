export default {
  title: 'Ads',
  eventTypes: [
    {
      event: 'Global',
      attributes: [
        ['appName', 'Platform'],
        ['playerVersion', 'Player'],
        ['playerName', 'Player'],
        ['contentSrc', 'Content'],
        ['countryCode', 'Geography'],
        ['contentIsLive', 'Content'],
        ['contentTitle', 'Content'],
      ],
    },
    {
      event: 'PageAction',
      eventSelector: { attribute: 'Delivery Type', value: 'Web' },
      attributes: [
        ['adPartner', 'Ad'],
        ['adPosition', 'Ad'],
        ['adTitle', 'Ad'],
        ['adPartner', 'Ad'],
        ['adSrc', 'Ad'],
        ['userAgentName', 'Platform'],
        ['userAgentName', 'Platform'],
        ['userAgentOS', 'Platform'],
        ['userAgentVersion', 'Platform'],
        ['isAd', 'Content'],
        ['asnOrganization', 'Geography'],
        ['city', 'Geography'],
        ['regionCode', 'Geography'],
        ['message', 'Error'],
      ],
    },
    {
      event: 'MobileVideo',
      eventSelector: { attribute: 'Delivery Type', value: 'Mobile' },
      attributes: [
        ['isAd', 'Content'],
        ['asnOrganization', 'Geography'],
        ['city', 'Geography'],
        ['regionCode', 'Geography'],
        ['device', 'Platform'],
        ['deviceGroup', 'Platform'],
        ['deviceType', 'Platform'],
        ['osName', 'Platform'],
        ['osVersion', 'Platform'],
        ['message', 'Error'],
      ],
    },
    {
      event: 'RokuVideo',
      eventSelector: { attribute: 'Delivery Type', value: 'OTT' },
      attributes: [
        ['device', 'Platform'],
        ['deviceGroup', 'Platform'],
        ['deviceType', 'Platform'],
        ['osName', 'Platform'],
        ['osVersion', 'Platform'],
        ['errorMessage', 'Error'],
      ],
    },
  ],
  metrics: [
    {
      id: 'AS',
      title: 'Ads Shown',
      query: {
        nrql: `SELECT count(*) as 'result' from PageAction, MobileVideo where actionName = 'AD_START'`,
        lookup: 'result',
      },
      detailDashboardId: 'AS-Detail',
    },
    {
      id: 'ACR',
      title: 'Ad Click Ratio',
      query: {
        nrql: `SELECT filter(count(*), WHERE actionName = 'AD_CLICK') / filter(count(*), WHERE actionName = 'AD_START') * 100  as 'result' from PageAction, MobileVideo `,
        lookup: 'result',
      },
    },
    {
      id: 'ASR',
      title: 'Ad Skip Ratio',
      query: {
        nrql: `SELECT filter(count(*), WHERE actionName = 'AD_END' and skipped is true) / filter(count(*), WHERE actionName = 'AD_END') * 100  as 'result' from PageAction, MobileVideo `,
        lookup: 'result',
      },
    },
    {
      id: 'AER',
      title: 'Ad Error Ratio',
      query: {
        nrql: `SELECT filter(count(*), WHERE actionName = 'AD_ERROR') / filter(count(*), WHERE actionName = 'AD_START') * 100  as 'result' from PageAction, MobileVideo `,
        lookup: 'result',
      },
    },
    {
      id: 'ASFR',
      title: 'Ad Start Failure Ratio',
      query: {
        nrql: `SELECT filter(count(*), WHERE actionName = 'AD_ERROR' and adPlayhead < 1000) / filter(count(*), WHERE actionName = 'AD_REQUEST') * 100 as 'result' from PageAction, MobileVideo `,
        lookup: 'result',
      },
    },
    {
      title: 'In-Stream Ad Error Ratio',
      query: {
        nrql: `SELECT filter(count(*), WHERE actionName = 'AD_ERROR' and adPlayhead >= 1000) / filter(count(*), WHERE actionName = 'AD_START') * 100 as 'result' from PageAction, MobileVideo `,
        lookup: 'result',
      },
    },
    {
      id: 'AIR',
      title: 'Ad Interruption Ratio',
      query: {
        nrql: `SELECT filter(count(*), WHERE actionName = 'AD_BUFFER_START') / filter(count(*), WHERE actionName = 'AD_START') * 100  as 'result' from PageAction, MobileVideo `,
        lookup: 'result',
      },
    },
    {
      id: 'AJT',
      title: 'Join Time for Ads (s)',
      query: {
        nrql: `SELECT percentile(timeSinceAdRequested/1000, 50) as 'percentile' FROM PageAction, MobileVideo WHERE actionName ='AD_START'`,
        lookup: 'percentile',
      },
    },
  ],
  detailDashboards: [
    {
      id: 'AS-Detail',
      config: [
        {
          nrql: `SELECT count(*) as 'Ads' from PageAction, MobileVideo where actionName = 'AD_START' `,
          columnStart: 1,
          columnEnd: 4,
          chartSize: 'small',
          chartType: 'billboard',
          title: 'Ads Shown',
          useSince: true,
        },
        {
          nrql: `SELECT count(*) as 'Ads' FROM PageAction, MobileVideo where actionName = 'AD_START' FACET viewId LIMIT 25`,
          noFacet: true,
          columnStart: 5,
          columnEnd: 12,
          chartSize: 'small',
          chartType: 'bar',
          title: 'Views with most Ads (Click for details)',
          useSince: true,
          click: 'openSession',
        },
        {
          nrql: `SELECT funnel(viewId, WHERE actionName='AD_REQUEST' as 'Ad Requested', WHERE actionName='AD_START' as 'Ad Started', WHERE actionName='AD_QUARTILE' and quartile = 1 as 'First Quartile', WHERE actionName='AD_QUARTILE' and quartile = 2 as 'Second Quartile', WHERE actionName='AD_QUARTILE' and quartile = 3 as 'Third Quartile', WHERE actionName='AD_END' as 'Ad Completed') FROM PageAction, MobileVideo `,
          noFacet: true,
          columnStart: 1,
          columnEnd: 6,
          chartSize: 'medium',
          chartType: 'funnel',
          title: 'Ad Funnel',
          useSince: true,
        },
      ],
    },
  ],
}