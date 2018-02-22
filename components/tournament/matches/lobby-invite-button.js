import { Component } from "react"
import { connect } from "react-redux"
import { defineMessages, injectIntl } from "react-intl"
import PropTypes from "prop-types"
import styled from "styled-components"
import Popup from "../../popup"
import axios from "axios"

const Button = styled.button`
  opacity: ${props => {
    if (props.disabled) {
      return "0.5;"
    }
    else {
      return "1;"
    }
  }};
  background-color: orange;
  text-align: center;
`
const messages = defineMessages({
  reinviteTimeAlert: {
    id: "tournament.matches.reinviteTimeAlert",
    defaultMessage: "You must wait 1 minute since the last invite to request a new one"
  },
  inviteSent: {
    id: "tournament.matches.inviteSent",
    defaultMessage: "Invite sent"
  },
  inviteButton: {
    id: "tournament.matches.inviteButton",
    defaultMessage: "Request a new lobby invite"
  }
})
class LobbyInviteButton extends Component {

  handleClick(event) {
    event.preventDefault()
    const element = event.target
    element.disabled = true
    axios.post("tournament/reinvite", {
      _csrf: this.props.csrfToken,
      matchId: this.props.matchId
    })
      .then(res => {
        if (res.data == "wait") {
          Popup.alert(this.props.intl.formatMessage(messages.reinviteTimeAlert))
        }
        else {
          Popup.alert(this.props.intl.formatMessage(messages.inviteSent))
        }
        element.disabled = false
      })
      .catch(err => {
        Popup.error(err.response && err.response.data || err.toString())
      })
  }

  render() {
    if (this.props.matchId) {
      return (
        <Button onClick={this.handleClick.bind(this)} disabled={this.props.isDisabled}>{this.props.intl.formatMessage(messages.inviteButton)}</Button>
      )
    }
    return null
  }
}

function mapStateToProps(state) {
  return {
    csrfToken: state.user.csrfToken
  }
}

LobbyInviteButton.defaultProps = {
  isDisabled: false
}

LobbyInviteButton.propTypes = {
  matchId: PropTypes.shape({
    s: PropTypes.number,
    r: PropTypes.number,
    m: PropTypes.number
  }),
  isDisabled: PropTypes.bool
}

export default connect(mapStateToProps)(injectIntl(LobbyInviteButton))