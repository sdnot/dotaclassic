import { Component } from "react"
import { connect } from "react-redux"
import PlayerBar from "./player-bar"
import PlayerModal from "./player-modal"

class Players extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedPlayer: null
    }
  }

  showPlayerInfo = (player) => {
    this.setState({ selectedPlayer: player }, () => {
      this.playerModal.show()
    })
  }

  render() {
    const playersMapped = []
    this.props.players.forEach((player, key) => {
      playersMapped.push(<PlayerBar key={key} player={player} showPlayerInfo={() => this.showPlayerInfo(player)} />)
    })
    return (
      <div>
        <PlayerModal ref={instance => this.playerModal = instance} player={this.state.selectedPlayer} />
        {playersMapped}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    players: state.tournament.players
  }
}

export default connect(mapStateToProps)(Players)