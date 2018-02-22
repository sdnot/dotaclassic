import { Component } from "react"
import { connect } from "react-redux"
import axios from "axios"
import Popup from "../../popup"

class LobbyServerButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedServer: 0
    }
  }

  handleChange = (event) => {
    this.setState({ selectedServer: event.target.value })
  }

  handleButton = () => {
    if (this.state.selectedServer > 0) {
      Popup.confirm("SET_SERVER_CONFIRM", confirmed => {
        if (confirmed) {
          axios.post("tournament/lobby_properties", {
            _csrf: this.props.csrfToken,
            matchId: this.props.matchId,
            properties: { server_region: parseInt(this.state.selectedServer) }
          })
            .catch(err => {
              Popup.error(err.response && err.response.data || err.toString())
            })
        }
      })
    }
  }

  render() {
    if (this.props.status.slice(0, 5) != "LOBBY") {
      return null
    }
    return (
      <div>
        <select onChange={this.handleChange} value={this.state.selectedServer}>
          <option value="0"></option>
          <option value="1">US WEST</option>
          <option value="2">US EAST</option>
          <option value="3">EUROPE</option>
          <option value="5">SINGAPORE</option>
          <option value="6">DUBAI</option>
          <option value="7">AUSTRALIA</option>
          <option value="8">STOCKHOLM</option>
          <option value="9">AUSTRIA</option>
          <option value="10">BRAZIL</option>
          <option value="11">SOUTH AFRICA</option>
          <option value="14">CHILE</option>
          <option value="15">PERU</option>
          <option value="16">INDIA</option>
          <option value="19">JAPAN</option>
        </select>
        <button onClick={this.handleButton}>SET SERVER</button>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    csrfToken: state.user.csrfToken,
    status: state.tournament.rounds[ownProps.matchId.r - 1][ownProps.matchId.m - 1].status
  }
}

export default connect(mapStateToProps)(LobbyServerButton)