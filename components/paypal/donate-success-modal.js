import { Component } from "react"
import { defineMessages, injectIntl } from "react-intl"
import styled from "styled-components"
import Rodal from "../rodal"

const RodalStyled = styled(Rodal) `
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding: 10px;
  box-sizing: border-box;
`
const BigText = styled.div`
  font-size: 2em;
`

const messages = defineMessages({
  donateSuccess1: {
    id: "donate.success-1",
    defaultMessage: "Thanks for the donation!. This week's prize pool will increase by ${donationAmount}"
  },
  donateSuccess2: {
    id: "donate.success-2",
    defaultMessage: "A receipt of your donation will be emailed to you. The prize pool will be updated once it gets verified"
  }
})
class DonateSuccessModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      donationAmount: "0",
      visible: false
    }
  }

  show = (donationAmount) => {
    if (!this.state.visible) {
      this.setState({ donationAmount, visible: true })
    }
  }

  hide = () => {
    if (this.state.visible) {
      this.setState({ visible: false })
    }
  }

  render() {
    return (
      <RodalStyled
        visible={this.state.visible}
        closeMaskOnClick={false}
        overflow={"auto"}
        onClose={this.hide}
      >
        <BigText>{this.props.intl.formatMessage(messages.donateSuccess1, { donationAmount: this.state.donationAmount })}</BigText>
        <div>{this.props.intl.formatMessage(messages.donateSuccess2)}</div>
        <button onClick={this.hide}>{this.props.intl.formatMessage({ id: "general.accept", defaultMessage: "Accept" })}</button>
      </RodalStyled>
    )
  }
}

export default injectIntl(DonateSuccessModal, { withRef: true })