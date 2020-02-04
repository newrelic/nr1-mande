import React from 'react'

const compare = props => {
  const statusClasses = {
    decrease: {
      standard: 'good',
      inverted: 'bad',
    },
    increase: {
      standard: 'bad',
      inverted: 'good',
    },
    getStatus(currentStatus, invert) {
      let status = this[currentStatus]
      if (status) return invert ? status.inverted : status.standard
    },
  }

  const changeClass = props.change()
  const classes = ['compareTo', changeClass]
  if (changeClass !== 'noChange') {
    const invert = props.invert ? props.invert : false
    const status = statusClasses.getStatus(changeClass, invert)
    classes.push(status)
  }

  return (
    <React.Fragment>
      <p className={classes.join(' ')}>
        {props.difference !== Infinity ? `${props.difference} %` : 'N/A'}
      </p>
    </React.Fragment>
  )
}

export default compare
