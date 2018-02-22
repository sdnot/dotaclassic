import { Component } from "react"
import { connect } from "react-redux"
import { defineMessages, injectIntl } from "react-intl"
import PropTypes from "prop-types"
import styled from "styled-components"
import Head from "next/head"
import Popup from "../components/popup"
import AuthButton from "./user/auth-button"
import LocaleButton from "./user/locale-button"

const Banner = styled.img`
  width: 100%;
  margin-top: 40px;
`
const TopBar = styled.div`
  position: fixed;
  z-index: 1;
  top: 0;
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 40px;
  background-color: #611a07;

  button {
    cursor: pointer;
  }
`
const TopBarLeft = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`
const TopBarRight = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
`
const Content = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  overflow-y: auto;
  margin: 15px 30px 20px 30px;
  padding: 30px;
  background-color: #bd4625;

  button {
    cursor: pointer;
  }
`
const Button = styled.button`
  height: 30px;
  margin: 10px;
  border-radius: 10px;
`
const Profile = styled.div`
  display: flex;
  flex: 0 1 300px;
  align-items: center;
  height: 100%;
  overflow: hidden;
`
const Avatar = styled.img`
  width: 32px;
  height: 32px;
`
const InfoWrapper = styled.div`
  flex: 1 0 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 5px;
  overflow: hidden;
`
const Name = styled.div`
  font-size: 21px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fae6ab;
`
const AuthButtonStyled = styled(AuthButton) `
  height: 30px;
  flex: 0 1 300px;
  border-radius: 10px;
  margin-right: 10px;
`
const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 30px;
  color: #fae6ab;
  background-color: #611a07;
`
const BottomBarSeparator = styled.div`
  width: 10px;
`
const LocaleButtonStyled = styled(LocaleButton) `
  background:none!important;
  color:inherit;
  border:none; 
  padding:0!important;
  font: inherit;
  border-bottom:1px solid #444; 
  cursor: pointer;
`
const ContactEmail = styled.a`
  text-decoration: none;
  border-bottom:1px solid #444; 
  color: inherit;
`
const messages = defineMessages({
  openChat: {
    id: "general.openChat",
    defaultMessage: "Open chat"
  }
})
class Layout extends Component {
  constructor(props) {
    super(props)
    this.state = {
      windowWidth: 0,
      windowHeight: 0
    }
  }

  openChat = () => {
    window.open(
      "/chat",
      "_blank",
      `top=0,left=${(screen.width - 800) / 2},width=800,height=500,scrollbars=no`
    )
  }

  render() {
    let profile
    profile = this.props.user ?
      (
        <Profile>
          <AuthButtonStyled />
          <Avatar src={this.props.user.avatar} />
          <InfoWrapper>
            <Name>{this.props.user.steamname}</Name>
          </InfoWrapper>
        </Profile>
      )
      : <AuthButtonStyled />
    return (
      <div>
        <Head>
          <title>Dota Classic Cup</title>
          <link rel="stylesheet" href="/static/brackets.css" />
          <link rel="stylesheet" href="/static/rodal.css" />
          <link rel="stylesheet" href="/static/popup.css" />
          <link rel="stylesheet" href="/static/flags.css" />
        </Head>
        <Popup closeBtn={false} />
        <TopBar>
          <TopBarLeft>
            <Button onClick={this.openChat}>{this.props.intl.formatMessage(messages.openChat)}</Button>
          </TopBarLeft>
          <TopBarRight>
            {profile}
          </TopBarRight>
        </TopBar>
        <Banner src="static/banner.png" />
        <Content>
          {this.props.children}
        </Content>
        <Footer>
          <LocaleButtonStyled />
          <BottomBarSeparator />
          |
          <BottomBarSeparator />
          <ContactEmail href="mailto:angel.ortega200@gmail.com?Subject=Dota%20Classic%20Cup">angel.ortega200@gmail.com</ContactEmail>
        </Footer>
      </div>
    )
  }
}

Layout.propTypes = {
  children: PropTypes.node,
  loggedin: PropTypes.bool,
  user: PropTypes.shape({
    avatar: PropTypes.string,
    steamname: PropTypes.string
  })
}

function mapStateToProps(state) {
  let user
  if (state.user._id) {
    user = {
      avatar: state.user.steamavatar[1],
      steamname: state.user.steamname,
    }
  }
  return {
    user
  }
}

export default connect(mapStateToProps)(injectIntl(Layout))