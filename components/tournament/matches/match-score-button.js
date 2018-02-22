import { Component } from "react"
import { connect } from "react-redux"
import { defineMessages, injectIntl } from "react-intl"
import PropTypes from "prop-types"
import styled from "styled-components"
import axios from "axios"
import Popup from "../../popup"

const Button = styled.button`
  background-color: lightpink;
  text-align: center;
`
const messages = defineMessages({
  forceRadiantVictory: {
    id: "tournament.matches.forceRadiantVictory",
    defaultMessage: "Force radiant victory"
  },
  forceDireVictory: {
    id: "tournament.matches.forceDireVictory",
    defaultMessage: "Force dire victory"
  }
})
class MatchScoreButton extends Component {

  scoreTeam(score) {
    this.top.disabled = true
    this.bottom.disabled = true
    Popup.confirm("CONFIRM", confirmed => {
      if (confirmed) {
        axios.post("tournament/score", {
          _csrf: this.props.csrfToken,
          matchId: this.props.matchId,
          score
        })
          .then(() => {
            if (this.top && this.bottom) {
              this.top.disabled = false
              this.bottom.disabled = false
            }
          })
          .catch(err => {
            Popup.error(err.response && err.response.data || err.toString())
          })
      }
      else {
        if (this.top && this.bottom) {
          this.top.disabled = false
          this.bottom.disabled = false
        }
      }
    })
  }

  render() {
    if (this.props.matchId) {
      return (
        <div>
          <Button ref={node => this.top = node} onClick={() => this.scoreTeam([1, 0])}>{this.props.intl.formatMessage(messages.forceRadiantVictory)}</Button>
          <Button ref={node => this.bottom = node} onClick={() => this.scoreTeam([0, 1])}>{this.props.intl.formatMessage(messages.forceDireVictory)}</Button>
        </div>
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

MatchScoreButton.propTypes = {
  matchId: PropTypes.shape({
    s: PropTypes.number,
    r: PropTypes.number,
    m: PropTypes.number
  })
}

export default connect(mapStateToProps)(injectIntl(MatchScoreButton))