import { Component } from "react"
import PropTypes from "prop-types"

class Timer extends Component {

  constructor(props) {
    super(props)
    this.state = {
      diff: (window.serverTimestamp - this.props.startTS) / 1000
    }
  }

  componentDidMount() {
    this.start()
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  start() {
    this.interval = setInterval(() => {
      this.tick()
    }, 1000)
  }

  tick = () => {
    this.setState({
      diff: (window.serverTimestamp - this.props.startTS) / 1000
    })
  }

  render() {
    let minutes = Math.floor(this.state.diff / 60)
    let seconds = Math.floor(this.state.diff % 60)

    if (minutes < 10) minutes = `0${minutes}`
    if (seconds < 10) seconds = `0${seconds}`

    return (
      <div className={this.props.className}>{minutes}:{seconds}</div>
    )
  }

}

Timer.propTypes = {
  startTS: PropTypes.number.isRequired
}

export default Timer