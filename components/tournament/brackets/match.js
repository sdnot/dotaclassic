import { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

class Match extends Component {
  render() {
    const match = this.props.match

    let statusStyle = {}
    switch (match.status) {
      case "LOBBY":
        statusStyle.backgroundColor = "orange"
        break
      case "MATCH_PICKS":
      case "MATCH_GAME":
        statusStyle.backgroundColor = "green"
        break
      case "MATCH_FINISHED":
        statusStyle.backgroundColor = "grey"
        break
      case "BYE":
        statusStyle.backgroundColor = "black"
    }

    const teamTop = match.teamTop ? match.teamTop : {}
    const teamBottom = match.teamBottom ? match.teamBottom : {}

    return (
      <div>
        <div className="bracket-game" id={`s${match.id.s}r${match.id.r}m${match.id.m}`} onClick={() => this.props.showMatch(match.id)}>
          <div className={`bracket-team-top${match.winner == 1 ? " winner" : ""}`} data-id={teamTop.id} onMouseEnter={this.props.onPlayer} onMouseLeave={this.props.offPlayer}>
            <span className="team-template-team-bracket">
              <span className="team-template-text">{teamTop.name}</span>
            </span>
          </div>
          <div className={`bracket-team-bottom${match.winner == 2 ? " winner" : ""}`} data-id={teamBottom.id} onMouseEnter={this.props.onPlayer} onMouseLeave={this.props.offPlayer}>
            <span className="team-template-team-bracket">
              <span className="team-template-text">{teamBottom.name}</span>
            </span>
          </div>
          <div className={"bracket-game-status"} style={statusStyle} />
        </div>
      </div>
    )
  }
}

Match.propTypes = {
  match: PropTypes.shape({
    id: PropTypes.shape({
      s: PropTypes.number.isRequired,
      r: PropTypes.number.isRequired,
      m: PropTypes.number.isRequired
    }).isRequired,
    teamTop: PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string
    }),
    teamBottom: PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string
    })
  }).isRequired,
  showMatch: PropTypes.func,
  onPlayer: PropTypes.func,
  offPlayer: PropTypes.func
}

function mapStateToProps(state, ownProps) {
  if (ownProps.selectedTournament) {
    return {
      match: ownProps.match
    }
  }
  return {
    match: state.tournament.rounds[ownProps.match.id.r - 1][ownProps.match.id.m - 1]
  }
}

export default connect(mapStateToProps)(Match)