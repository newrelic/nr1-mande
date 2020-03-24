import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format'
momentDurationFormatSetup(moment)

export const dateFormatter = duration => {
  return moment.duration(duration, 'minutes').format(() => {
    if (duration > 1400) return 'd [days]'
    if (duration > 60) return 'h [hours]'
    else return 'm [minutes]'
  })
}