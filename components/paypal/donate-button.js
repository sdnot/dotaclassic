import { Component } from "react"
import { injectIntl } from "react-intl"
import styled from "styled-components"

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
`

class DonateButton extends Component {
  render() {
    const locale = this.props.intl.locale == "en" ? "en_US" : "es_ES"
    return (
      <Wrapper>
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
          <input type="hidden" name="cmd" value="_s-xclick" />
          <input type="hidden" name="hosted_button_id" value="NJ3GATXCSGT5A" />
          <input type="image" src={`https://www.paypalobjects.com/${locale}/i/btn/btn_donate_LG.gif`} border="0" name="submit" alt="PayPal - The safer, easier way to pay online!" width="93" height="30" />
          <img alt="" border="0" src={`https://www.paypalobjects.com/${locale}/i/scr/pixel.gif`} width="1" height="1" />
        </form>                     
      </Wrapper> 
    )
  }
}

export default injectIntl(DonateButton)