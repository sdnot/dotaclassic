import { Component } from "react"
import { injectIntl, defineMessages } from "react-intl"
import DragScroll from "../drag-scroll"
import Brackets from "./brackets"
import WindowResizeListener from "../util/window-resize-listener"
import Rodal from "../rodal"
import styled from "styled-components"

const Modal = styled(Rodal) `
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const StyledDragScroll = styled(DragScroll) `
  border: black solid 1px;
  background-color: #719898;
`
const WinnerName = styled.h2`
  flex: 0 1;
  margin: 10px 0;
`
const messages = defineMessages({
  winningTeam: {
    id: "tournament.tournament-modal.winningTeam",
    defaultMessage: "Winning team: {teamName}"
  }
})
class TournamentModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      windowWidth: 0,
      windowHeight: 0
    }
  }
  render() {
    if (!this.props.tournament) {
      return null
    }
    return (
      <div>
        <WindowResizeListener onResize={windowSize => {
          this.setState({ ...windowSize })
        }} />
        <Modal
          visible={this.props.visible}
          onClose={this.props.onClose}
          width={this.state.windowWidth - 100}
          height={this.state.windowHeight - 75}
        >
          <WinnerName>{this.props.intl.formatMessage(messages.winningTeam, { teamName: this.props.tournament.winner.name })}</WinnerName>
          <StyledDragScroll
            width={this.state.windowWidth - 200}
            height={this.state.windowHeight - 150}
          >
            <Brackets tournament={this.props.tournament} />
          </StyledDragScroll>
        </Modal>
      </div>
    )
  }
}

export default injectIntl(TournamentModal)