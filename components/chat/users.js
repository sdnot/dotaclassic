import { Component } from "react"
import { connect } from "react-redux"
import { defineMessages, injectIntl } from "react-intl"
import styled from "styled-components"

const Wrapper = styled.div`
  display: block;
  overflow: hidden;
  flex: 0 0 200px;
  padding: 10px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
`
const UserWrapper = styled.div`
  display: flex;
  padding-bottom: 8px;
`
const UserHeader = styled.div`
  margin-bottom: 5px;
`
const UserAvatar = styled.img`
  flex: 0 0 32px;
  border-radius: 5px;
`
const UserName = styled.div`
  margin: auto 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const messages = defineMessages({
  admins: {
    id: "general.admins",
    defaultMessage: "Admins"
  },
  users: {
    id: "general.users",
    defaultMessage: "Users"
  }
})
class Users extends Component {
  render() {
    let usersMapped = [], adminsMapped = []
    this.props.users.forEach((user, key) => {
      let mappedUser = (
        <UserWrapper key={key}>
          <UserAvatar src={user.steamavatar[0]} />
          <UserName>{user.steamname}</UserName>
        </UserWrapper>
      )
      if (user.admin) {
        adminsMapped.push(mappedUser)
      }
      else {
        usersMapped.push(mappedUser)
      }
    })
    let adminsHeader = adminsMapped.length ? <UserHeader>{this.props.intl.formatMessage(messages.admins)}</UserHeader> : undefined

    return (
      <Wrapper>
        {adminsHeader}
        {adminsMapped}
        <UserHeader>{this.props.intl.formatMessage(messages.users)}</UserHeader>
        {usersMapped}
      </Wrapper>
    )
  }
}

function mapStateToProps(state) {
  return {
    users: state.chat.users
  }
}

export default connect(mapStateToProps)(injectIntl(Users))