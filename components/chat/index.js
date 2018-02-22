import { Component } from "react"
import { connect } from "react-redux"
import { FormattedRelative, FormattedMessage } from "react-intl"
import styled from "styled-components"
import io from "socket.io-client"
import { push_messages, unshift_messages, chat_users, chat_user_joined, chat_user_left } from "../../actions/chat"
import { defineMessages, injectIntl } from "react-intl"
import Popup from "../popup"
import MessageList from "./message-list"
import Users from "./users"

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background-color: #947a2d;
`
const ColContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`
const Messages = styled(ColContainer) `
  flex: 1;
`
const MessageForm = styled.form`
  flex: 0 0 50px;
  display: flex;
  max-height: 150px;
  justify-content: center;
  border-top: 1px solid #bd4625;

  input {
    flex: 1;
    margin: 10px;
    padding: 10px;
    border-radius: 5px;
    background-color: white;
  }
`
const messages = defineMessages({
  alertMessageSpam: {
    id: "chat.alertMessageSpam",
    defaultMessage: "You are sending messages too fast"
  },
  alertMessageLong: {
    id: "chat.alertMessageLong",
    defaultMessage: "The message must not exceed {length} characters"
  },
  spamKickMessage: {
    id: "chat.spamKickMessage",
    defaultMessage: "You have been kicked from the chat for spamming"
  },
  spamBanMessage: {
    id: "chat.spamBanMessage",
    defaultMessage: "You have been temporary banned for spamming, ban will be lifted once the ban time is over"
  },
  spamDetection: {
    id: "general.spamDetection",
    defaultMessage: "Spam Detection"
  }
})
class Chat extends Component {

  constructor(props) {
    super(props)
    this.antiSpamInterval = null
    this.antiSpamCounter = 0
    this.state = {
      formText: ""
    }
  }

  componentDidMount() {
    this.socket = io.connect("/chat")

    this.socket.on("messagesFetched", messages => {
      this.props.dispatch(unshift_messages(messages.reverse()))
    })

    this.socket.on("message", message => {
      this.props.dispatch(push_messages([message]))
    })

    this.socket.on("users", users => {
      this.props.dispatch(chat_users(users))
    })

    this.socket.on("userJoined", user => {
      this.props.dispatch(chat_user_joined(user))
    })

    this.socket.on("userLeft", userId => {
      this.props.dispatch(chat_user_left(userId))
    })
    this.socket.on("spamKick", () => {
      Popup.error(this.props.intl.formatMessage(messages.spamKickMessage), this.props.intl.formatMessage(messages.spamDetection))
    })
    this.socket.on("spamBan", bannedUntil => {
      Popup.error(
        <div>
          <FormattedMessage id={"chat.spamBanMessage"} defaultMessage={"You have been temporary banned for spamming, ban will be lifted once the ban time is over"} />
          {" "}(<FormattedRelative value={new Date().getTime() + (bannedUntil * 1000)} units={"minute"} updateInterval={60} />)
        </div>,
        this.props.intl.formatMessage(messages.spamDetection))
    })
  }

  componentWillUnmount() {
    this.socket.disconnect()
  }

  fetchMessages = (lastMessageId) => {
    if (lastMessageId) {
      this.socket.emit("fetchMessages", lastMessageId)
    }
  }

  sendMessage = (event) => {
    event.preventDefault()
    if (!this.props.isLoggedIn) {
      Popup.alertLogin()
      return
    }
    if (this.antiSpamCounter > 6) {
      this.messageInput.blur()
      Popup.alert(this.props.intl.formatMessage(messages.alertMessageSpam))
      return
    }
    const maxLength = 600
    if (this.state.formText.length > maxLength) {
      Popup.alert(this.props.intl.formatMessage(messages.alertMessageLong, { length: maxLength }))
      return
    }
    const message = this.state.formText.trim()
    this.setState({ formText: "" })
    if (message) {
      this.antiSpamCounter += 1
      this.socket.emit("message", message)
      if (!this.antiSpamInterval) {
        this.antiSpamInterval = setInterval(() => this.antiSpamCountdown(), 5000)
      }
    }
  }

  antiSpamCountdown() {
    this.antiSpamCounter -= 1
    if (this.antiSpamCounter == 0) {
      clearInterval(this.antiSpamInterval)
      this.antiSpamInterval = null
    }
  }

  handleFormTextChange = (event) => {
    this.setState({ formText: event.target.value })
  }

  render() {
    return (
      <Wrapper className={this.props.className}>
        <Messages>
          <MessageList fetchMessages={this.fetchMessages} />
          <MessageForm onSubmit={this.sendMessage}>
            <input ref={instance => this.messageInput = instance} onChange={this.handleFormTextChange} value={this.state.formText} />
          </MessageForm>
        </Messages>
        <Users />
      </Wrapper>
    )
  }
}

function mapStateToProps(state) {
  return {
    isLoggedIn: !!state.user._id
  }
}
export default connect(mapStateToProps)(injectIntl(Chat))