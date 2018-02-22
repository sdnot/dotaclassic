export function push_messages(messages) {
  return function (dispatch) {
    dispatch({
      type: "PUSH_MESSAGES",
      payload: { messages }
    })
  }
}
export function unshift_messages(messages) {
  return function (dispatch) {
    dispatch({
      type: "UNSHIFT_MESSAGES",
      payload: { messages }
    })
  }
}
export function chat_users(users) {
  return function (dispatch) {
    dispatch({
      type: "CHAT_USERS",
      payload: { users }
    })
  }
}
export function chat_user_joined(user) {
  return function (dispatch) {
    dispatch({
      type: "CHAT_USER_JOINED",
      payload: { user }
    })
  }
}
export function chat_user_left(userId) {
  return function (dispatch) {
    dispatch({
      type: "CHAT_USER_LEFT",
      payload: { userId }
    })
  }
}