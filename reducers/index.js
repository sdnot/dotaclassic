import { combineReducers } from "redux"
import chat from "./chat"
import tournament from "./tournament"
import user from "./user"
import weekWinner from "./weekWinner"

export default combineReducers({
  chat,
  tournament,
  user,
  weekWinner
})