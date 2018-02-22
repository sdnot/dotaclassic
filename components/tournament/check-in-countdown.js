import { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import CountdownClock from "../countdown-clock"

const Wrapper = styled.div`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`
class CheckInCountdown extends Component {
  render() {
    return (
      <Wrapper className={this.props.className} size={this.props.size}>
        <CountdownClock size={this.props.size} maxSeconds={900} seconds={900 - ((window.serverTimestamp - this.props.timestamp) / 1000)} />
      </Wrapper>
    )
  }
}

CheckInCountdown.defaultProps = {
  size: 120
}

function mapStateToProps(state) {
  return {
    timestamp: state.tournament.timestamp
  }
}

export default connect(mapStateToProps)(CheckInCountdown)