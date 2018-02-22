import { Component } from "react"
import { connect } from "react-redux"
import { defineMessages, injectIntl } from "react-intl"
import PropTypes from "prop-types"
import styled from "styled-components"
import axios from "axios"
import Popup from "../../popup"
import LobbyInviteButton from "./lobby-invite-button"

const Button = styled.button`
  background-color: #3be26d;
  text-align: center;
`
const messages = defineMessages({
  addCasterConfirm: {
    id: "tournament.matches.addCasterConfirm",
    defaultMessage: "You will be added to the caster list of this match on confirmation"
  },
  addCasterButton: {
    id: "tournament.matches.addCasterButton",
    defaultMessage: "Join as a caster"
  }
})
class MatchAddCasterButton extends Component {

  addCaster() {
    Popup.confirm(this.props.intl.formatMessage(messages.addCasterConfirm), (confirmed) => {
      if (confirmed) {
        axios.post("tournament/add_caster", {
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
      if (this.props.casters) {
        for (let i = 0; i < this.props.casters.length; i++) {
          if (this.props.casters[i] == this.props.userId) {
            return <LobbyInviteButton matchId={this.props.matchId} isDisabled={this.props.status == "LOBBY" ? false : true} />
          }
        }
      }
      return (
        <Button onClick={() => this.addCaster()}>{this.props.intl.formatMessage(messages.addCasterButton)}</Button>
      )
    }
    return null
  }
}

function mapStateToProps(state, ownProps) {
  return {
    csrfToken: state.user.csrfToken,
    casters: state.tournament.rounds[ownProps.matchId.r - 1][ownProps.matchId.m - 1].casters,
    status: state.tournament.rounds[ownProps.matchId.r - 1][ownProps.matchId.m - 1].status,
    userId: state.user._id
  }
}

MatchAddCasterButton.propTypes = {
  matchId: PropTypes.shape({
    s: PropTypes.number,
    r: PropTypes.number,
    m: PropTypes.number
  }),
  status: PropTypes.string,
  casters: PropTypes.arrayOf(PropTypes.string),
  userId: PropTypes.string
}

export default connect(mapStateToProps)(injectIntl(MatchAddCasterButton))