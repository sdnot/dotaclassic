import { Component } from "react"
import { connect } from "react-redux"
import { defineMessages, injectIntl } from "react-intl"
import styled from "styled-components"
import Rodal from "../../rodal"
import Popup from "../../popup"
import axios from "axios"
import { signup_team } from "../../../actions/tournament"
import Portal from "react-portal"

const RegistrationTitle = styled.h1`
  margin: 12px 0;
`
const RegistrationForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const Input = styled.input`
  margin: 3px 0;
  border: solid 1px;
`
const InvalidMessage = styled.p`
  margin: 5px 10px;
`
const messages = defineMessages({
  invalidName: {
    id: "tournament.teams.register.invalidName",
    defaultMessage: "Invalid name"
  },
  invalidNameMin: {
    id: "tournament.teams.register.invalidNameMin",
    defaultMessage: "Must contain at least 4 characters"
  },
  invalidNameMax: {
    id: "tournament.teams.register.invalidNameMax",
    defaultMessage: "Must not exceed 32 characters"
  },
  invalidNameSpecial: {
    id: "tournament.teams.register.invalidNameSymbol",
    defaultMessage: "Must not contain special characters"
  },
  invalidPassword: {
    id: "tournament.teams.register.invalidPassword",
    defaultMessage: "Invalid password"
  },
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
  teamNameTaken: {
    id: "tournament.teams.register.teamNameTaken",
    defaultMessage: "The team name is already taken"
  },
  teamName: {
    id: "general.teamName",
    defaultMessage: "Team name"
  },
  passwordOptional: {
    id: "tournament.teams.register.passwordOptional",
    defaultMessage: "Password (Optional)"
  },
  registerTeamButton: {
    id: "tournament.teams.register.registerTeamButton",
    defaultMessage: "Register team"
  },
  registerTeamTitle: {
    id: "tournament.teams.register.registerTeamTitle",
    defaultMessage: "Team registration"
  },
  submit: {
    id: "general.submit",
    defaultMessage: "Submit"
  }
})
class RegisterTeamButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: "",
      password: "",
      invalid_name: "",
      invalid_password: "",
      visible: false
    }
  }

  show() {
    this.setState({
      visible: true,
      name: "",
      password: "",
      invalid_name: "",
      invalid_password: ""
    })
  }

  hide() {
    this.setState({ visible: false })
  }

  checkName() {
    const name = this.state.name.trim()
    let invalid_name = ""
    if (name.length < 4) invalid_name = `${this.props.intl.formatMessage(messages.invalidNameMin)}\n`
    else if (name.length > 32) invalid_name = `${this.props.intl.formatMessage(messages.invalidNameMax)}\n`
    if (name.length > 0 && name.search(/^[a-zA-Z0-9-_ ]+$/) < 0) {
      invalid_name += this.props.intl.formatMessage(messages.invalidNameSpecial)
    } else if (invalid_name) {
      invalid_name.trim()
    }

    this.setState({ invalid_name })

    return invalid_name
  }

  checkPassword() {
    const password = this.state.password.trim()
    let invalid_password = ""
    if (password.length > 0 && password.length < 4) invalid_password = this.props.intl.formatMessage(messages.passwordMin)
    else if (password.length > 16) invalid_password = this.props.intl.formatMessage(messages.passwordMax)

    this.setState({ invalid_password })

    return invalid_password
  }

  handleNameChange(event) {
    this.setState({ name: event.target.value })
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value })
  }

  handleClick() {
    if (this.props.isLoggedIn) {
      this.show()
    }
    else {
      Popup.alertLogin()
    }
  }

  handleSubmit(event) {
    event.preventDefault()
    const element = event.target
    element.disabled = true
    const invalid_username = this.checkName()
    const invalid_password = this.checkPassword()
    if (invalid_username || invalid_password) {
      return element.disabled = false
    }
    const name = this.state.name.trim()
    const password = this.state.password.trim()
    axios.post("/tournament/signup_team", {
      _csrf: this.props.csrfToken,
      name,
      password
    })
      .then(res => {
        if (res.data == "Name taken") {
          this.setState({ invalid_name: this.props.intl.formatMessage(messages.teamNameTaken) })
          setTimeout(() => {
            element.disabled = false
          }, 2000)
        }
        else {
          this.hide()
          this.props.dispatch(signup_team(name, password ? true : false))
        }
      })
      .catch(err => {
        Popup.error(err.response && err.response.data || err.toString())
        this.hide()
      })
  }

  render() {
    return (
      <div>
        <Portal isOpened={true}>
          <Rodal
            visible={this.state.visible}
            height={230}
            showCloseButton={true}
            onClose={this.hide.bind(this)}>
            <RegistrationForm>
              <RegistrationTitle>{this.props.intl.formatMessage(messages.registerTeamTitle)}</RegistrationTitle>
              <Input type="text" name="name" placeholder={this.props.intl.formatMessage(messages.teamName)} value={this.state.name} onChange={this.handleNameChange.bind(this)} />
              <Input type="text" name="password" placeholder={this.props.intl.formatMessage(messages.passwordOptional)} value={this.state.password} onChange={this.handlePasswordChange.bind(this)} />
              <Input type="submit" value={this.props.intl.formatMessage(messages.submit)} onClick={this.handleSubmit.bind(this)} />
            </RegistrationForm>
            <InvalidMessage hidden={!this.state.invalid_name}>{this.props.intl.formatMessage(messages.invalidName)}: {this.state.invalid_name}</InvalidMessage>
            <InvalidMessage hidden={!this.state.invalid_password}>{this.props.intl.formatMessage(messages.invalidPassword)}: {this.state.invalid_password}</InvalidMessage>
          </Rodal>
        </Portal>
        <button className={this.props.className} disabled={this.props.disabled} onClick={this.handleClick.bind(this)}>{this.props.intl.formatMessage(messages.registerTeamButton)}</button>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    csrfToken: state.user.csrfToken,
    isLoggedIn: !!state.user._id
  }
}

export default connect(mapStateToProps)(injectIntl(RegisterTeamButton))