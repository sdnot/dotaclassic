import { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import styled from "styled-components"
import { defineMessages, injectIntl } from "react-intl"
import MatchAddCasterButton from "../../matches/match-add-caster-button"
import MatchScoreButton from "../../matches/match-score-button"
import LobbyCountdown from "../../matches/lobby-countdown"
import KillBotButton from "../../matches/kill-bot-button"
import PauseLobbyButton from "../../matches/pause-lobby-button"
import LobbyInviteButton from "../../matches/lobby-invite-button"
import LobbyServerButton from "../../matches/lobby-server-button"
import Timer from "../../../timer"
import heroes from "../../../heroes"
import Popup from "../../../popup"
import axios from "axios"

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`
const Header = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid;
  height: 40px;
  font-size: 30px;
`
const Teams = styled.div`
  display: flex;
  flex: 1;
`
const TeamHeader = styled.header`
  display: flex;
  width: 250px;
  flex: 0 0 50px;
  align-items: center;
  justify-content: center;
`
const TeamName = styled.div`
  font-size: 25px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const Radiant = styled.div`
  display: flex;
  width: 250px;
  flex-direction: column;
  flex: 1;
  border-right: 1px solid;
  ${props => props.winner ? "background: linear-gradient(to top, #fae6ab 0%,#fae6ab 80%,#ddc32c 100%);" : ""}
`
const Dire = styled.div`
  display: flex;
  width: 250px;
  flex-direction: column;
  flex: 1;
  ${props => props.winner ? "background: linear-gradient(to top, #fae6ab 0%,#fae6ab 80%,#ddc32c 100%);" : ""}
`
const RadiantPlayer = styled.div`
  display: flex;
  width: 250px;
  align-items: center;
  flex: 0 0 40px;
`
const DirePlayer = styled.div`
  display: flex;
  width: 250px;
  align-items: center;  
  flex-direction: row-reverse;
  flex: 0 0 40px;
`
const Avatar = styled.img`
  width: 32px;
  height: 32px;
  padding: 0 10px;
`
const PlayerName = styled.a`
  flex: 2;
  text-decoration: none;
  color: black;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align-last: center;

  &:hover {
    color: blue;
  }
`
const HeroImage = styled.div`
  width: 32px;
  height: 32px;
  margin: ${props => props.margin};
  ${props => props.background};
  `
const JoinButton = styled.button`
  flex: 1;
  margin: 0 10px;
`
const KickButton = styled.button`
  position: absolute;
  width: 32px;
  height: 32px;
  left: ${props => props.left};
`
const SeparatorItem = styled.div`
  font-weight: 700;
  font-size: 16px;
  position: absolute;
  background-color: #fae6ab;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  text-align: center;
  line-height: 59px;
  left: 49%;
  top: 159px;
  border: 1px solid;
  margin-top: -10px;
  margin-left: -25px;
  box-sizing: border-box
`
const Footer = styled.div`
  position: absolute;
  top: -50px;
  display: flex;
  height: 50px;
  align-items: center;
  justify-content: center;
`
const CountdownWrapper = styled.div`
  position: absolute;
  background-color: #fae6ab;
  width: 70px;
  height: 70px;
  left: 47.9%;
  top: 144px;
  margin-top: -10px;
  margin-left: -25px;
  border-radius: 50%;
  border: 1px solid;
`
const messages = defineMessages({
  alreadyInTeam: {
    id: "general.alreadyInTeam",
    defaultMessage: "You are already in a team"
  },
  wrongPassword: {
    id: "general.wrongPassword",
    defaultMessage: "Wrong password"
  },
  waiting: {
    id: "tournament.matches.status.waiting",
    defaultMessage: "Waiting"
  },
  lobby: {
    id: "tournament.matches.status.lobby",
    defaultMessage: "Lobby created"
  },
  lobbyPaused: {
    id: "tournament.matches.status.lobbyPaused",
    defaultMessage: "Lobby paused"
  },
  matchPicks: {
    id: "tournament.matches.status.matchPicks",
    defaultMessage: "Picks/Bans in progress"
  },
  matchGame: {
    id: "tournament.matches.status.matchGame",
    defaultMessage: "Match in progress"
  },
  matchFinished: {
    id: "tournament.matches.status.matchFinished",
    defaultMessage: "Match finished"
  },
  unavailable: {
    id: "tournament.matches.status.unavailable",
    defaultMessage: "Match status unavailable"
  },
  kickConfirm: {
    id: "tournament.brackets.match-modal.kickConfirm",
    defaultMessage: "Kick {playerName} from the team {teamName}?"
  },
  joinConfirm: {
    id: "tournament.brackets.match-modal.joinConfirm",
    defaultMessage: "Join the team {teamName}"
  },
  joinConfirmPassword: {
    id: "tournament.brackets.match-modal.joinConfirmPassword",
    defaultMessage: "Insert team's password"
  },
  joinTimeAlert: {
    id: "tournament.brackets.match-modal.joinTimeAlert",
    defaultMessage: "You must wait 1 minute before trying to join a team again"
  },
  joinButton: {
    id: "general.joinButton",
    defaultMessage: "Join"
  }
})

class Match extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isJoinButtonDisabled: false
    }
  }

  kickPlayer(team, account_id, teamName, playerName, event) {
    const element = event.target
    element.disabled = true
    Popup.confirm(this.props.intl.formatMessage(messages.kickConfirm, { playerName, teamName }), (confirmed) => {
      if (confirmed) {
        axios.post("tournament/bot_kick_player", {
          _csrf: this.props.csrfToken,
          matchId: this.props.match.id,
          team,
          teamName,
          account_id
        })
          .then(() => {
            element.disabled = false
          })
          .catch(err => {
            Popup.error(err.response && err.response.data || err.toString())
            element.disabled = false
          })
      }
      else {
        element.disabled = false
      }
    })
  }

  joinTeam(team, teamName) {
    if (!this.props.isLoggedIn) {
      return Popup.alertLogin()
    }
    this.setState({ isJoinButtonDisabled: true })
    if (this.props.isInTeam) {
      Popup.alert(this.props.intl.formatMessage(messages.alreadyInTeam))
      this.setState({ isJoinButtonDisabled: false })
      return
    }
    else {
      if (this.props.teams[team == "radiant" ? 0 : 1].password) {
        Popup.input(this.props.intl.formatMessage(messages.joinConfirmPassword), password => {
          if (password) {
            axios.post("tournament/bot_player_join_team", {
              _csrf: this.props.csrfToken,
              matchId: this.props.match.id,
              team,
              teamName,
              password
            })
              .then(res => {
                this.setState({ isJoinButtonDisabled: false })
                if (res.data == "wait") {
                  return Popup.alert(this.props.intl.formatMessage(messages.joinTimeAlert))
                }
                if (res.data == "password") {
                  return Popup.alert(this.props.intl.formatMessage(messages.wrongPassword))
                }
              })
              .catch(err => {
                Popup.error(err.response && err.response.data || err.toString())
              })
          }
          else {
            this.setState({ isJoinButtonDisabled: false })
          }
        })
      }
      else {
        Popup.confirm(this.props.intl.formatMessage(messages.joinConfirm, { teamName }), confirmed => {
          if (confirmed) {
            axios.post("tournament/bot_player_join_team", {
              _csrf: this.props.csrfToken,
              matchId: this.props.match.id,
              team,
              teamName
            })
              .then(res => {
                if (res.data == "wait") {
                  Popup.alert(this.props.intl.formatMessage(messages.joinTimeAlert))
                }
                this.setState({ isJoinButtonDisabled: false })
              })
              .catch(err => {
                Popup.error(err.response && err.response.data || err.toString())
              })
          }
          else {
            this.setState({ isJoinButtonDisabled: false })
          }
        })
      }
    }
  }

  render() {
    if (!this.props.match) {
      return null
    }
    let key = 0

    let status
    switch (this.props.match.status) {
      case "WAITING":
        status = this.props.intl.formatMessage(messages.waiting)
        break
      case "LOBBY":
        status = this.props.intl.formatMessage(messages.lobby)
        break
      case "LOBBY_PAUSED":
        status = this.props.intl.formatMessage(messages.lobbyPaused)
        break
      case "MATCH_PICKS":
        status = this.props.intl.formatMessage(messages.matchPicks)
        break
      case "MATCH_GAME":
        status = this.props.intl.formatMessage(messages.matchGame)
        break
      case "MATCH_FINISHED":
        status = this.props.intl.formatMessage(messages.matchFinished)
        break
      default:
        status = this.props.intl.formatMessage(messages.unavailable)
    }

    const radiantMapped = [], direMapped = []

    if (this.props.teams[0]) {
      for (let i = 0; i < 5; i++) {
        const player = i < this.props.teams[0].players.length ? this.props.teams[0].players[i] : null
        if (player) {
          let heroImage, kickButton
          if (this.props.match.teamTop.heroes && this.props.match.teamTop.heroes[i]) {
            heroImage = <HeroImage
              margin={"0 35px 0 10px"}
              background={`background: url(http://cdn.dota2.com/apps/dota2/images/heroes/${heroes[this.props.match.teamTop.heroes[i]].name}_sb.png) 50% 50% no-repeat;`} />
          }
          else {
            heroImage = <HeroImage margin={"0 35px 0 10px"} />
          }
          if (this.props.isAdmin && (this.props.match.status == "WAITING" || this.props.match.status.slice(0, 5) == "LOBBY")) {
            kickButton = <KickButton left={"-40px"} onClick={this.kickPlayer.bind(this, "radiant", player.account_id, this.props.teams[0].name, player.steamname)}>x</KickButton>
          }
          radiantMapped.push(
            <RadiantPlayer key={key++}>
              <Avatar src={player.steamavatar[0]} />
              <PlayerName href={player.profileurl} target="_blank">{player.steamname}</PlayerName>
              {heroImage}
              {kickButton}
            </RadiantPlayer>
          )
        }
        else if (this.props.match.status == "WAITING" || this.props.match.status.slice(0, 5) == "LOBBY") {
          radiantMapped.push(
            <DirePlayer key={key++}>
              <JoinButton disabled={this.state.isJoinButtonDisabled} onClick={this.joinTeam.bind(this, "radiant", this.props.teams[0].name)}>{this.props.intl.formatMessage(messages.joinButton)}</JoinButton>
            </DirePlayer>
          )
        }
      }
    }
    if (this.props.teams[1]) {
      for (let i = 0; i < 5; i++) {
        const player = i < this.props.teams[1].players.length ? this.props.teams[1].players[i] : null
        if (player) {
          let heroImage, kickButton
          if (this.props.match.teamBottom.heroes && this.props.match.teamBottom.heroes[i]) {
            heroImage = <HeroImage
              margin={"0 10px 0 35px"}
              background={`background: url(http://cdn.dota2.com/apps/dota2/images/heroes/${heroes[this.props.match.teamBottom.heroes[i]].name}_sb.png) 50% 50% no-repeat;`} />
          }
          else {
            heroImage = <HeroImage margin={"0 10px 0 35px"} />
          }
          if (this.props.isAdmin && (this.props.match.status == "WAITING" || this.props.match.status.slice(0, 5) == "LOBBY")) {
            kickButton = <KickButton left={"508px"} onClick={this.kickPlayer.bind(this, "dire", player.account_id, this.props.teams[1].name, player.steamname)}>x</KickButton>
          }
          direMapped.push(
            <DirePlayer key={key++}>
              <Avatar src={player.steamavatar[0]} />
              <PlayerName href={player.profileurl} target="_blank">{player.steamname}</PlayerName>
              {heroImage}
              {kickButton}
            </DirePlayer>
          )
        }
        else if (this.props.match.status == "WAITING" || this.props.match.status.slice(0, 5) == "LOBBY") {
          direMapped.push(
            <DirePlayer key={key++}>
              <JoinButton disabled={this.state.isJoinButtonDisabled} onClick={this.joinTeam.bind(this, "dire", this.props.teams[1].name)}>{this.props.intl.formatMessage(messages.joinButton)}</JoinButton>
            </DirePlayer>
          )
        }
      }
    }

    let radiantName = this.props.teams[0] ? this.props.teams[0].name : "???"
    let direName = this.props.teams[1] ? this.props.teams[1].name : "???"

    let footer = []
    if (this.props.isAdmin) {
      footer = (
        <Footer>
          <LobbyInviteButton matchId={this.props.match.id} />
          <MatchAddCasterButton matchId={this.props.match.id} />
          <MatchScoreButton matchId={this.props.match.id} />
          <PauseLobbyButton matchId={this.props.match.id} />
          <LobbyServerButton matchId={this.props.match.id} />
          <KillBotButton matchId={this.props.match.id} />
        </Footer>
      )
    }
    else if (this.props.isCaster) {
      footer = (
        <Footer>
          <MatchAddCasterButton matchId={this.props.match.id} />
        </Footer>
      )
    }

    let middleItem
    if (this.props.match.status == "LOBBY" || this.props.match.status == "LOBBY_PAUSED") {
      middleItem = (
        <CountdownWrapper>
          <LobbyCountdown key={key++} match={this.props.match} size={70} />
        </CountdownWrapper>
      )
    }
    else if (this.props.match.status == "MATCH_PICKS" || this.props.match.status == "MATCH_GAME") {
      middleItem = (
        <SeparatorItem>
          <Timer startTS={this.props.match.timestamp} />
        </SeparatorItem>
      )
    }
    else {
      middleItem = <SeparatorItem>VS</SeparatorItem>
    }

    return (
      <Wrapper>
        <Header>
          {status}
        </Header>
        <Teams>
          <Radiant winner={this.props.match.winner == 1 ? true : false}>
            <TeamHeader>
              <TeamName>{radiantName}</TeamName>
            </TeamHeader>
            {radiantMapped}
          </Radiant>
          {middleItem}
          <Dire winner={this.props.match.winner == 2 ? true : false}>
            <TeamHeader>
              <TeamName>{direName}</TeamName>
            </TeamHeader>
            {direMapped}
          </Dire>
        </Teams>
        {footer}
      </Wrapper>
    )
  }
}

Match.propTypes = {
  isLoggedIn: PropTypes.bool,
  isInTeam: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isCaster: PropTypes.bool,
  match: PropTypes.object,
  matchId: PropTypes.shape({
    s: PropTypes.number.isRequired,
    r: PropTypes.number.isRequired,
    m: PropTypes.number.isRequired
  }),
  teams: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      players: PropTypes.arrayOf(
        PropTypes.shape({
          account_id: PropTypes.string,
          steamname: PropTypes.string,
          steamavatar: PropTypes.arrayOf(PropTypes.string)
        })
      ),
      password: PropTypes.bool
    })
  )
}

function mapStateToProps(state, ownProps) {
  let isAdmin, isCaster
  if (state.user) {
    isAdmin = state.user.admin ? true : false
    isCaster = state.user.caster ? true : false
  }
  if (ownProps.tournament && ownProps.matchId) {
    const match = ownProps.tournament.rounds[ownProps.matchId.r - 1][ownProps.matchId.m - 1]
    const teamTop = match.teamTop ? match.teamTop : {}
    const teamBottom = match.teamBottom ? match.teamBottom : {}
    return {
      isInTeam: true,
      match,
      teams: [
        ownProps.tournament.teams[teamTop.id - 1],
        ownProps.tournament.teams[teamBottom.id - 1]
      ]
    }
  }
  if (ownProps.matchId) {
    const match = state.tournament.rounds[ownProps.matchId.r - 1][ownProps.matchId.m - 1]
    return {
      isAdmin,
      isCaster,
      isInTeam: !!state.tournament.user.team,
      isLoggedIn: !!state.user._id,
      match,
      teams: [
        state.tournament.teams[match.teamTop.id - 1],
        state.tournament.teams[match.teamBottom.id - 1]
      ],
      csrfToken: state.user.csrfToken
    }
  }
  return {}
}

export default connect(mapStateToProps)(injectIntl(Match))