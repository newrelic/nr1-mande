import moment from 'moment-timezone'
import momentDurationFormatSetup from 'moment-duration-format'
momentDurationFormatSetup(moment)

export const dateFormatter = timeRange => {
  const { begin_time, end_time, duration } = timeRange

  if (duration) {
    const inMinutes = duration / 1000 / 60
    const formatted = moment.duration(inMinutes, 'minutes').format(() => {
      if (inMinutes > 1400) return 'd [days]'
      if (inMinutes > 60) return 'h [hours]'
      else return 'm [minutes]'
    })
    return `Since ${formatted} ago`
  } else if (begin_time && end_time) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const begin = moment.utc(begin_time).tz(tz)
    const end = moment.utc(end_time).tz(tz)

    return `Since ${begin.format('MMM DD hh:mm')} Until ${end.format(
      'MMM DD hh:mm'
    )}`
  } else {
    return 'Since 60 minutes ago'
  }
}

export const formatTimestampAsDate = timestamp => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const timeToFormat = moment.utc(timestamp).tz(tz)
  return timeToFormat.format('MMMM DD hh:mm:ss')
}

export const milliseconds = 'milliseconds'
export const seconds = 'seconds'
export const minutes = 'minutes'

export const formatTimeAsString = (time, unit) => {
  let inMinutes = time
  switch (unit) {
    case milliseconds:
      inMinutes = time / 1000 / 60
      break
    case seconds:
      inMinutes = time / 60
      break
  }

  const formatted = moment.duration(inMinutes, 'minutes').format(() => {
    if (inMinutes > 1400) return 'd [days]'
    if (inMinutes > 60) return 'h [hours]'
    if (inMinutes < 1) return 's [seconds]'
    else return 'm [minutes]'
  })

  return formatted
}