import { Component } from "react"
import { connect } from "react-redux"
import { defineMessages, injectIntl } from "react-intl"
import PropTypes from "prop-types"
import axios from "axios"

const messages = defineMessages({
  logoutError: {
    id: "user.logoutError",
    defaultMessage: "Error logging out"
  },
  logoutButton: {
    id: "user.logoutButton",
    defaultMessage: "Logout"
  },
  loginButton: {
    id: "user.loginButton",
    defaultMessage: "Login with Steam"
  }
})

export function login() {
  window.location.replace(`/auth/steam?returnTo=${window.location.pathname}`)
}

export function logout(event) {
  const element = event.target
  element.disabled = true
  axios.get("auth/logout")
    .then(() => {
      window.localStorage.setItem("logout", Date.now())
      window.location.reload()
    })
}

class AuthButton extends Component {

  render() {
    if (this.props.loggedin) {
      return (
        <button className={this.props.className} onClick={logout.bind(this)}>{this.props.intl.formatMessage(messages.logoutButton)}</button>
      )
    }
    else {
      return (
        <button className={this.props.className} onClick={login.bind(this)}>{this.props.intl.formatMessage(messages.loginButton)}</button>
      )
    }
  }
}

AuthButton.propTypes = {
  loggedin: PropTypes.bool
}

function mapStateToProps(state) {
  return {
    loggedin: !!state.user._id
  }
}

export default connect(mapStateToProps)(injectIntl(AuthButton))