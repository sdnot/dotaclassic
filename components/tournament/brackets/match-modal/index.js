import { Component } from "react"
import styled from "styled-components"
import Rodal from "../../../rodal"
import Match from "./match"

const Modal = styled(Rodal) `
  display: flex;
  padding: 0;
`

export default class MatchModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isVisible: false
    }
  }

  show = (matchId) => {
    this.setState({ isVisible: true, matchId })
  }

  hide = () => {
    if (this.state.isVisible) {
      this.setState({ isVisible: false })
    }
  }

  render() {
    return (
      <Modal visible={this.state.isVisible} width={500} height={300} onClose={this.hide}>
        <Match tournament={this.props.tournament} matchId={this.state.matchId} />
      </Modal>
    )
  }
}