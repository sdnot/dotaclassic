import { Component } from "react"
import styled from "styled-components"
import Rodal from "../../../rodal"
import Player from "./player"

const Modal = styled(Rodal)`
  box-sizing: border-box;
  padding: 10px;
`
export default class PlayerModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false
    }
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
      <Modal
        visible={this.state.visible}
        onClose={this.hide}
        height={365}
      >
        <Player player={this.props.player} />
      </Modal>
    )
  }
}