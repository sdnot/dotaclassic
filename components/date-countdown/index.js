import { Component } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"
import { FormattedMessage } from "react-intl"

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
`
const ColContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`
class Countdown extends Component {

  constructor(props) {
    super(props)
    this.date = new Date(this.props.date).getTime()
    this.state = { secondsLeft: this.date - window.serverTimestamp }
  }

  componentDidMount() {
    this.tick()
    this.interval = setInterval(this.tick, 1000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  tick = () => {
    this.setState({ secondsLeft: this.date - window.serverTimestamp }, () => {
      if (this.state.secondsLeft <= 0) {
        clearInterval(this.interval)
      }
    })
  }

  render() {
    const second = 1000
    const minute = 60000
    const hour = 3600000
    const day = 86400000

    const secondsLeft = this.state.secondsLeft >= 0 ? this.state.secondsLeft : 0
    let days = Math.floor(secondsLeft / day)
    let hours = Math.floor((secondsLeft % day) / hour)
    let minutes = Math.floor((secondsLeft % hour) / minute)
    let seconds = Math.floor((secondsLeft % minute) / second)

    days = days < 10 ? `0${days}` : `${days}`
    hours = hours < 10 ? `0${hours}` : `${hours}`
    minutes = minutes < 10 ? `0${minutes}` : `${minutes}`
    seconds = seconds < 10 ? `0${seconds}` : `${seconds}`

    return (
      <Wrapper className={this.props.className}>
        <ColContainer>
          <span>{days}</span>
          <FormattedMessage id="date-countdown.days" defaultMessage="Days" />
        </ColContainer>
        <ColContainer>
          <span>{hours}</span>
          <FormattedMessage id="date-countdown.hours" defaultMessage="Hours" />
        </ColContainer>
        <ColContainer>
          <span>{minutes}</span>
          <FormattedMessage id="date-countdown.minutes" defaultMessage="Minutes" />
        </ColContainer>
        <ColContainer>
          <span>{seconds}</span>
          <FormattedMessage id="date-countdown.seconds" defaultMessage="Seconds" />
        </ColContainer>
      </Wrapper>
    )
  }
}

Countdown.propTypes = {
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
}

export default Countdown