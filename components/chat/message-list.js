import { Component } from "react"
import { connect } from "react-redux"
import { FormattedMessage, FormattedRelative, FormattedTime } from "react-intl"
import styled from "styled-components"

const RowContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`
const ColContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`
const Wrapper = styled.div`
  flex: 1;
  color: black;
  overflow-y: auto;
`
const Message = styled.div`
  display: flex;
  padding: 5px;
  border-top: 1px solid #bd4625;
`
const MessageAvatar = styled.img`
  flex: 0 0 42px;
  height: 42px;
  border-radius: 5px;
  margin-right: 10px;
`
const MessageName = styled.div`
  font-size: 1.2em;
  margin-right: 10px;
`
const DateWrapper = styled.div`
  font-size: .8em;
`
const MessageText = styled.div`
  margin-bottom: 2px;
  word-wrap: break-word;
  word-break: break-word;
`
function mapMessage(messageMapped, key) {
  return (
    <Message key={key++}>
      <MessageAvatar src={messageMapped.user.steamavatar[0]} />
      <ColContainer>
        <RowContainer>
          <MessageName>{messageMapped.user.steamname}</MessageName>
          <DateWrapper>
            <FormattedRelative value={messageMapped.createdAt} units={"day"} updateInterval={0} />
            {" "}
            <FormattedMessage id={"chat.atHour"} defaultMessage={"at"} />
            {" "}
            <FormattedTime value={messageMapped.createdAt} />
          </DateWrapper>
        </RowContainer>
        {messageMapped.text}
      </ColContainer>
    </Message>
  )
}

class MessageList extends Component {

  constructor(props) {
    super(props)
    this.state = {
      fetchingMessages: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.fetchingMessages == true && this.props.messages.length < nextProps.messages.length) {
      this.setState({ fetchingMessages: false })
    }
  }

  componentWillUpdate(nextProps) {
    this.historyChanged = !!this.props.messages[0] && this.props.messages[0]._id != nextProps.messages[0]._id
    const scrollHeight = this.messageList.scrollHeight
    const height = this.messageList.clientHeight
    const maxScrollTop = scrollHeight - height
    if (this.messageList.scrollTop == maxScrollTop) {
      this.autoScrollBottom = !this.props.messages[0] || (this.props.messages[0]._id == nextProps.messages[0]._id)
    }
    else {
      this.autoScrollBottom = false
    }
    if (!this.autoScrollBottom && this.historyChanged) {
      this.oldMessagesNodesLength = this.messageNodes.length
    }
  }

  componentDidUpdate() {
    if (this.autoScrollBottom) {
      this.scrollToBottom()
    }
    else if (this.historyChanged && this.oldMessagesNodesLength) {
      const topMessage = this.messageNodes[this.messageNodes.length - this.oldMessagesNodesLength]
      topMessage.scrollIntoView()
    }
  }

  handleScroll = () => {
    if (!this.state.fetchingMessages && this.messageList.scrollTop == 0 && this.props.messages[0]) {
      this.setState({ fetchingMessages: true }, () => {
        this.props.fetchMessages(this.props.messages[0]._id)
      })
    }
  }

  scrollToBottom = () => {
    const scrollHeight = this.messageList.scrollHeight
    const height = this.messageList.clientHeight
    const maxScrollTop = scrollHeight - height
    this.messageList.scrollTop = maxScrollTop
  }

  render() {
    this.messageNodes = []
    const mappedMessages = []
    let messageMapped, textKey = 0, key = 0
    if (this.props.messages.length > 0) {
      this.props.messages.forEach(message => {
        if (!messageMapped) {
          messageMapped = { ...message, text: [] }
          messageMapped.createdAt = new Date(messageMapped.createdAt).getTime()
          messageMapped.text.push(
            <MessageText key={textKey++} innerRef={node => { if (node) this.messageNodes.push(node) }}>
              {message.text}
            </MessageText>
          )
        }
        else if (messageMapped.user._id == message.user._id && (new Date(message.createdAt).getTime() - messageMapped.createdAt) < 60000) {
          messageMapped.text.push(
            <MessageText key={textKey++} innerRef={node => { if (node) this.messageNodes.push(node) }}>
              {message.text}
            </MessageText>
          )
        }
        else {
          mappedMessages.push(mapMessage(messageMapped, key++))
          textKey = 0
          messageMapped = { ...message, text: [] }
          messageMapped.createdAt = new Date(messageMapped.createdAt).getTime()
          messageMapped.text.push(
            <MessageText key={textKey++} innerRef={node => { if (node) this.messageNodes.push(node) }}>
              {message.text}
            </MessageText>
          )
        }
      })
      mappedMessages.push(mapMessage(messageMapped, key++))
    }

    return (
      <Wrapper innerRef={instance => this.messageList = instance} onScroll={this.handleScroll}>
        {mappedMessages}
      </Wrapper>
    )
  }
}

function mapStateToProps(state) {
  return {
    messages: state.chat.messages
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(MessageList)