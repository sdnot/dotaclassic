/**
 * WindowResizeListener
 * React component for listening to window resize events
 */
import { Component } from "react"
import PropTypes from "prop-types"
import debounce from "lodash.debounce"

{
  /**
   * Called at least once soon after being mounted
   * type WindowSize = { windowWidth: number, windowHeight: number }
   * type onResize = (windowSize: WindowSize) => void
   */
  PropTypes.func.isRequired
}

class WindowResizeListener extends Component {

  /**
   * List of resize listeners
   * @private
   */
  static _listeners = []

  /**
   * Maximum debounce wait time
   * @public
   */
  static DEBOUNCE_TIME = 10

  /**
   * Resize handler
   * Gets the window size and calls each listener
   * @private
   */
  static _onResize = () => {
    var windowWidth = window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth
    var windowHeight = window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight

    WindowResizeListener._listeners.forEach(function (listener) {
      listener({
        windowWidth: windowWidth,
        windowHeight: windowHeight
      })
    })
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.onResize !== this.props.onResize
  }

  componentDidMount() {
    // Defer creating _debouncedResize until it's mounted
    // This allows users to change DEBOUNCE_TIME if they want
    // If there's no listeners, we need to attach the window listener
    if (!WindowResizeListener._listeners.length) {
      WindowResizeListener._debouncedResize = debounce(
        WindowResizeListener._onResize,
        WindowResizeListener.DEBOUNCE_TIME
      )
      window.addEventListener("resize", WindowResizeListener._debouncedResize, false)
    }
    WindowResizeListener._listeners.push(this.props.onResize)
    WindowResizeListener._debouncedResize()
  }

  componentWillUnmount() {
    var idx = WindowResizeListener._listeners.indexOf(this.props.onResize)
    WindowResizeListener._listeners.splice(idx, 1)
    if (!WindowResizeListener._listeners.length) {
      window.removeEventListener("resize", WindowResizeListener._debouncedResize, false)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.onResize !== this.props.onResize) {
      var idx = WindowResizeListener._listeners.indexOf(this.props.onResize)
      WindowResizeListener._listeners.splice(idx, 1, nextProps.onResize)
    }
  }

  render() {
    return null
  }
}

export default WindowResizeListener