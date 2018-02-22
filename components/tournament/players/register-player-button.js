import { Component } from "react"
import { connect } from "react-redux"
import { defineMessages, injectIntl } from "react-intl"
import axios from "axios"
import styled from "styled-components"
import Rodal from "../../rodal"
import Popup from "../../popup"
import { signup_player } from "../../../actions/tournament"

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`
const CenteredText = styled.div`
  text-align: center;
  margin: auto;
`
const Textarea = styled.textarea`
  resize: none;
  padding: 10px 13px;
  background-color: #ebebeb;
  font-size: 15px;
  border-radius: 4px;
  border: 0;
  margin-top: 5px;
  width: 300px;
  min-width: 300px;
  height: 83px;
  margin: auto;
  border: solid 1px;
`
const ParametersWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 15px 0;
`
const ParameterName = styled.div`
  text-align: center;
`
const ColContainer = styled.div`
  display: flex;
  flex-direction: column;
`
const RowContainer = styled.div`
  display: flex;
`
const Button = styled.button`
  margin-top: 20px;
  margin: auto;
`
const messages = defineMessages({
  button: {
    id: "tournament.players.register-player-button.button",
    defaultMessage: "Register as player looking for team"
  },
  title: {
    id: "tournament.players.register-player-button.title",
    defaultMessage: "Player registration"
  },
  description: {
    id: "tournament.players.register-player-button.description",
    defaultMessage: "What are you looking for?"
  },
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
  submit: {
    id: "general.submit",
    defaultMessage: "Submit"
  },
  alertDescriptionEmpty: {
    id: "tournament.players.register-player-button.alertDescriptionEmpty",
    defaultMessage: "You must write what you are looking for"
  },
  alertDescriptionLong: {
    id: "tournament.players.register-player-button.alertDescriptionLong",
    defaultMessage: "The textbox must contain less than {length} characters"
  },
  alertPosition: {
    id: "tournament.players.register-player-button.alertPosition",
    defaultMessage: "You must select at least one position/role"
  },
  alertLanguage: {
    id: "tournament.players.register-player-button.alertLanguage",
    defaultMessage: "You must select at least one language"
  }
})
class RegisterPlayerButton extends Component {
  constructor(props) {
    super(props)

    if (typeof window !== "undefined" && window.localStorage.getItem("playerRegistrationStored")) {
      this.playerRegistrationStored = JSON.parse(window.localStorage.getItem("playerRegistrationStored"))
    }

    this.state = {
      visible: false,
      description: "",
      checkboxes: [false, false, false, false, false, false, false, false, false, false, false, false, false, false]
    }
  }

  show = () => {
    if (!this.props.isLoggedIn) {
      return Popup.alertLogin()
    }
    if (!this.state.visible) {
      let newState = { visible: true }
      if (window.localStorage.getItem("playerRegistrationStored")) {
        const playerRegistrationStored = JSON.parse(window.localStorage.getItem("playerRegistrationStored"))
        newState = { ...newState, ...playerRegistrationStored }
      }
      this.setState(newState, () => {
        this.textarea.focus()
      })
    }
  }

  hide = () => {
    if (this.state.visible) {
      this.setState({ visible: false })
      window.localStorage.setItem("playerRegistrationStored", JSON.stringify({ checkboxes: this.state.checkboxes, description: this.state.description }))
    }
  }

  handleDescriptionChange = (event) => {
    this.setState({ description: event.target.value })
  }

  toggleCheck = (index) => {
    const checkboxes = [...this.state.checkboxes]
    checkboxes[index] = !checkboxes[index]
    this.setState({ checkboxes })
  }

  handleSubmit = () => {
    if (this.state.description.length == 0) {
      return Popup.alert(this.props.intl.formatMessage(messages.alertDescriptionEmpty))
    }
    const maxLength = 500
    if (this.state.description.length > maxLength) {
      return Popup.alert(this.props.intl.formatMessage(messages.alertDescriptionLong, { length: maxLength }))
    }
    let flag = false
    for (let i = 0; i < 5; i++) {
      if (this.state.checkboxes[i]) {
        flag = true
        break
      }
    }
    if (!flag) {
      return Popup.alert(this.props.intl.formatMessage(messages.alertPosition))
    }
    flag = false
    for (let i = 12; i < 14; i++) {
      if (this.state.checkboxes[i]) {
        flag = true
        break
      }
    }
    if (!flag) {
      return Popup.alert(this.props.intl.formatMessage(messages.alertLanguage))
    }
    const parameters = this.getCheckboxesValues()
    axios.post("tournament/signup_player", {
      _csrf: this.props.csrfToken,
      description: this.state.description,
      parameters
    })
      .then(() => {
        this.hide()
        this.props.dispatch(signup_player(this.state.description, parameters))
      })
      .catch(err => {
        Popup.error(err.response && err.response.data || err.toString())
        this.hide()
      })
  }

  getCheckboxesValues = () => {
    let values = ""
    this.state.checkboxes.forEach(checkbox => {
      values += checkbox ? "1" : "0"
    })
    return values
  }

  render() {
    return (
      <div>
        <Rodal
          visible={this.state.visible}
          onClose={this.hide}
          title={this.props.intl.formatMessage(messages.title)}
          width={450}
          height={390}
        >
          <Wrapper>
            <CenteredText>{`${this.props.intl.formatMessage(messages.description)} (${this.state.description.length}/500)`}</CenteredText>
            <Textarea
              innerRef={instance => this.textarea = instance}
              value={this.state.description}
              onChange={this.handleDescriptionChange}
            />
            <ParametersWrapper>
              <ColContainer>
                <ParameterName>{this.props.intl.formatMessage(messages.position)}</ParameterName>
                <RowContainer>
                  <input type="checkbox" checked={this.state.checkboxes[0]} onChange={() => this.toggleCheck(0)} /><label>1. Carry</label>
                </RowContainer>
                <RowContainer>
                  <input type="checkbox" checked={this.state.checkboxes[1]} onChange={() => this.toggleCheck(1)} /><label>2. Mid</label>
                </RowContainer>
                <RowContainer>
                  <input type="checkbox" checked={this.state.checkboxes[2]} onChange={() => this.toggleCheck(2)} /><label>3. Offlaner</label>
                </RowContainer>
                <RowContainer>
                  <input type="checkbox" checked={this.state.checkboxes[3]} onChange={() => this.toggleCheck(3)} /><label>4. Farming Support</label>
                </RowContainer>
                <RowContainer>
                  <input type="checkbox" checked={this.state.checkboxes[4]} onChange={() => this.toggleCheck(4)} /><label>5. Support</label>
                </RowContainer>
              </ColContainer>
              <ColContainer>
                <ParameterName>{this.props.intl.formatMessage(messages.playstyle)}</ParameterName>
                <RowContainer>
                  <input type="checkbox" checked={this.state.checkboxes[5]} onChange={() => this.toggleCheck(5)} /><label>Aggressive/Fighter</label>
                </RowContainer>
                <RowContainer>
                  <input type="checkbox" checked={this.state.checkboxes[6]} onChange={() => this.toggleCheck(6)} /><label>Initiator</label>
                </RowContainer>
                <RowContainer>
                  <input type="checkbox" checked={this.state.checkboxes[7]} onChange={() => this.toggleCheck(7)} /><label>Roamer</label>
                </RowContainer>
                <RowContainer>
                  <input type="checkbox" checked={this.state.checkboxes[8]} onChange={() => this.toggleCheck(8)} /><label>Passive/Farmer</label>
                </RowContainer>
                <RowContainer>
                  <input type="checkbox" checked={this.state.checkboxes[9]} onChange={() => this.toggleCheck(9)} /><label>Pusher</label>
                </RowContainer>
                <RowContainer>
                  <input type="checkbox" checked={this.state.checkboxes[10]} onChange={() => this.toggleCheck(10)} /><label>Ganker</label>
                </RowContainer>
                <RowContainer>
                  <input type="checkbox" checked={this.state.checkboxes[11]} onChange={() => this.toggleCheck(11)} /><label>Jungler</label>
                </RowContainer>
              </ColContainer>
              <ColContainer>
                <ParameterName>{this.props.intl.formatMessage(messages.languages)}</ParameterName>
                <RowContainer>
                  <input type="checkbox" checked={this.state.checkboxes[12]} onChange={() => this.toggleCheck(12)} /><label>{this.props.intl.formatMessage(messages.english)}</label>
                </RowContainer>
                <RowContainer>
                  <input type="checkbox" checked={this.state.checkboxes[13]} onChange={() => this.toggleCheck(13)} /><label>{this.props.intl.formatMessage(messages.spanish)}</label>
                </RowContainer>
              </ColContainer>
            </ParametersWrapper>
            <Button onClick={this.handleSubmit}>{this.props.intl.formatMessage(messages.submit)}</Button>
          </Wrapper>
        </Rodal>
        <button className={this.props.className} disabled={this.props.disabled} onClick={this.show}>{this.props.intl.formatMessage(messages.button)}</button>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    csrfToken: state.user.csrfToken,
    isLoggedIn: !!state.user._id
  }
}

export default connect(mapStateToProps)(injectIntl(RegisterPlayerButton))