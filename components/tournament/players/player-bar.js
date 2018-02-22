import { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"

const Bar = styled.div`
  display: flex;
  background-color: green;
  border-style: double;
  height: 23px;
`
const Flag = styled.span`
  align-self: center;
  margin: 0 10px;
`
const PlayerName = styled.span`
  flex: 1 1;
  border-right-style: solid;
  padding: 3px 0 0 5px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`
const Roles = styled.div`
  flex: 0 1 60px;
  padding: 3px 0 0 5px;
  border-right-style: solid;
`
const InfoButton = styled.button`
  flex: 0 1 60px;
`
class PlayerBar extends Component {
  render() {
    let rolesNumbers = ""
    for (let i = 0; i < 5; i++) {
      if (this.props.player.parameters[i]) {
        rolesNumbers += `${i + 1}`
      }
    }

    return (
      <Bar className={this.props.className}>
        <Flag className={`flag${this.props.player.loccountrycode ? ` flag-${this.props.player.loccountrycode}` : ""}`} />
        <PlayerName>{this.props.player.steamname}</PlayerName>
        <Roles>{rolesNumbers.split("").toString()}</Roles>
        <InfoButton onClick={this.props.showPlayerInfo}>Info</InfoButton>
      </Bar>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const player = ownProps.player ?
    {
      loccountrycode: ownProps.player.user.loccountrycode,
      steamname: ownProps.player.user.steamname,
      parameters: ownProps.player.parameters.split("").map(item => item == "0" ? false : true)
    }
    : {
      loccountrycode: state.user.loccountrycode,
      steamname: state.user.steamname,
      parameters: state.tournament.user.player.parameters.split("").map(item => item == "0" ? false : true)
    }
  return {
    csrfToken: state.user.csrfToken,
    player
  }
}

export default connect(mapStateToProps)(PlayerBar)