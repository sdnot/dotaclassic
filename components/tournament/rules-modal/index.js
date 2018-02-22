import { Component } from "react"
import { defineMessages, injectIntl } from "react-intl"
import Rodal from "../../rodal"
import Rules from "./rules"

const messages = defineMessages({
  title: {
    id: "tournament.rules-modal.title",
    defaultMessage: "Tournament rules"
  }
})
class RulesModal extends Component {
  constructor(props) {
    super(props)
    this.state = { visible: false }
  }

  show = () => {
    if (!this.state.visible) {
      this.setState({ visible: true })
    }
  }

  hide = () => {
    if (this.state.visible) {
      this.setState({ visible: false })
    }
  }

  render() {
    return (
      <Rodal
        width={this.props.width}
        height={this.props.height}
        visible={this.state.visible}
        title={this.props.intl.formatMessage(messages.title)}
        overflow={"auto"}
        onClose={this.hide}
      >
        <Rules />
      </Rodal>
    )
  }
}

export default injectIntl(RulesModal, { withRef: true })