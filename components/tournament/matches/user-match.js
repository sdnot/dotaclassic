import { Component } from "react"
import { connect } from "react-redux"
import { defineMessages, injectIntl } from "react-intl"
import styled from "styled-components"
import Match from "../brackets/match-modal/match"
import LobbyInviteButton from "./lobby-invite-button"

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid;

  h3 {
    text-decoration: underline;
  }
  
  button {
    padding: 10px;
  }
`
const messages = defineMessages({
  lobbyInfo: {
    id: "tournament.matches.lobbyInfo",
    defaultMessage: "Lobby information"
  },
  name: {
    id: "general.name",
    defaultMessage: "Name"
  },
  password: {
    id: "general.password",
    defaultMessage: "Password"
  },
  server: {
    id: "general.server",
    defaultMessage: "Server"
  }
})
class UserMatch extends Component {

  render() {
    if (!this.props.matchId) {
      return null
    }

    let LobbyInviteIsDisabled = true, lobbyName = "---", lobbyPassword = "---", lobbyServer = "---"
    if (this.props.matchStatus == "LOBBY" || this.props.matchStatus == "LOBBY_PAUSED") {
      lobbyName = `DotaCC WB R${this.props.matchId.r} M${this.props.matchId.m}`
      lobbyPassword = "dotacc578"
      lobbyServer = "US East / EEUU Este"
      LobbyInviteIsDisabled = false
    }

    return (
      <div>
        <Match matchId={this.props.matchId} />
        <Footer>
          <div>
            <h3>{this.props.intl.formatMessage(messages.lobbyInfo)}</h3>
            <p><b>{this.props.intl.formatMessage(messages.name)}:</b> {lobbyName}</p>
            <p><b>{this.props.intl.formatMessage(messages.password)}:</b> {lobbyPassword}</p>
            <p><b>{this.props.intl.formatMessage(messages.server)}:</b> {lobbyServer}</p>
          </div>
          <LobbyInviteButton matchId={this.props.matchId} isDisabled={LobbyInviteIsDisabled} />
        </Footer>
      </div>
    )
  }
}

function mapStateToProps(state) {
  let matchId, matchStatus
  if (state.tournament.user.team && state.tournament.user.team.match) {
    matchId = state.tournament.user.team.match
    matchStatus = state.tournament.rounds[matchId.r - 1][matchId.m - 1].status
  }

  return {
    matchId,
    matchStatus
  }
}


export default connect(mapStateToProps)(injectIntl(UserMatch))