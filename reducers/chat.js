import update from "immutability-helper"

export default function reducer(state = {
  messages: [],
  users: []
}, action) {
  switch (action.type) {
    case "PUSH_MESSAGES": {
      return { ...state, messages: [...state.messages, ...action.payload.messages] }
    }
    case "UNSHIFT_MESSAGES": {
      return { ...state, messages: [...action.payload.messages, ...state.messages] }
    }
    case "CHAT_USERS": {
      return { ...state, users: action.payload.users }
    }
    case "CHAT_USER_JOINED": {
      return { ...state, users: [...state.users, action.payload.user] }
    }
    case "CHAT_USER_LEFT": {
      let newState = state
      for (let i = 0; i < state.users.length; i++) {
        if (state.users[i]._id == action.payload.userId) {
          newState = update(newState, {
            users: { $splice: [[i, 1]] }
          })
          break
        }
      }
      return newState
    }
  }
  return state
}