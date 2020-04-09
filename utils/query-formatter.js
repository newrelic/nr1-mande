export const formatSinceAndCompare = timeRange => {
  const { begin_time, end_time, duration } = timeRange
  let clauses = { timeRange }

  if (duration) {
    const minutes = duration / 1000 / 60
    clauses.since = ` SINCE ${minutes} MINUTES AGO `
    clauses.compare = ` COMPARE WITH ${minutes} MINUTES AGO `
  } else if (begin_time && end_time) {
    const diff = Math.round((end_time - begin_time) / 1000 / 60)
    clauses.since = ` SINCE ${begin_time} UNTIL ${end_time} `
    clauses.compare = ` COMPARE WITH ${diff} MINUTES AGO `
  } else {
    clauses.since = ` SINCE 60 MINUTES AGO `
    clauses.compare = ` COMPARE WITH 60 MINUTES AGO `
  }

  return clauses
}
