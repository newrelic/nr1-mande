export default class SessionColors {
  static CONTENT = '#f9d877';
  static CONTENT_LABEL = 'Content';
  static HEARTBEAT = '#a752d5';
  static HEARTBEAT_LABEL = 'Heartbeat';
  static ADS = '#52aaac';
  static ADS_LABEL = 'Advertising';
  static ERROR = '#ec6b4b';
  static ERROR_LABEL = 'Errors';
  static BUFFER = 'orange';
  static BUFFER_LABEL = 'Buffering';
  static GENERAL = '#00496b';
  static GENERAL_LABEL = 'General';
  static EXTERNAL = '#0079bf';
  static EXTERNAL_LABEL = 'External Calls';

  static getColor = (eventType, event) => {
    if (eventType && eventType.includes('PageAction')) {
      switch (event.actionName) {
        case 'CONTENT_REQUEST':
        case 'DOWNLOAD':
        case 'CONTENT_START':
        case 'CONTENT_PAUSE':
        case 'CONTENT_END':
          return SessionColors.CONTENT;
        case 'CONTENT_HEARTBEAT':
          return SessionColors.HEARTBEAT;
        case 'AD_REQUEST':
        case 'AD_START':
        case 'AD_QUARTILE':
        case 'AD_END':
          return SessionColors.ADS;
        case 'CONTENT_BUFFER_START':
        case 'CONTENT_BUFFER_END':
          return SessionColors.BUFFER;
        case 'CONTENT_ERROR':
          return SessionColors.ERROR;
        default:
          //console.log(event.actionName)
          return SessionColors.GENERAL;
      }
    }
  };
  static getLabel = (eventType, event) => {
    if (eventType && eventType.includes('PageAction')) {
      switch (event.actionName) {
        case 'CONTENT_REQUEST':
        case 'DOWNLOAD':
        case 'CONTENT_START':
        case 'CONTENT_PAUSE':
        case 'CONTENT_END':
          return SessionColors.CONTENT_LABEL;
        case 'CONTENT_HEARTBEAT':
          return SessionColors.HEARTBEAT_LABEL;
        case 'AD_REQUEST':
        case 'AD_START':
        case 'AD_QUARTILE':
        case 'AD_END':
          return SessionColors.ADS_LABEL;
        case 'CONTENT_BUFFER_START':
        case 'CONTENT_BUFFER_END':
          return SessionColors.BUFFER_LABEL;
        case 'CONTENT_ERROR':
          return SessionColors.ERROR_LABEL;
        default:
          return SessionColors.GENERAL_LABEL;
      }
    }
  };
}
