import { Component } from "react"
import { connect } from "react-redux"
import { defineMessages, injectIntl } from "react-intl"
import styled from "styled-components"
import io from "socket.io-client"
import { update_tournament, kicked, update_players, update_teams, update_matches, leave_player, check_in } from "../../actions/tournament"
import Teams from "./teams"
import Brackets from "./brackets"
import DragScroll from "../../components/drag-scroll"
import Popup from "../popup"
import CheckInCountdown from "./check-in-countdown"
import DateCountdown from "../date-countdown"
import RulesModal from "./rules-modal"
import WindowResizeListener from "../util/window-resize-listener"
import RegisterTeamButton from "./teams/register-team-button"
import PlayerTeamBar from "./teams/player-team-bar"
import TournamentsMenu from "./tournaments-menu"
import WinnerTeam from "./teams/winner-team"
import Players from "./players"
import RegisterPlayerButton from "./players/register-player-button"
import axios from "axios"
import UserMatchModal from "./matches/user-match-modal"
import DonateButton from "../paypal/donate-button"

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
`
const RowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  ${props => props.height ? `height: ${props.height};` : ""}

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
    height: initial;
  }
`
const ColContainer = styled.div`
  background-color: #fae6ab;
  border-radius: 3px;
  padding: 12px;
  box-sizing: border-box;
  ${props => props.width ? `width: ${props.width};` : ""}

  @media (max-width: 767px) {
    width: initial;
    margin-bottom: 15px;
  }
`
const List = styled(ColContainer) `
  align-self: flex-start;

  @media (max-width: 767px) {
    align-self: stretch;
  }
`
const ListTitle = styled.div`
  font-size: 1.5em;
  text-align: center;
  margin-bottom: 10px;
`
const DateSectionWrapper = styled(ColContainer) `
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`
const DateInformation = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const DateHours = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;

  div {
    text-align: center;

    span {
      font-size: 1.5em;
    }
  }
`
const DateStyled = styled.div`
  font-size: 1.5em;
  text-align: center;
`
const PrizeWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 767px) {
    margin: 20px 0;
  }
`
const Prize = styled.div`
  font-size: 1.5em;
  margin-right: 20px;
`
const MenuWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;

  @media (max-width: 767px) {
    flex-direction: column;
  }
`
const PlayerPanel = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  height: 100%;
`
const Status = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
`
const StatusTitle = styled.div`
  flex: 0 1;
  text-align: center;
  font-size: 1.5em;
  margin-top: ${props => props.marginTop ? "0" : props.marginTop};

  @media (max-width: 767px) {
    margin-top: 0;
    margin-bottom: 10px;
  }
`
const StatusContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
`
const CheckInStatus = styled.div`
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  border: solid;
  box-sizing: border-box;
  color: ${props => props.checkIn ? "green" : "red"};
`
const CheckInWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
`
const CheckInButtonClock = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: center;

  button {
    flex: 0 1 180px;
  }
`
const CheckInCountdownStyled = styled(CheckInCountdown) `
  flex: 0 0 ${props => props.size}px;
`
const CountdownTitle = styled.div`
  text-align: center;
  margin-bottom: 10px;
`
const RegisterTeamButtonStyled = styled(RegisterTeamButton) `
  width: 250px;
  height: 50px;
`
const RegisterPlayerButtonStyled = styled(RegisterPlayerButton) `
  width: 250px;
  height: 50px;
`
const CancelPlayerButton = styled.button`
  width: 250px;
  height: 50px;
`
const CenteredStatus = styled(Status) `
  justify-content: space-around;
`
const BracketsScroll = styled(DragScroll) `
  border: 1px solid
`
const LoadingWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`
const messages = defineMessages({
  prize: {
    id: "general.prize",
    defaultMessage: "Prize"
  },
  kicked: {
    id: "tournament.kicked",
    defaultMessage: "You have been kicked from the team {teamName}"
  },
  checkInCountdown: {
    id: "tournament.checkInCountdown",
    defaultMessage: "Countdown for tournament check-in"
  },
  checkInInfo: {
    id: "tournament.checkInInfo",
    defaultMessage: "After the 15 minute check-in phase the tournament will begin"
  },
  signedUpTeams: {
    id: "tournament.signedUpTeams",
    defaultMessage: "Registered teams"
  },
  inProgress: {
    id: "tournament.inProgress",
    defaultMessage: "Tournament in progress"
  },
  finished: {
    id: "tournament.finished",
    defaultMessage: "Tournament finished"
  },
  canceled: {
    id: "tournament.canceled",
    defaultMessage: "The tournament has been canceled, contact an administrator for more information"
  },
  loading: {
    id: "general.loading",
    defaultMessage: "LOADING"
  },
  signUpCountdown: {
    id: "tournament.signUpCountdown",
    defaultMessage: "Countdown for start of sign ups"
  },
  tournamentStartDate: {
    id: "tournament.tournamentStartDate",
    defaultMessage: "Tournament date"
  },
  rules: {
    id: "tournament.rules",
    defaultMessage: "Tournament rules"
  },
  startTime: {
    id: "tournament.startTime",
    defaultMessage: "Start"
  },
  checkInTime: {
    id: "tournament.checkInTime",
    defaultMessage: "Check-in"
  },
  teamsRegistered: {
    id: "tournament.teamsRegistered",
    defaultMessage: "Teams registered"
  },
  playersLookingTeam: {
    id: "tournament.playersLookingTeam",
    defaultMessage: "Players looking for team"
  },
  signUpsOpen: {
    id: "tournament.signUpsOpen",
    defaultMessage: "Sign-ups are currently open"
  },
  stopLookingTeam: {
    id: "tournament.stopLookingTeam",
    defaultMessage: "Stop looking for team"
  },
  stopLookingTeamConfirm: {
    id: "tournament.stopLookingTeamConfirm",
    defaultMessage: "Are you sure you want to stop looking for a team?"
  },
  checkInAlert: {
    id: "tournament.teams.captain.checkInAlert",
    defaultMessage: "The team must have a minimun of 5 players to participate in the tournament"
  },
  checkInConfirm: {
    id: "tournament.teams.captain.checkInConfirm",
    defaultMessage: "Confirm participation of the team"
  },
  checkInCancel: {
    id: "tournament.teams.captain.checkInCancel",
    defaultMessage: "Cancel participation of the team"
  },
  isCheckedInCaptain: {
    id: "tournament.teams.captain.isCheckedIn",
    defaultMessage: "Team checked in, awaiting tournament start"
  },
  isNotCheckedInCaptain: {
    id: "tournament.teams.captain.isNotCheckedIn",
    defaultMessage: "You must confirm the participation of your team"
  },
  isCheckedIn: {
    id: "tournament.teams.player.isCheckedIn",
    defaultMessage: "Team checked in, awaiting tournament start"
  },
  isNotCheckedIn: {
    id: "tournament.teams.player.isNotCheckedIn",
    defaultMessage: "The captain must confirm the participation of the team"
  },
  matchInformation: {
    id: "tournament.matchInformation",
    defaultMessage: "Match information"
  }
})
class Tournament extends Component {
  constructor(props) {
    super(props)
    this.state = {
      windowWidth: 0,
      windowHeight: 0
    }
  }

  componentDidMount() {
    this.socket = io.connect("/tournament")

    this.socket.on("connect", () => {
      if (this.props.account_id) {
        this.socket.emit("room", this.props.account_id)
      }
    })

    this.socket.on("tournament", tournament => {
      this.props.dispatch(update_tournament({ ...tournament }))
    })

    this.socket.on("players", players => {
      this.props.dispatch(update_players(players))
    })

    this.socket.on("teams", teams => {
      this.props.dispatch(update_teams(teams))
    })

    this.socket.on("matches", matches => {
      this.props.dispatch(update_matches(matches))
    })

    this.socket.on("kicked", () => {
      Popup.alert(this.props.intl.formatMessage(messages.kicked, { teamName: this.props.userTeamName }))
      this.props.dispatch(kicked())
    })
  }

  componentWillUnmount = () => {
    this.socket.disconnect()
  }

  cancelPlayer = () => {
    Popup.confirm(this.props.intl.formatMessage(messages.stopLookingTeamConfirm), confirmed => {
      if (confirmed) {
        axios.post("tournament/leave_player", {
          _csrf: this.props.csrfToken
        })
          .then(() => {
            this.props.dispatch(leave_player())
          })
          .catch(err => {
            Popup.error(err.response && err.response.data || err.toString())
          })
      }
    })
  }

  checkIn = (event) => {
    const element = event.target
    element.disabled = true
    // if (this.props.team.players.length < 5) {
    //   Popup.alert(this.props.intl.formatMessage(messages.checkInAlert))
    //   element.disabled = false
    //   return
    // }
    const confirmMessage = this.props.team.checkIn ?
      this.props.intl.formatMessage(messages.checkInCancel)
      : this.props.intl.formatMessage(messages.checkInConfirm)
    Popup.confirm(confirmMessage, (confirmed) => {
      if (confirmed) {
        axios.post("tournament/team_checkin", {
          _csrf: this.props.csrfToken,
          teamName: this.props.team.name
        })
          .then(() => {
            this.props.dispatch(check_in())
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

  render() {
    let key = 0

    let dateSection = <LoadingWrapper>{this.props.intl.formatMessage(messages.loading)}</LoadingWrapper>,
      statusSection = <LoadingWrapper>{this.props.intl.formatMessage(messages.loading)}</LoadingWrapper>,
      playerSection = <LoadingWrapper>{this.props.intl.formatMessage(messages.loading)}</LoadingWrapper>,
      contentSection = (
        <RowContainer>
          <ColContainer width={"100%"}>
            <LoadingWrapper>{this.props.intl.formatMessage(messages.loading)}</LoadingWrapper>
          </ColContainer>
        </RowContainer>
      )

    if (this.props.startDate) {
      dateSection = [
        <DateInformation key={key++}>
          <div>{this.props.intl.formatMessage(messages.tournamentStartDate)}</div>
          <DateStyled>{
            this.props.intl.formatDate(this.props.startDate, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })
          }</DateStyled>
        </DateInformation>,
        <PrizeWrapper key={key++}>
          <Prize>{this.props.intl.formatMessage(messages.prize)}: ${this.props.prize} </Prize>
          <DonateButton />
        </PrizeWrapper>,
        <DateHours key={key++}>
          <div>
            <div>{this.props.intl.formatMessage(messages.checkInTime)}</div>
            <span>{
              this.props.intl.formatDate(this.props.startDate, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })
            }</span>
          </div>
          <div>
            <div>{this.props.intl.formatMessage(messages.startTime)}</div>
            <span>{
              this.props.intl.formatDate(new Date(this.props.startDate).getTime() + 900000, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })
            }</span>
          </div>
        </DateHours>
      ]
    }

    if (this.props.status == "SIGN_UP") {
      statusSection = (
        <Status>
          <StatusTitle marginTop={"20px"}>{this.props.intl.formatMessage(messages.signUpsOpen)}</StatusTitle>
          <StatusContent>
            <CountdownTitle>{this.props.intl.formatMessage(messages.checkInCountdown)}</CountdownTitle>
            <DateCountdown date={this.props.startDate} />
          </StatusContent>
        </Status>
      )
    }
    else if (this.props.status == "CHECK_IN") {
      let content, button
      if (this.props.team) {
        if (this.props.team.players[0].account_id == this.props.account_id) {
          content = <CheckInStatus key={key++} checkIn={this.props.team.checkIn}>{this.props.intl.formatMessage(this.props.team.checkIn ? messages.isCheckedInCaptain : messages.isNotCheckedInCaptain)}</CheckInStatus>
          button = <button key={key++} onClick={this.checkIn}>{this.props.intl.formatMessage(this.props.team.checkIn ? messages.checkInCancel : messages.checkInConfirm)}</button>
        }
        else {
          content = <CheckInStatus checkIn={this.props.team.checkIn}>{this.props.intl.formatMessage(this.props.team.checkIn ? messages.isCheckedIn : messages.isNotCheckedIn)}</CheckInStatus>
        }
      }
      statusSection = (
        <Status>
          <StatusTitle>{this.props.intl.formatMessage(messages.checkInTime)}</StatusTitle>
          <CheckInWrapper>
            <CheckInButtonClock>
              {button}
              <CheckInCountdownStyled size={80} />
            </CheckInButtonClock>
          </CheckInWrapper>
          {content}
        </Status>
      )
    }
    else if (this.props.status == "STARTED") {
      let userMatch = this.props.team ?
        [
          <UserMatchModal key={key++} ref={instance => this.userMatchModal = instance} />,
          <button key={key++} onClick={() => this.userMatchModal.show()}>{this.props.intl.formatMessage(messages.matchInformation)}</button>
        ]
        : undefined
      statusSection = (
        <CenteredStatus>
          <StatusTitle>{this.props.intl.formatMessage(messages.inProgress)}</StatusTitle>
          {userMatch}
        </CenteredStatus>
      )
    }
    else if (this.props.status == "FINISHED") {
      statusSection = (
        <Status>
          <StatusTitle marginTop={"20px"}>{this.props.intl.formatMessage(messages.finished)}</StatusTitle>
          <StatusContent>
            <CountdownTitle>{this.props.intl.formatMessage(messages.signUpCountdown)}</CountdownTitle>
            <DateCountdown date={this.props.signUpDate} />
          </StatusContent>
        </Status>
      )
    }
    else if (this.props.status == "CANCELED") {
      return (
        <CenteredStatus>
          <StatusTitle>{this.props.intl.formatMessage(messages.canceled)}</StatusTitle>
        </CenteredStatus>
      )
    }

    if (this.props.status == "SIGN_UP" || this.props.status == "CHECK_IN") {
      if (this.props.isUserPlayer) {
        playerSection = (
          <PlayerPanel>
            <RegisterTeamButtonStyled />
            <CancelPlayerButton onClick={this.cancelPlayer}>{this.props.intl.formatMessage(messages.stopLookingTeam)}</CancelPlayerButton>
          </PlayerPanel>
        )
      }
      else if (this.props.team) {
        playerSection = <PlayerTeamBar />
      }
      else {
        playerSection = (
          <PlayerPanel>
            <RegisterTeamButtonStyled />
            <RegisterPlayerButtonStyled />
          </PlayerPanel>
        )
      }

      contentSection = (
        <RowContainer>
          <List width={"48%"}>
            <ListTitle>{this.props.intl.formatMessage(messages.teamsRegistered)}</ListTitle>
            <Teams />
          </List>
          <List width={"48%"}>
            <ListTitle>{this.props.intl.formatMessage(messages.playersLookingTeam)}</ListTitle>
            <Players />
          </List>
        </RowContainer>
      )
    }
    else if (this.props.status == "STARTED" || this.props.status == "FINISHED") {

      if (this.props.team) {
        playerSection = <PlayerTeamBar />
      }
      else {
        playerSection = (
          <PlayerPanel>
            <RegisterTeamButtonStyled disabled={true} />
            <RegisterPlayerButtonStyled disabled={true} />
          </PlayerPanel>
        )
      }

      contentSection = (
        <RowContainer>
          <ColContainer width={"100%"}>
            <BracketsScroll width={this.state.windowWidth - 200} height={this.state.windowHeight - 150}>
              <Brackets />
            </BracketsScroll>
          </ColContainer>
        </RowContainer>
      )
    }

    return (
      <Wrapper>
        <WindowResizeListener onResize={windowSize => {
          this.setState({ ...windowSize })
        }} />
        <RulesModal
          ref={instance => this.rulesModal = instance}
          width={this.state.windowWidth - 300}
          height={this.state.windowHeight - 100}
        />
        <RowContainer>
          <ColContainer width={"100%"}>
            <MenuWrapper>
              <button onClick={() => this.rulesModal.getWrappedInstance().show()}>{this.props.intl.formatMessage(messages.rules)}</button>
              <WinnerTeam />
              <TournamentsMenu />
            </MenuWrapper>
          </ColContainer>
        </RowContainer>
        <RowContainer height={"214px"}>
          <DateSectionWrapper width={"28%"}>
            {dateSection}
          </DateSectionWrapper>
          <ColContainer width={"28%"}>
            {statusSection}
          </ColContainer>
          <ColContainer width={"40%"}>
            {playerSection}
          </ColContainer>
        </RowContainer>
        {contentSection}
      </Wrapper>
    )
  }
}

function mapStateToProps(state) {
  return {
    account_id: state.user.account_id,
    csrfToken: state.user.csrfToken,
    roundsLength: state.tournament.rounds.length,
    startDate: state.tournament.startDate,
    signUpDate: state.tournament.signUpDate,
    status: state.tournament.status,
    registeredTeams: state.tournament.teams.length,
    isUserPlayer: state.tournament.user.player ? true : false,
    team: state.tournament.user.team && state.tournament.teams[state.tournament.user.team.id - 1],
    prize: state.tournament.prize
  }
}

export default connect(mapStateToProps)(injectIntl(Tournament))