import { Icon } from 'nr1'

const groups = [
  {
    name: 'CONTENT',
    eventDisplay: {
      class: 'timeline-item-type-content',
      icon: Icon.TYPE.DOCUMENTS__DOCUMENTS__NOTES,
      label: 'Content',
      color: '#9C5400',
    },
    timelineDisplay: {
      color: '#fcdd77',
      label: 'Content',
    },
    actionNames: [
      'CONTENT_REQUEST',
      'DOWNLOAD',
      'CONTENT_START',
      'CONTENT_PAUSE',
      'CONTENT_END',
      'CONTENT_RESUME',
    ],
  },
  {
    name: 'HEARTBEAT',
    eventDisplay: {
      class: 'timeline-item-type-heartbeat',
      icon: Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT__V_ALTERNATE,
      label: 'Heartbeat',
      color: '#a752d5',
    },
    timelineDisplay: {
      color: '#cea3e6',
      label: 'Heartbeat',
    },
    actionNames: ['CONTENT_HEARTBEAT','AD_HEARTBEAT'],
  },
  {
    name: 'ADS',
    eventDisplay: {
      class: 'timeline-item-type-ad',
      icon: Icon.TYPE.INTERFACE__OPERATIONS__SHOW,
      label: 'Advertising',
      color: '#007e8a',
    },
    timelineDisplay: {
      color: '#007e8a',
      label: 'Advertising',
    },
    actionNames: ['AD_REQUEST', 'AD_START', 'AD_QUARTILE', 'AD_END'],
  },
  {
    name: 'ERROR',
    eventDisplay: {
      class: 'timeline-item-type-error',
      icon: Icon.TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__APPLICATION__S_ERROR,
      label: 'Errors',
      color: '#bf0015',
    },
    timelineDisplay: {
      color: '#bf0015',
      label: 'Errors',
    },
    actionNames: ['CONTENT_ERROR', 'ERROR'],
  },
  {
    name: 'BUFFER',
    eventDisplay: {
      class: 'timeline-item-type-buffer',
      icon: Icon.TYPE.INTERFACE__OPERATIONS__REFRESH,
      label: 'Buffer',
      color: '#FFA500',
    },
    timelineDisplay: {
      color: '#FFA500',
      label: 'Buffering',
    },
    actionNames: ['CONTENT_BUFFER_START', 'CONTENT_BUFFER_END'],
  },
  {
    name: 'RENDITION',
    eventDisplay: {
      class: 'timeline-item-type-rendition',
      icon: Icon.TYPE.INTERFACE__ARROW__ARROW_VERTICAL,
      label: 'Rendition',
      color: '#02acfa',
    },
    timelineDisplay: {
      color: '#02acfa',
      label: 'Rendition',
    },
    actionNames: ['CONTENT_RENDITION_CHANGE'],
  },
  {
    name: 'EXTERNAL',
    eventDisplay: {
      class: 'timeline-item-type-external',
      icon: Icon.TYPE.INTERFACE__ARROW__ARROW_RIGHT__V_ALTERNATE,
      label: 'External Calls',
      color: '#016316',
    },
    timelineDisplay: {
      color: '#016316',
      label: 'External Calls',
    },
    actionNames: ['UNKNOWN AT THIS TIME'],
  },
]

const defaultGroup = {
  name: 'GENERAL',
  eventDisplay: {
    class: 'timeline-item-type-general',
    icon: Icon.TYPE.INTERFACE__INFO__INFO,
    label: 'General',
    color: '#00496b',
  },
  timelineDisplay: {
    color: '#00496b',
    label: 'General',
  },
  actionNames: [],
}

const videoGroup = event => {
  const found = groups.filter(group => {
    return group.actionNames.includes(event)
  })

  if (found.length > 0) return found[0]
  else return defaultGroup
}

export default videoGroup
