import { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import styled from "styled-components"
import axios from "axios"
import Popup from "../../popup"

const RedButton = styled.button`
  background-color: pink;
  text-align: center;
`
const GreenButton = styled.button`
  background-color: lightgreen;
  text-align: center;
`
class PauseLobbyButton extends Component {

  pauseBot() {
    Popup.confirm("PAUSE_LOBBY", (confirmed) => {
      if (confirmed) {
        axios.post("tournament/pause_bot", {
          _csrf: this.props.csrfToken,
          matchId: this.props.matchId,
        })
          .catch(err => {
            Popup.error(err.response && err.response.data || err.toString())
          })
      }
    })
  }

  unpauseBot() {
    Popup.confirm("UNPAUSE_LOBBY", (confirmed) => {
      if (confirmed) {
        axios.post("tournament/unpause_bot", {
          _csrf: this.props.csrfToken,
          matchId: this.props.matchId,
        })
          .catch(err => {
            Popup.error(err.response && err.response.data || err.toString())
          })
      }
    })
  }

  render() {
    if (this.props.matchId) {
      if (this.props.status == "LOBBY") {
        return (
          <RedButton onClick={() => this.pauseBot()}>PAUSE_LOBBY</RedButton>
        )
      }
      else if (this.props.status == "LOBBY_PAUSED") {
        return (
          <GreenButton onClick={() => this.unpauseBot()}>UNPAUSE_LOBBY</GreenButton>
        )
      }
    }
    return null
  }
}

function mapStateToProps(state, ownProps) {
  return {
    csrfToken: state.user.csrfToken,
    status: state.tournament.rounds[ownProps.matchId.r - 1][ownProps.matchId.m - 1].status
  }
}

PauseLobbyButton.propTypes = {
  matchId: PropTypes.shape({
    s: PropTypes.number,
    r: PropTypes.number,
    m: PropTypes.number
  }),
  status: PropTypes.string
}

export default connect(mapStateToProps)(PauseLobbyButton)