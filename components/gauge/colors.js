export default class SessionColors {
    static CONTENT = 'green'
    static CONTENT_LABEL = 'Content'
    static HEARTBEAT = 'limegreen'
    static HEARTBEAT_LABEL = 'Heartbeat'
    static ADS = 'yellow'
    static ADS_LABEL = 'Advertising'
    static ERROR = 'red'
    static ERROR_LABEL = 'Errors'
    static BUFFER = 'orange'
    static BUFFER_LABEL = 'Buffering'
    static GENERAL = 'brown'
    static GENERAL_LABEL = 'General'
    static EXTERNAL = 'skyblue'
    static EXTERNAL_LABEL = 'External Calls'

    static getColor = (eventType, event) => {
        if (eventType == 'PageAction') {
            switch (event.actionName) {
                case 'CONTENT_REQUEST':
                case 'DOWNLOAD':
                case 'CONTENT_START':
                case 'CONTENT_PAUSE':
                case 'CONTENT_END':
                    return SessionColors.CONTENT
                    case 'CONTENT_HEARTBEAT':
                    return SessionColors.HEARTBEAT
                case 'AD_REQUEST':
                case 'AD_START':
                case 'AD_QUARTILE':
                case 'AD_END':
                    return SessionColors.ADS
                case 'CONTENT_BUFFER_START':
                case 'CONTENT_BUFFER_END':
                    return SessionColors.BUFFER
                case 'CONTENT_ERROR':
                    return SessionColors.ERROR
                default:
                    //console.log(event.actionName)
                    return SessionColors.GENERAL
            }
        }
    }
    static getLabel = (eventType, event) => {
        if (eventType == 'PageAction') {
            switch (event.actionName) {
                case 'CONTENT_REQUEST':
                case 'DOWNLOAD':
                case 'CONTENT_START':
                case 'CONTENT_PAUSE':
                case 'CONTENT_END':
                    return SessionColors.CONTENT_LABEL
                case 'CONTENT_HEARTBEAT':
                    return SessionColors.HEARTBEAT_LABEL
                case 'AD_REQUEST':
                case 'AD_START':
                case 'AD_QUARTILE':
                case 'AD_END':
                    return SessionColors.ADS_LABEL
                case 'CONTENT_BUFFER_START':
                case 'CONTENT_BUFFER_END':
                    return SessionColors.BUFFER_LABEL
                case 'CONTENT_ERROR':
                    return SessionColors.ERROR_LABEL
                default:
                    return SessionColors.GENERAL_LABEL
            }
        }
    }
}