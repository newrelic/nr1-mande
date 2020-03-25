import { Button, Icon } from 'nr1';

export default class EventCategories {
  static CONTENT = {
    class: 'timeline-item-type-content',
    icon: Icon.TYPE.DOCUMENTS__DOCUMENTS__NOTES,
    label: 'Content',
    color: '#9C5400',
  };
  static HEARTBEAT = {
    class: '',
    icon: Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_RIGHT__V_ALTERNATE,
    label: 'Heartbeat',
    color: '#222222',
  };
  static ADS = {
    class: 'timeline-item-type-ad',
    icon: Icon.TYPE.INTERFACE__OPERATIONS__SHOW,
    label: 'Advertising',
    color: '#007e8a',
  };
  static ERROR = {
    class: 'timeline-item-type-error',
    icon: Icon.TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__APPLICATION__S_ERROR,
    label: 'Errors',
    color: '#bf0015',
  };
  static BUFFER = {
    class: '',
    icon: Icon.TYPE.INTERFACE__OPERATIONS__REFRESH,
    label: 'Buffer',
    color: '#22222',
  };
  static GENERAL = {
    class: 'timeline-item-type-general',
    icon: Icon.TYPE.INTERFACE__INFO__INFO,
    label: 'General',
    color: '#22222',
  };
  static EXTERNAL = {
    class: '',
    icon: Icon.TYPE.INTERFACE__ARROW__ARROW_RIGHT__V_ALTERNATE,
    label: 'External Calls',
    color: '#22222',
  };

  static setCategory(eventType, event) {
    if (eventType && eventType.includes('PageAction')) {
      if (!event) return EventCategories.GENERAL;
      switch (event.actionName) {
        case 'CONTENT_REQUEST':
        case 'DOWNLOAD':
        case 'CONTENT_START':
        case 'CONTENT_PAUSE':
        case 'CONTENT_END':
          return EventCategories.CONTENT;
        case 'CONTENT_HEARTBEAT':
          return EventCategories.HEARTBEAT;
        case 'AD_REQUEST':
        case 'AD_START':
        case 'AD_QUARTILE':
        case 'AD_END':
          return EventCategories.ADS;
        case 'CONTENT_BUFFER_START':
        case 'CONTENT_BUFFER_END':
          return EventCategories.BUFFER;
        case 'CONTENT_ERROR':
          return EventCategories.ERROR;
        default:
          return EventCategories.GENERAL;
      }
    }
  }
}
