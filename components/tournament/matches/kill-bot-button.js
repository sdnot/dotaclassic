import { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import styled from "styled-components"
import axios from "axios"
import Popup from "../../popup"

const RedButton = styled.button`
  background-color: red;
  text-align: center;
`
const GreenButton = styled.button`
  background-color: green;
  text-align: center;
`
class KillBotButton extends Component {

  killBot() {
    Popup.confirm("KILL_BOT_CONFIRM", (confirmed) => {
      if (confirmed) {
        axios.post("tournament/kill_bot", {
          _csrf: this.props.csrfToken,
          matchId: this.props.matchId,
        })
          .catch(err => {
            Popup.error(err.response && err.response.data || err.toString())
          })
      }
    })
  }

  startBot() {
    Popup.confirm("START_BOT_CONFIRM", (confirmed) => {
      if (confirmed) {
        axios.post("tournament/start_bot", {
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
      if (this.props.status != "WAITING_NO_BOT" && this.props.status != "MATCH_FINISHED") {
        return (
          <RedButton onClick={() => this.killBot()}>KILL_BOT</RedButton>
        )
      }
      else if (this.props.status == "WAITING_NO_BOT") {
        return (
          <GreenButton onClick={() => this.startBot()}>START_BOT</GreenButton>
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

KillBotButton.propTypes = {
  status: PropTypes.string,
  matchId: PropTypes.shape({
    s: PropTypes.number,
    r: PropTypes.number,
    m: PropTypes.number
  })
}

export default connect(mapStateToProps)(KillBotButton)