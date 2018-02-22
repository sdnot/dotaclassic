import React from "react"
import PopupStore from "./Store"
import Header from "./Header.react"
import Footer from "./Footer.react"
import Constants from "./Constants"
import PropTypes from "prop-types"
import { defineMessages, FormattedMessage } from "react-intl"
import { login } from "../user/auth-button"

const displayName = "Popup"
const propTypes = {
  className: PropTypes.string.isRequired,
  btnClass: PropTypes.string.isRequired,
  closeBtn: PropTypes.bool,
  closeHtml: PropTypes.string,
  defaultOk: PropTypes.string,
  defaultCancel: PropTypes.string,
  wildClasses: PropTypes.bool,
  closeOnOutsideClick: PropTypes.bool,
}

const defaultProps = {
  className: "mm-popup",
  btnClass: "mm-popup__btn",
  closeBtn: true,
  closeHtml: null,
  defaultOk: "Ok",
  defaultCancel: "Cancel",
  wildClasses: false,
  closeOnOutsideClick: true,
}

const initialState = {
  title: null,
  buttons: false,
  content: null,
  visible: false,
  className: null,
  noOverlay: false,
  position: false,
  closeOnOutsideClick: true,
}

const Store = new PopupStore()
const hasClass = (element, className) => {
  if (element.classList) {
    return !!className && element.classList.contains(className)
  }

  return (` ${element.className} `).indexOf(` ${className} `) > -1
}

defineMessages({
  notLoggedInAlert: {
    id: "general.notLoggedInAlert",
    defaultMessage: "You must login first"
  }
})

class Prompt extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      value: ""
    }

    this.onChange = (e) => this._onChange(e)
  }

  componentDidMount() {
    this.inputBox.focus()
    this.inputBox.select()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.value !== this.state.value) {
      this.props.onChange(this.state.value)
    }
  }

  _onChange(e) {
    let value = e.target.value

    this.setState({ value: value })
  }

  render() {
    return <input ref={instance => this.inputBox = instance} type="text" placeholder={this.props.placeholder} className="mm-popup__input" value={this.state.value} onChange={this.onChange} />
  }
}

class Component extends React.Component {

  static addShowListener(callback) {
    Store.on(Constants.SHOW, callback)
  }

  static removeShowListener(callback) {
    Store.removeListener(Constants.SHOW, callback)
  }

  static addCloseListener(callback) {
    Store.on(Constants.CLOSE, callback)
  }

  static removeCloseListener(callback) {
    Store.removeListener(Constants.CLOSE, callback)
  }

  static register(data) {
    const id = Store.getId()

    Store.popups[id] = Object.assign({}, initialState, data)

    return id
  }

  static queue(id) {
    if (!Object.prototype.hasOwnProperty.call(Store.popups, id)) {
      return false
    }

    /** Add popup to queue */
    Store.queue.push(id)

    /** Dispatch queue */
    Store.dispatch()

    return id
  }

  static create(data, bringToFront) {
    /** Register popup */
    const id = this.register(data)

    /** Queue popup */
    if (bringToFront === true) {
      const currentlyActive = Store.active

      Store.active = null
      this.queue(id)
      this.queue(currentlyActive)
      Store.dispatch()
    } else {
      this.queue(id)
    }

    return id
  }

  static alert(text, title, bringToFront = true) {
    const data = {
      title,
      content: text,
      buttons: {
        right: ["ok"],
      }
    }

    return this.create(data, bringToFront)
  }

  static alertLogin(bringToFront = true) {
    const data = {
      content: <FormattedMessage id={"general.notLoggedInAlert"} defaultMessage={"You must login first"} />,
      buttons: {
        right: ["ok"],
        left: [{
          text: <FormattedMessage id={"user.loginButton"} defaultMessage={"Login with Steam"} />,
          action: () => {
            login()
            this.close()
          }
        }]
      }
    }
    return this.create(data, bringToFront)
  }

  static confirm(
    text,
    callback,
    confirmText = <FormattedMessage id={"general.accept"} defaultMessage={"Accept"} />,
    cancelText = <FormattedMessage id={"general.cancel"} defaultMessage={"Cancel"} />,
    bringToFront
  ) {
    const data = {
      content: text,
      closeOnOutsideClick: false,
      buttons: {
        left: [{
          text: cancelText,
          action: () => {
            callback(false)
            this.close()
          }
        }],
        right: [{
          text: confirmText,
          action: () => {
            callback(true)
            this.close()
          }
        }]
      },
    }
    return this.create(data, bringToFront)
  }

  static input(title, callback, bringToFront = true) {
    let promptValue = null
    let promptChange = function (value) {
      promptValue = value
    }
    const data = {
      title,
      content: <Prompt onChange={promptChange} />,
      closeOnOutsideClick: false,
      buttons: {
        left: [{
          text: <FormattedMessage id={"general.cancel"} defaultMessage={"Cancel"} />,
          action: () => {
            callback()
            this.close()
          }
        }],
        right: [{
          text: <FormattedMessage id={"general.accept"} defaultMessage={"Accept"} />,
          action: () => {
            callback(promptValue)
            this.close()
          }
        }]
      }
    }
    return this.create(data, bringToFront)
  }

  static error(text, title = "ERROR") {
    const data = {
      title,
      className: "error",
      content: text,
      closeOnOutsideClick: false,
      buttons: {
        right: [{
          text: <FormattedMessage id={"general.refresh"} defaultMessage={"Refresh"} />,
          className: "refresh",
          action: () => {
            window.location.reload()
            this.close()
          }
        }]
      }
    }
    return this.create(data, true)
  }

  static close() {
    Store.close()
  }

  static registerPlugin(name, callback) {
    Store.plugins[name] = callback.bind(this)
  }

  static plugins() {
    return Store.plugins
  }

  static refreshPosition(position) {
    return Store.refreshPosition(position)
  }

  static clearQueue() {
    return Store.clearQueue()
  }

  constructor(props) {
    super(props)

    initialState.closeOnOutsideClick = this.props.closeOnOutsideClick

    this.state = initialState

    this.bound = {
      onShow: this.onShow.bind(this),
      onClose: this.onClose.bind(this),
      onRefresh: this.onRefresh.bind(this),
      containerClick: this.containerClick.bind(this),
      handleButtonClick: this.handleButtonClick.bind(this),
    }

    this.boxRef = null
  }

  componentDidMount() {
    Store.on(Constants.SHOW, this.bound.onShow)
    Store.on(Constants.CLOSE, this.bound.onClose)
    Store.on(Constants.REFRESH, this.bound.onRefresh)
  }

  componentDidUpdate() {
    this.setPosition(this.state.position)
  }

  componentWillUnmount() {
  }

  /**
   * Refresh popup position
   * @param position
   * @private
   */
  onRefresh(position) {
    this.setPosition(position)
  }

  /**
   * On popup close
   * @private
   */
  onClose() {
    this.setState(initialState)
  }

  /**
   * On popup show
   * @private
   */
  onShow() {
    const popup = Store.activePopup()

    this.setState({
      title: popup.title,
      content: popup.content,
      buttons: popup.buttons,
      visible: true,
      className: popup.className,
      noOverlay: popup.noOverlay,
      position: popup.position,
      closeOnOutsideClick: popup.closeOnOutsideClick,
    })
  }

  setPosition(position) {
    const box = this.boxRef
    let boxPosition = position

    if (!box) {
      return
    }

    if (!boxPosition) {
      boxPosition = this.state.position
    }

    if (!boxPosition) {
      box.style.opacity = 1
      box.style.top = null
      box.style.left = null
      box.style.margin = null

      return
    }

    if (typeof boxPosition === "function") {
      boxPosition.call(null, box)

      return
    }

    box.style.top = `${parseInt(boxPosition.y, 10)} px`
    box.style.left = `${parseInt(boxPosition.x, 10)} 'px`
    box.style.margin = 0
    box.style.opacity = 1
  }

  /**
   * Handle container click
   * @param e
   * @private
   */
  containerClick(e) {
    if (this.state.closeOnOutsideClick && hasClass(e.target, this.props.className)) {
      Store.close()
    }
  }

  /**
   * Handle button clicks
   * @param action
   * @returns {*}
   * @private
   */
  handleButtonClick(action) {
    if (typeof action === "function") {
      return action.call(this, Store)
    }

    return null
  }

  className(className) {
    return `${this.props.className}__${className}`
  }

  wildClass(className, base) {
    if (!className) {
      return null
    }

    if (this.props.wildClasses) {
      return className
    }

    const finalClass = []
    const classNames = className.split(" ")

    classNames.forEach((singleClass) => {
      finalClass.push(`${base}--${singleClass}`)
    })

    return finalClass.join(" ")
  }

  render() {
    let className = this.props.className
    let box = null
    const overlayStyle = {}

    if (this.state.visible) {
      let closeBtn = null

      className += ` ${this.props.className}--visible`

      if (this.props.closeBtn) {
        closeBtn = <button onClick={() => Store.close()} className={`${this.props.className}__close`}>{this.props.closeHtml}</button>
      }

      let boxClass = this.className("box")

      if (this.state.className) {
        boxClass += ` ${this.wildClass(this.state.className, boxClass)}`
      }

      box = (
        <article role="dialog" ref={(el) => { this.boxRef = el }} style={{ opacity: 0 }} className={boxClass}>
          {closeBtn}
          <Header title={this.state.title} className={this.className("box__header")} />

          <div className={this.className("box__body")}>
            {this.state.content}
          </div>

          <Footer
            className={this.className("box__footer")}
            wildClasses={this.props.wildClasses}
            btnClass={this.props.btnClass}
            buttonClick={this.bound.handleButtonClick}
            onClose={() => Store.close()}
            onOk={() => Store.close()}
            defaultOk={this.props.defaultOk}
            defaultCancel={this.props.defaultCancel}
            buttons={this.state.buttons}
          />
        </article>
      )
    }

    if (this.state.noOverlay) {
      overlayStyle.background = "transparent"
    }

    return (
      <div role="presentation" onClick={this.bound.containerClick} className={className} style={overlayStyle}>
        {box}
      </div>
    )
  }

}

Component.displayName = displayName
Component.propTypes = propTypes
Component.defaultProps = defaultProps

export default Component
