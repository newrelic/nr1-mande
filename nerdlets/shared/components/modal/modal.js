import React from 'react'
import PropTypes from 'prop-types'

export default class Modal extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    style: PropTypes.object,
    noClose: PropTypes.bool,
    onClose: PropTypes.func,
  }

  state = {
    enterAnim: false,
    exitAnim: false,
  }

  componentDidMount() {
    this.setState({
      enterAnim: true,
      exitAnim: false,
    })
  }

  closeHandler = () => {
    this.setState({
      enterAnim: false,
      exitAnim: true,
    })
  }

  doneAnim = e => {
    if (e.animationName === 'zoom-out-modal') {
      const { onClose } = this.props
      if (onClose) onClose()
    }
  }

  render() {
    const { children, style, noClose } = this.props
    const { enterAnim, exitAnim } = this.state

    let modalClassList = 'modal-window'
    if (enterAnim) modalClassList += ' zoom-in-modal'
    if (exitAnim) modalClassList += ' zoom-out-modal'

    return (
      <>
        <div className="modal-overlay" />
        <div
          className={modalClassList}
          style={style}
          onAnimationEnd={this.doneAnim}
        >
          {!noClose ? (
            <button
              type="button"
              className="close-button"
              onClick={this.closeHandler}
            >
              <span className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  focusable="false"
                  style={{ fill: 'white' }}
                >
                  <path d="M13.4 2.4l-.8-.8-5.1 5.2-5.1-5.2-.8.8 5.2 5.1-5.2 5.1.8.8 5.1-5.2 5.1 5.2.8-.8-5.2-5.1z" />
                </svg>
              </span>
            </button>
          ) : null}
          <div className="modal-content">{children}</div>
        </div>
      </>
    )
  }
}
