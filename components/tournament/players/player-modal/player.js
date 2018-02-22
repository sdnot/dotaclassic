import { Component } from "react"
import { connect } from "react-redux"
import { defineMessages, injectIntl } from "react-intl"
import styled from "styled-components"

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`
const Header = styled.div`
  display: flex;
  height: 40px;
  justify-content: center;
  align-items: center;
  font-size: 30px;
`
const RowContainer = styled.div`
  display: flex;
  ${props => props.height ? `height: ${props.height};` : ""}
`
const ParametersWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 15px 0;
`
const ParameterName = styled.div`
  text-align: center;
`
const Avatar = styled.img`
  width: 64px;
  height: 64px;
  align-self: center;
`
const Description = styled.div`
  flex: 1;
  overflow: auto;
  word-wrap: break-word;
  white-space: pre-wrap;
  padding: 5px 10px;
`
const ContactInfo = styled.div`
  display: flex;
  justify-content: space-around;
`
const messages = defineMessages({
  position: {
    id: "tournament.players.register-player-button.position",
    defaultMessage: "Position/Role"
  },
  playstyle: {
    id: "tournament.players.register-player-button.playstyle",
    defaultMessage: "Playstyle"
  },
  languages: {
    id: "general.languages",
    defaultMessage: "Languages"
  },
  english: {
    id: "general.english",
    defaultMessage: "English"
  },
  spanish: {
    id: "general.spanish",
    defaultMessage: "Spanish"
  },
  friendId: {
    id: "tournament.players.player-modal.player.friendId",
    defaultMessage: "Friend ID: {account_id}"
  },
  steamProfile: {
    id: "tournament.players.player-modal.player.steamProfile",
    defaultMessage: "Steam profile"
  }
})
class PlayerModal extends Component {
  render() {
    return (
      <Wrapper>
        <Header>
          {this.props.player.steamname}
        </Header>
        <RowContainer height={"80px"}>
          <Avatar src={this.props.player.avatar} />
          <Description>{this.props.player.description}</Description>
        </RowContainer>
        <ParametersWrapper>
          <div>
            <ParameterName>{this.props.intl.formatMessage(messages.position)}</ParameterName>
            <RowContainer>
              <input type="checkbox" readOnly={true} checked={this.props.player.parameters[0]} /><label>1. Carry</label>
            </RowContainer>
            <RowContainer>
              <input type="checkbox" readOnly={true} checked={this.props.player.parameters[1]} /><label>2. Mid</label>
            </RowContainer>
            <RowContainer>
              <input type="checkbox" readOnly={true} checked={this.props.player.parameters[2]} /><label>3. Offlaner</label>
            </RowContainer>
            <RowContainer>
              <input type="checkbox" readOnly={true} checked={this.props.player.parameters[3]} /><label>4. Farming Support</label>
            </RowContainer>
            <RowContainer>
              <input type="checkbox" readOnly={true} checked={this.props.player.parameters[4]} /><label>5. Support</label>
            </RowContainer>
          </div>
          <div>
            <ParameterName>{this.props.intl.formatMessage(messages.playstyle)}</ParameterName>
            <RowContainer>
              <input type="checkbox" readOnly={true} checked={this.props.player.parameters[5]} /><label>Aggressive/Fighter</label>
            </RowContainer>
            <RowContainer>
              <input type="checkbox" readOnly={true} checked={this.props.player.parameters[6]} /><label>Initiator</label>
            </RowContainer>
            <RowContainer>
              <input type="checkbox" readOnly={true} checked={this.props.player.parameters[7]} /><label>Roamer</label>
            </RowContainer>
            <RowContainer>
              <input type="checkbox" readOnly={true} checked={this.props.player.parameters[8]} /><label>Passive/Farmer</label>
            </RowContainer>
            <RowContainer>
              <input type="checkbox" readOnly={true} checked={this.props.player.parameters[9]} /><label>Pusher</label>
            </RowContainer>
            <RowContainer>
              <input type="checkbox" readOnly={true} checked={this.props.player.parameters[10]} /><label>Ganker</label>
            </RowContainer>
            <RowContainer>
              <input type="checkbox" readOnly={true} checked={this.props.player.parameters[11]} /><label>Jungler</label>
            </RowContainer>
          </div>
          <div>
            <ParameterName>{this.props.intl.formatMessage(messages.languages)}</ParameterName>
            <RowContainer>
              <input type="checkbox" readOnly={true} checked={this.props.player.parameters[12]} /><label>English</label>
            </RowContainer>
            <RowContainer>
              <input type="checkbox" readOnly={true} checked={this.props.player.parameters[13]} /><label>Spanish</label>
            </RowContainer>
          </div>
        </ParametersWrapper>
        <ContactInfo>
          <div>{this.props.intl.formatMessage(messages.friendId, { account_id: this.props.player.account_id })}</div>
          <div><a href={this.props.player.profileurl} target="_blank">{this.props.intl.formatMessage(messages.steamProfile)}</a></div>
        </ContactInfo>
      </Wrapper>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const player = ownProps.player ?
    {
      avatar: ownProps.player.user.steamavatar[1],
      loccountrycode: ownProps.player.user.loccountrycode,
      profileurl: ownProps.player.user.profileurl,
      steamname: ownProps.player.user.steamname,
      account_id: ownProps.player.user.account_id,
      description: ownProps.player.description,
      parameters: ownProps.player.parameters.split("").map(item => item == "0" ? false : true)
    }
    : {
      avatar: state.user.steamavatar[1],
      loccountrycode: state.user.loccountrycode,
      profileurl: state.user.profileurl,
      steamname: state.user.steamname,
      account_id: state.user.account_id,
      description: state.tournament.user.player.description,
      parameters: state.tournament.user.player.parameters.split("").map(item => item == "0" ? false : true)
    }
  return {
    csrfToken: state.user.csrfToken,
    player
  }
}

export default connect(mapStateToProps)(injectIntl(PlayerModal))