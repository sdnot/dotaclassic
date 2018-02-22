import { Component } from "react"
import { connect } from "react-redux"
import { defineMessages, injectIntl } from "react-intl"
import styled from "styled-components"
import Rodal from "../../rodal"

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
`
const Teams = styled.div`
  display: flex;
  flex: 1;
  border: solid 1px;
`
const TeamHeader = styled.header`
  display: flex;
  flex: 0 0 50px;
  align-items: center;
  justify-content: center;
`
const TeamName = styled.div`
  font-size: 35px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const Radiant = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`
const RadiantPlayer = styled.div`
  display: flex;
  align-items: center;
  flex: 0 0 80px;
`
const Avatar = styled.img`
  width: 64px;
  height: 64px;
  padding: 0 10px;
`
const PlayerName = styled.a`
  text-decoration: none;
  color: black;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;

  &:hover {
    color: blue;
  }
`
const messages = defineMessages({
  header: {
    id: "tournament.teams.winner-team.header",
    defaultMessage: "Champions of the week"
  }
})
class WinnerTeam extends Component {
  constructor(props) {
    super(props)
    this.state = { visible: false }
  }

  show(event) {
    event.preventDefault()
    if (!this.state.visible) {
      this.setState({ visible: true })
    }
  }

  hide(event) {
    event.preventDefault()
    if (this.state.visible) {
      this.setState({ visible: false })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.status != nextProps.status) {
      this.setState({ visible: false })
    }
  }

  render() {
    if (!this.props.winnerTeam || !this.props.winnerTeam.name) {
      return null
    }
    let key = 0

    const radiantMapped = []

    this.props.winnerTeam.players.forEach(player => {
      radiantMapped.push(
        <RadiantPlayer key={key++}>
          <Avatar src={player.steamavatar[1]} />
          <PlayerName href={player.profileurl} target="_blank">{player.steamname}</PlayerName>
        </RadiantPlayer>
      )
    })

    return (
      <Wrapper className={this.props.className}>
        <button onClick={this.show.bind(this)}>
          {this.props.intl.formatMessage(messages.header)} 🏆
        </button>
        <Rodal
          visible={this.state.visible}
          onClose={this.hide.bind(this)}
          height={450}
        >
          <Teams>
            <Radiant>
              <TeamHeader>
                <TeamName>{this.props.winnerTeam.name}</TeamName>
              </TeamHeader>
              {radiantMapped}
            </Radiant>
          </Teams>
        </Rodal>
      </Wrapper>
    )
  }
}

function mapStateToProps(state) {
  return {
    status: state.tournament.status,
    winnerTeam: (state.tournament.winner && state.tournament.winner.name && state.tournament.winner) || state.weekWinner
  }
}


export default connect(mapStateToProps)(injectIntl(WinnerTeam))