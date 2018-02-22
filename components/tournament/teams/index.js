import { Component } from "react"
import { connect } from "react-redux"
import { defineMessages, injectIntl } from "react-intl"
import PropTypes from "prop-types"
import styled from "styled-components"
import TeamBar from "./team-bar"
import Rodal from "../../rodal"
import axios from "axios"
import { join_team } from "../../../actions/tournament"
import Popup from "../../popup"

const JoinTeamForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const JoinTeamTitle = styled.h1`
  font-size: 21px;
  margin: 12px 0;
`
const JoinTeamInput = styled.input`
  margin: 3px 0;
  border: solid 1px;
`
const JoinTeamInvalidMessage = styled.p`
  margin: 5px 10px;
`
const messages = defineMessages({
  passwordMin: {
    id: "tournament.teams.passwordMin",
    defaultMessage: "Password must contain at least 4 characters"
  },
  passwordMax: {
    id: "tournament.teams.passwordMax",
    defaultMessage: "Password must not exceed 16 characters"
  },
  wrongPassword: {
    id: "tournament.teams.wrongPassword",
    defaultMessage: "Wrong password"
  },
  password: {
    id: "general.password",
    defaultMessage: "Password"
  },
  submit: {
    id: "general.submit",
    defaultMessage: "Submit"
  },
  joinTeamTitle: {
    id: "tournament.teams.joinTeamTitle",
    defaultMessage: "Insert team's password to join"
  }
})
class Teams extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isJoinTeamModalVisible: false,
      joinTeamName: "",
      joinTeamIndex: -1,
      joinTeamPassword: "",
      invalid_joinTeamPassword: ""
    }
  }

  showJoinTeamModal(teamName, teamIndex) {
    this.setState({ joinTeamName: teamName, joinTeamIndex: teamIndex, isJoinTeamModalVisible: true, joinTeamPassword: "" })
  }

  hideJoinTeamModal() {
    this.setState({
      joinTeamName: "",
      joinTeamIndex: -1,
      isJoinTeamModalVisible: false,
      invalid_joinTeamPassword: ""
    })
  }

  handleJoinTeamPasswordChange(event) {
    this.setState({ joinTeamPassword: event.target.value })
  }

  checkJoinTeamPassword() {
    const password = this.state.joinTeamPassword.trim()
    let invalid_joinTeamPassword = ""
    if (password.length > 0 && password.length < 4) invalid_joinTeamPassword = this.props.intl.formatMessage(messages.passwordMin)
    else if (password.length > 16) invalid_joinTeamPassword = this.props.intl.formatMessage(messages.passwordMax)

    this.setState({ invalid_joinTeamPassword })

    return invalid_joinTeamPassword
  }

  handleJoinTeamSubmit(event) {
    event.preventDefault()
    if (this.checkJoinTeamPassword()) return
    const element = event.target
    element.disabled = true
    axios.post("tournament/join_team", {
      _csrf: this.props.csrfToken,
      teamName: this.state.joinTeamName,
      password: this.state.joinTeamPassword
    })
      .then(res => {
        if (res.data == "password") {
          this.setState({ invalid_joinTeamPassword: this.props.intl.formatMessage(messages.wrongPassword) })
          setTimeout(() => {
            element.disabled = false
          }, 2000)
        }
        else {
          this.props.dispatch(join_team(this.state.joinTeamIndex))
          this.hideJoinTeamModal()
          setTimeout(() => {
            element.disabled = false
          }, 1000)
        }
      })
      .catch(err => {
        Popup.error(err.response && err.response.data || err.toString())
        this.hideJoinTeamModal()
      })
  }

  render() {
    const teamsMapped = []

    for (let i = 0; i < this.props.teams.length; i++) {
      teamsMapped.push(<TeamBar team={this.props.teams[i]} key={i} index={i} showJoinTeamModal={this.showJoinTeamModal.bind(this)} />)
    }

    return (
      <div className={this.props.className}>
        <Rodal
          visible={this.state.isJoinTeamModalVisible}
          height={135}
          showCloseButton={true}
          onClose={this.hideJoinTeamModal.bind(this)}>
          <JoinTeamForm >
            <JoinTeamTitle>{this.props.intl.formatMessage(messages.joinTeamTitle)}</JoinTeamTitle>
            <JoinTeamInput type="text" name="password" placeholder={this.props.intl.formatMessage(messages.password)} value={this.state.joinTeamPassword} onChange={this.handleJoinTeamPasswordChange.bind(this)} />
            <JoinTeamInput type="submit" value={this.props.intl.formatMessage(messages.submit)} onClick={this.handleJoinTeamSubmit.bind(this)} />
          </JoinTeamForm>
          <JoinTeamInvalidMessage hidden={!this.state.invalid_joinTeamPassword}>{this.state.invalid_joinTeamPassword}</JoinTeamInvalidMessage>
        </Rodal>
        {teamsMapped}
      </div>
    )
  }
}

const teamPropType = PropTypes.shape({
  name: PropTypes.string,
  players: PropTypes.arrayOf(
    PropTypes.shape({
      account_id: PropTypes.string,
      steamname: PropTypes.string,
      steamavatar: PropTypes.arrayOf(PropTypes.string)
    })
  )
})
Teams.propTypes = {
  account_id: PropTypes.string,
  team: teamPropType,
  teams: PropTypes.arrayOf(teamPropType)
}

function mapStateToProps(state) {
  const userTeamName = state.tournament.user.team ? state.tournament.user.team.name : undefined
  return {
    account_id: state.user.account_id,
    csrfToken: state.user.csrfToken,
    teams: state.tournament.teams,
    userTeamName
  }
}

export default connect(mapStateToProps)(injectIntl(Teams))