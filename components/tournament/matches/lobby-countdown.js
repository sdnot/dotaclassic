import { Component } from "react"
import PropTypes from "prop-types"
import CountdownClock from "../../countdown-clock"

class LobbyCountdown extends Component {
  render() {
    const isPaused = this.props.match.status == "LOBBY" ? false : true
    if (this.props.match && (this.props.match.status == "LOBBY" || this.props.match.status == "LOBBY_PAUSED")) {
      return <CountdownClock
        className={this.props.className}
        size={this.props.size}
        maxSeconds={900}
        seconds={900 - ((window.serverTimestamp - this.props.match.timestamp) / 1000)}
        paused={isPaused} />
    }
    return null
  }
}

LobbyCountdown.propTypes = {
  match: PropTypes.object,
  size: PropTypes.number
}

LobbyCountdown.defaultProps = {
  size: 80
}

export default LobbyCountdown