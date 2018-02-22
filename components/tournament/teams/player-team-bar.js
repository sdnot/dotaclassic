import { Component } from "react"
import { connect } from "react-redux"
import { defineMessages, injectIntl } from "react-intl"
import PropTypes from "prop-types"
import styled from "styled-components"
import Popup from "../../popup"
import axios from "axios"
import { leave_team, kick_player } from "../../../actions/tournament"

const Bar = styled.div`
  display: flex;
  background-color: RGB(56,154,186);
  border-style: double;
`
const Index = styled.span`
  flex: 0 0 25px;
  border-right-style: solid;
  text-align: center;
  padding-top: 3px;
`
const TeamName = styled.span`
  flex: 1 1;
  border-right-style: solid;
  padding: 3px 0 0 5px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`
const PlayerCount = styled.span`
  flex: 0 0 21px;
  padding: 3px 5px 0 5px;
  border-right-style: solid;
`
const Avatar = styled.img`
  height: 32px;
  width: 32px;
`
const NameWrapper = styled.div`
  display: flex;
  flex: 1 1;
  min-width: 0;
  align-items: center;
`
const Name = styled.a`
  text-decoration: none;
  color: black;
  &:hover {
    color: blue;
  }
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const AccountID = styled.span`
  flex: 0 0 85px;
  padding: 7px 0 0 6px;
  border-left-style: solid;
`
const LeaveButton = styled.button`
  flex: 0 1 91px;
`
const Team = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: lightblue;
  border-right-style: double;
  border-bottom-style: double;
  border-left-style: double;
  box-sizing: border-box;
`
const Player = styled.span`
  display: flex;
`
const Flag = styled.span`
  align-self: center;
  margin: 0 10px;
`
const KickButton = styled.button`
  align-self: center;
`
const messages = defineMessages({
  leaveTeamConfirm: {
    id: "tournament.teams.captain.leaveTeamConfirm",
    defaultMessage: "Leave the team {teamName}"
  },
  kickConfirm: {
    id: "tournament.teams.captain.kickConfirm",
    defaultMessage: "Kick {playerName} from the team"
  },
  leave: {
    id: "general.leave",
    defaultMessage: "Leave"
  }
})
class PlayerTeamBar extends Component {

  leaveTeam(event) {
    const element = event.target
    element.disabled = true
    Popup.confirm(this.props.intl.formatMessage(messages.leaveTeamConfirm, { teamName: this.props.team.name }), (confirmed) => {
      if (confirmed) {
        let i
        for (i = 0; i < this.props.team.players.length; i++) {
          if (this.props.team.players[i].account_id == this.props.account_id) {
            axios.post("tournament/leave_team", {
              _csrf: this.props.csrfToken,
              teamName: this.props.team.name
            })
              .then(() => {
                this.props.dispatch(leave_team(this.props.index, i))
              })
              .catch(err => {
                Popup.error(err.response && err.response.data || err.toString())
              })
            break
          }
        }
      }
      else {
        element.disabled = false
      }
    })
  }

  kickPlayer(playerAccountId, playerIndex, event) {
    const element = event.target
    element.disabled = true
    Popup.confirm(this.props.intl.formatMessage(messages.kickConfirm, { playerName: this.props.team.players[playerIndex].steamname }), (confirmed) => {
      if (confirmed) {
        axios.post("tournament/kick_player", {
          _csrf: this.props.csrfToken,
          teamName: this.props.team.name,
          playerAccountId
        })
          .then(() => {
            this.props.dispatch(kick_player(this.props.index, playerIndex))
          })
          .catch(err => {
            Popup.error(err.response && err.response.data || err.toString())
          })
      }
      else {
        element.disabled = false
      }
    })
  }

  render() {
    let isCaptain = false
    if (this.props.team.players[0] && this.props.team.players[0].account_id == this.props.account_id) {
      isCaptain = true
    }

    const mappedPlayers = [], kickButtonDisabled = (this.props.status != "SIGN_UP" && this.props.status != "CHECK_IN")
    this.props.team.players.forEach((player, index) => {
      let kickButton
      if (index > 0 && isCaptain) {
        kickButton = <KickButton disabled={kickButtonDisabled} onClick={this.kickPlayer.bind(this, player.account_id, index)}>x</KickButton>
      }
      mappedPlayers.push(
        <Player key={index}>
          <Avatar src={player.steamavatar[0]} />
          <Flag className={`flag${player.loccountrycode ? ` flag-${player.loccountrycode}` : ""}`} />
          <NameWrapper>
            <Name href={player.profileurl} target="_blank">{player.steamname}</Name>
          </NameWrapper>
          {kickButton}
          <AccountID>{player.account_id}</AccountID>
        </Player>
      )
    })

    while (mappedPlayers.length < 5) {
      mappedPlayers.push(
        <Player key={mappedPlayers.length}>
          <Avatar />
          <Flag />
          <NameWrapper>
            <Name>---</Name>
          </NameWrapper>
          <AccountID>---</AccountID>
        </Player>
      )
    }

    const leaveButtonDisabled = this.props.status == "SIGN_UP" || this.props.status == "CHECK_IN" ? false : true
    return (
      <div>
        <Bar>
          <Index>{this.props.index + 1}</Index>
          <TeamName>{this.props.team.name}</TeamName>
          <PlayerCount>{this.props.team.players.length}/5</PlayerCount>
          <LeaveButton disabled={leaveButtonDisabled} onClick={this.leaveTeam.bind(this)}>{this.props.intl.formatMessage(messages.leave)}</LeaveButton>
        </Bar>
        <Team>
          {mappedPlayers}
        </Team>
      </div>
    )
  }
}

PlayerTeamBar.propTypes = {
  account_id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  status: PropTypes.string,
  team: PropTypes.shape({
    name: PropTypes.string,
    players: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        account_id: PropTypes.string,
        steamname: PropTypes.string,
        steamavatar: PropTypes.arrayOf(PropTypes.string)
      })
    )
  }).isRequired
}

function mapStateToProps(state) {
  const index = state.tournament.user.team.id - 1
  return {
    account_id: state.user.account_id,
    csrfToken: state.user.csrfToken,
    status: state.tournament.status,
    team: state.tournament.teams[index],
    index
  }
}

export default connect(mapStateToProps)(injectIntl(PlayerTeamBar))