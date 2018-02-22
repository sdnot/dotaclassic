import { Component } from "react"
import { connect } from "react-redux"
import { defineMessages, injectIntl } from "react-intl"
import PropTypes from "prop-types"
import styled from "styled-components"
import Match from "./match"
import Portal from "react-portal"
import MatchModal from "./match-modal"

/*
<Head>
  <link rel="stylesheet" href="/static/brackets.css" />
</Head>
*/

const Wrapper = styled.div`
  padding: 20px;
`
const messages = defineMessages({
  round: {
    id: "tournament.brackets.round",
    defaultMessage: "Round"
  }
})
class Brackets extends Component {

  constructor(props) {
    super(props)
    this.k = 0
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.rounds.length == nextProps.rounds.length) {
      for (let i = 0; i < this.props.rounds.length; i++) {
        if (this.props.rounds[i].length != nextProps.rounds[i].length) {
          return true
        }
      }
      return false
    }
    else {
      return true
    }
  }
  //PENDING UNIQUE KEYS IMPLEMENTATION
  //TEMPORARY SOLUTION:
  getUniqueKey() {
    return this.k++
  }
  //
  get_html() {
    const html = []

    for (let i = 0; i < this.props.rounds.length; i++) {
      const round = this.props.rounds[i]
      const html_round = []
      const html_separator = []
      const c = Math.pow(2, i) * 36

      html_round.push(
        <div key={this.getUniqueKey()} className="bracket-header-wrapper">
          <div key={this.getUniqueKey()} className="bracket-header">{this.props.intl.formatMessage(messages.round)} {i + 1}</div>
        </div>
      )

      for (let x = 0; x < round.length; x++) {
        html_round.push(
          <div key={this.getUniqueKey()} className={`bracket-cell-r${i + 1}`} />,
          <Match key={this.getUniqueKey()}
            selectedTournament={this.props.selectedTournament}
            match={(round[x])}
            showMatch={this.showMatch}
            onPlayer={this.onPlayer}
            offPlayer={this.offPlayer} />,
          <div key={this.getUniqueKey()} className={`bracket-cell-r${i + 1}`} />
        )

        if (i < this.props.rounds.length - 1) {
          const separator = []
          if (!(x % 2)) {
            if (x == 0) {
              separator.push(
                <div key={this.getUniqueKey()} style={{ height: `${c + 39}px` }} />
              )
            }
            else {
              separator.push(
                <div key={this.getUniqueKey()} style={{ height: `${c - 1}px` }} />
              )
            }
            separator.push(
              <div key={this.getUniqueKey()} style={{
                height: `${c - 20}px`,
                borderTopRightRadius: "3px",
                border: "solid #aaa",
                borderWidth: "2px 2px 0 0"
              }} />,
              <div key={this.getUniqueKey()} style={{ height: "38px" }} />,
              <div key={this.getUniqueKey()} style={{
                height: `${c - 20}px`,
                borderBottomRightRadius: "3px",
                border: "solid #aaa",
                borderWidth: "0 2px 2px 0"
              }} />
            )
            if (i == 0) {
              separator.push(
                <div key={this.getUniqueKey()} style={{ height: "33px" }} />
              )
            }
            else {
              separator.push(
                <div key={this.getUniqueKey()} style={{ height: `${c - 3}px` }} />
              )
            }
          }
          else {
            if (x == 1) {
              separator.push(
                <div key={this.getUniqueKey()} style={{ height: `${(c * 2) + 21}px` }} />
              )
            }
            else {
              separator.push(
                <div key={this.getUniqueKey()} style={{ height: `${(c * 2) - 19}px` }} />
              )
            }
            separator.push(
              <div key={this.getUniqueKey()} style={{
                height: "6px",
                borderBottomLeftRadius: "3px",
                border: "solid #aaa",
                borderWidth: "0 0 2px 2px"
              }} />,
              <div key={this.getUniqueKey()} style={{ height: "22px" }} />,
              <div key={this.getUniqueKey()} style={{
                width: "9px",
                height: "6px",
                borderTopLeftRadius: "3px",
                border: "solid #aaa",
                borderWidth: "2px 0 0 2px"
              }} />
            )
            if (i == 0) {
              separator.push(
                <div key={this.getUniqueKey()} style={{ height: "53px" }} />
              )
            }
            else {
              separator.push(
                <div key={this.getUniqueKey()} style={{ height: `${(c * 2) - 19}px` }} />
              )
            }
          }
          html_separator.push(<div key={this.getUniqueKey()}>{separator}</div>)
        }
      }

      html.push(
        <div key={this.getUniqueKey()} className="bracket-column bracket-column-matches">
          {html_round}
        </div>
      )

      if (i < this.props.rounds.length - 1) {
        html.push(
          <div key={this.getUniqueKey()} className="bracket-column bracket-column-separator">
            {html_separator}
          </div>
        )
      }
    }

    return html
  }

  onPlayer = (event) => {
    const id = event.currentTarget.getAttribute("data-id")
    if (id) {
      this.brackets.querySelectorAll(`[data-id='${id}'`).forEach(element => {
        element.classList.add("bracket-hover")
      })
    }
  }

  offPlayer = (event) => {
    const id = event.currentTarget.getAttribute("data-id")
    if (id) {
      this.brackets.querySelectorAll(`[data-id='${id}'`).forEach(element => {
        element.classList.remove("bracket-hover")
      })
    }
  }

  showMatch = (matchId) => {
    this.matchModal.show(matchId)
  }

  render() {
    return (
      <Wrapper className="bracket" innerRef={brackets => this.brackets = brackets} style={{ width: `${this.props.rounds.length * 190 + ((this.props.rounds.length - 1) * 20)}px` }}>
        {this.get_html()}
        <Portal isOpened={true}>
          <MatchModal ref={matchModal => this.matchModal = matchModal} tournament={this.props.tournament} />
        </Portal>
      </Wrapper>
    )
  }
}

const roundsPropType = PropTypes.arrayOf(
  PropTypes.arrayOf(
    PropTypes.shape({
      teamTop: PropTypes.shape({
        name: PropTypes.string,
        id: PropTypes.string
      }),
      teamBottom: PropTypes.shape({
        name: PropTypes.string,
        id: PropTypes.string
      }),
      status: PropTypes.string,
      timestamp: PropTypes.number
    })
  )
).isRequired

Brackets.propTypes = {
  tournament: PropTypes.object,
  rounds: roundsPropType,
  selectedTournament: PropTypes.bool
}

function mapStateToProps(state, ownProps) {
  let rounds, selectedTournament
  if (ownProps.tournament) {
    rounds = ownProps.tournament.rounds
    selectedTournament = true
  }
  else {
    rounds = state.tournament.rounds
    selectedTournament = false
  }
  return {
    rounds,
    selectedTournament
  }
}

export default connect(mapStateToProps)(injectIntl(Brackets))