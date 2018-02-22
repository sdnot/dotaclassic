import { applyMiddleware, createStore, compose } from "redux"
import * as tournamentActions from "./actions/tournament"

import reducer from "./reducers"

import thunk from "redux-thunk"
const middlewareList = [thunk]

const composeEnhancers =
  typeof window === "object" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      actionCreators: tournamentActions
    }) : compose

if (process.env.NODE_ENV !== "production") {
  const logger = require("redux-logger").createLogger({ collapsed: true })
  middlewareList.push(logger)
}

const middleware = composeEnhancers(
  applyMiddleware(...middlewareList)
)

// If inialState == null then use default reducer values
export const initStore = (initialState, isServer) => {
  if (isServer && typeof window === "undefined") {
    if (initialState)
      return createStore(reducer, initialState, middleware)
    return createStore(reducer, null, middleware)
  } else {
    if (!window.store) {
      if (initialState) {
        window.store = createStore(reducer, initialState, middleware)
      } else {
        window.store = createStore(reducer, null, middleware)
      }
    }
    return window.store
  }
}