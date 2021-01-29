import { USER_IDENTIFIER, VIDEO_EVENTS } from './constants'

export default {
  title: 'Audience',
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
    {
      event: 'BrowserVideo',
      eventSelector: { attribute: 'Delivery Type', value: 'Web' },
      attributes: [
        ['userAgentName', 'Platform'],
        ['userAgentOS', 'Platform'],
        ['userAgentVersion', 'Platform'],
        ['isAd', 'Content'],
        // ['asnOrganization', 'Geography'],
        // ['city', 'Geography'],
        // ['regionCode', 'Geography'],
        ['message', 'Error'],
      ],
    },
  ],
  metrics: [
    {
      title: 'Play Attempts',
      invertCompareTo: 'true',
      query: {
        nrql: `SELECT count(*) as 'result' FROM ${VIDEO_EVENTS} where actionName = 'CONTENT_REQUEST' `,
        lookup: 'result',
      },
    },
    {
      title: 'Plays',
      invertCompareTo: 'true',
      query: {
        nrql: `SELECT count(*) as 'result' FROM ${VIDEO_EVENTS} where actionName = 'CONTENT_START' `,
        lookup: 'result',
      },
    },
    {
      title: 'Peak Concurrent Plays',
      invertCompareTo: 'true',
      query: {
        nrql: `SELECT uniquecount(viewId) as 'result' FROM ${VIDEO_EVENTS} where actionName NOT IN ('PLAYER_READY') AND totalPlaytime > 1000`,
        lookup: 'result',
      },
    },
    {
      title: 'Total Playtime (minutes)',
      invertCompareTo: 'true',
      query: {
        nrql: `SELECT sum(playtimeSinceLastEvent)/60000 as 'result' from PageAction`,
        lookup: 'result',
      }
    },
    {
      title: 'Unique Accounts',
      invertCompareTo: 'true',
      query: {
        nrql: `SELECT uniqueCount(${USER_IDENTIFIER}) as 'result' FROM ${VIDEO_EVENTS} `,
        lookup: 'result',
      },
    },
    {
      title: 'Unique Devices',
      invertCompareTo: 'true',
      query: {
        nrql: `SELECT uniquecount(deviceId OR deviceID) as 'result' FROM ${VIDEO_EVENTS} `,
        lookup: 'result',
      },
    },
  ],
  overviewDashboard: [
    {
      nrql: `SELECT count(*) as 'result' FROM ${VIDEO_EVENTS} where actionName = 'CONTENT_REQUEST' TIMESERIES `,
      columnStart: 1,
      columnEnd: 12,
      chartSize: 'micro',
      chartType: 'line',
      title: 'Play Attempts',
      useSince: true,
    },
    {
      nrql: `SELECT count(*) as 'Plays' FROM ${VIDEO_EVENTS} where actionName = 'CONTENT_START' TIMESERIES `,
      columnStart: 1,
      columnEnd: 6,
      chartSize: 'micro',
      chartType: 'line',
      title: 'Plays Trend',
      useSince: true,
    },
    {
      nrql: `SELECT uniquecount(viewId) as 'result' FROM ${VIDEO_EVENTS} where actionName NOT IN ('PLAYER_READY') AND totalPlaytime > 1000 TIMESERIES `,
      columnStart: 7,
      columnEnd: 12,
      chartSize: 'micro',
      chartType: 'line',
      title: 'Peak Concurrent Plays Trend',
      useSince: true,
    },
    {
      nrql: `SELECT uniqueCount(${USER_IDENTIFIER}) as 'result' FROM ${VIDEO_EVENTS} TIMESERIES `,
      columnStart: 1,
      columnEnd: 6,
      chartSize: 'micro',
      chartType: 'line',
      title: 'Unique Accounts Trend',
      useSince: true,
    },
    {
      nrql: `SELECT uniquecount(deviceId OR deviceID or deviceUuid) as 'result' FROM ${VIDEO_EVENTS} TIMESERIES `,
      columnStart: 7,
      columnEnd: 12,
      chartSize: 'micro',
      chartType: 'line',
      title: 'Unique Devices Trend',
      useSince: true,
    },
  ],
}
