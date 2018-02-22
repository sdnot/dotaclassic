import { Component } from "react"
import { connect } from "react-redux"
import { defineMessages, injectIntl } from "react-intl"
import PropTypes from "prop-types"
import styled from "styled-components"
import axios from "axios"
import { UnmountClosed } from "react-collapse"
import Popup from "../../popup"
import { join_team } from "../../../actions/tournament"

const Bar = styled.div`
  display: flex;
  background-color: green;
  border-style: double;
  height: 23px;
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
const InfoButton = styled.button`
  flex: 0 1 24px;
`
const JoinButton = styled.button`
  flex: 0 1 90px;
`
const Team = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: lightgreen;
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
const messages = defineMessages({
  joinConfirm: {
    id: "tournament.team-bar.joinConfirm",
    defaultMessage: "Join the team {teamName}"
  },
  joinButton: {
    id: "general.joinButton",
    defaultMessage: "Join"
  },
  info: {
    id: "general.info",
    defaultMessage: "Info"
  }
})
class TeamBar extends Component {
  constructor(props) {
    super(props)
    this.state = { isOpened: false }
  }

  joinTeam() {
    if (!this.props.isLoggedIn) {
      return Popup.alertLogin()
    }
    if (this.props.team.password) {
      this.props.showJoinTeamModal(this.props.team.name, this.props.index)
    }
    else {
      Popup.confirm(this.props.intl.formatMessage(messages.joinConfirm, { teamName: this.props.team.name }), (confirmed) => {
        if (confirmed) {
          axios.post("tournament/join_team", {
            _csrf: this.props.csrfToken,
            teamName: this.props.team.name
          })
            .then(() => {
              this.props.dispatch(join_team(this.props.index))
            })
            .catch(err => {
              Popup.error(err.response && err.response.data || err.toString())
            })
        }
      })
    }
  }

  collapseTeam(event) {
    event.preventDefault()
    this.setState({ isOpened: !this.state.isOpened })
  }

  render() {
    const mappedPlayers = []
    this.props.team.players.forEach((player, index) => {
      mappedPlayers.push(
        <Player key={index}>
          <Avatar src={player.steamavatar[0]} />
          <Flag className={`flag${player.loccountrycode ? ` flag-${player.loccountrycode}` : ""}`} />
          <NameWrapper>
            <Name href={player.profileurl} target="_blank">{player.steamname}</Name>
          </NameWrapper>
          <AccountID>{player.account_id}</AccountID>
        </Player>
      )
    })
    const isJoinDisabled = (this.props.isUserInTeam || this.props.team.players.length >= 5)
    //const lock = this.props.team.password ? "🔒" : "🔓"
    const lock = this.props.team.password ? " 🔒" : null
    return (
      <div>
        <Bar>
          <Index>{this.props.index + 1}</Index>
          <TeamName>{this.props.team.name}</TeamName>
          <PlayerCount>{this.props.team.players.length}/5</PlayerCount>
          <InfoButton onClick={this.collapseTeam.bind(this)}>{this.props.intl.formatMessage(messages.info)}</InfoButton>
          <JoinButton disabled={isJoinDisabled} onClick={this.joinTeam.bind(this)}>{this.props.intl.formatMessage(messages.joinButton)}{lock}</JoinButton>
        </Bar>
        <UnmountClosed isOpened={this.state.isOpened}>
          <Team>
            {mappedPlayers}
          </Team>
        </UnmountClosed>
      </div>
    )
  }
}

TeamBar.propTypes = {
  index: PropTypes.number.isRequired,
  team: PropTypes.shape({
    name: PropTypes.string,
    players: PropTypes.arrayOf(
      PropTypes.shape({
        account_id: PropTypes.string,
        steamname: PropTypes.string,
        steamavatar: PropTypes.arrayOf(PropTypes.string)
      })
    ),
    password: PropTypes.bool
  }).isRequired,
  showJoinTeamModal: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool,
  isUserInTeam: PropTypes.bool
}

function mapStateToProps(state) {
  return {
    csrfToken: state.user.csrfToken,
    isLoggedIn: !!state.user.account_id,
    isUserInTeam: !!state.tournament.user.team
  }
}

export default connect(mapStateToProps)(injectIntl(TeamBar))