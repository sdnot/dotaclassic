import { Component } from "react"
import Rodal from "../../rodal"
import UserMatch from "./user-match"

export default class MatchModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isVisible: false
    }
  }

  show = () => {
    this.setState({ isVisible: true })
  }

  hide = () => {
    if (this.state.isVisible) {
      this.setState({ isVisible: false })
    }
  }

  render() {
    return (
      <Rodal visible={this.state.isVisible} width={500} height={454} onClose={this.hide}>
        <UserMatch />
      </Rodal>
    )
  }
}