import { Icon } from 'nr1'

const groups = [
  {
    name: 'PLAYER',
    eventDisplay: {
      class: 'timeline-item-type-player',
      icon: Icon.TYPE.INTERFACE__CARET__CARET_RIGHT__V_ALTERNATE,
      label: 'Player',
      color: '#016911',
    },
    timelineDisplay: {
      color: '#bdf2c6',
      label: 'Player',
    },
    actionNames: ['PLAYER_READY'],
  },
  {
    name: 'DOWNLOAD',
    eventDisplay: {
      class: 'timeline-item-type-download',
      icon: Icon.TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__DOWNSTREAM_DEPLOYMENT,
      label: 'Download',
      color: '#01355c',
    },
    timelineDisplay: {
      color: '#add7f7',
      label: 'Download',
    },
    actionNames: ['DOWNLOAD'],
  },
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
      'CONTENT_START',
      'CONTENT_PAUSE',
      'CONTENT_END',
      'CONTENT_RESUME',
      'CONTENT_SEEK_START',
      'CONTENT_SEEK_END',
      'CONTENT_DROPPED_FRAMES',
    ],
  },
  {
    name: 'HEARTBEAT',
    eventDisplay: {
      class: 'timeline-item-type-heartbeat',
      icon: Icon.TYPE.INTERFACE__SIGN__CHECKMARK,
      label: 'Heartbeat',
      color: '#a752d5',
    },
    timelineDisplay: {
      color: '#cea3e6',
      label: 'Heartbeat',
    },
    actionNames: ['CONTENT_HEARTBEAT', 'AD_HEARTBEAT'],
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
    actionNames: [
      'AD_REQUEST',
      'AD_START',
      'AD_QUARTILE',
      'AD_END',
      'AD_PAUSE',
      'AD_RESUME',
      'AD_BREAK_START',
      'AD_BREAK_END',
      'AD_CLICK',
      'AD_SEEK_START',
      'AD_SEEK_END',
    ],
  },
  {
    name: 'ERROR',
    eventDisplay: {
      class: 'timeline-item-type-error',
      icon: Icon.TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__APPLICATION__S_ERROR,
      label: 'Error',
      color: '#bf0015',
    },
    timelineDisplay: {
      color: '#bf0015',
      label: 'Error',
    },
    actionNames: ['CONTENT_ERROR', 'ERROR', 'AD_ERROR'],
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
    actionNames: ['CONTENT_RENDITION_CHANGE', 'AD_RENDITION_CHANGE'],
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
      color: '#c5fad1',
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
