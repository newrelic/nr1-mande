import React from 'react'
import PropType from 'prop-types'

export default class Popup extends React.Component {
  render() {
    const { children, styles, visible, positionAtStart } = this.props

    let classNames = 'popup-container'
    if (visible) classNames += ' visible'
    classNames += positionAtStart ? ' position-start' : ' position-end'

    return (
      <div className={classNames} style={styles}>
        {children}
      </div>
    )
  }
}

Popup.propTypes = {
  children: PropType.node.isRequired,
  visible: PropType.bool,
  positionAtStart: PropType.bool,
  styles: PropType.object,
}