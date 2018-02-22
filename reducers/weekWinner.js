export default function reducer(state = {
  name: "",
  players: []
}, action) {
  switch (action.type) {
    case "UPDATE_WEEKWINNER": {
      return { ...state, ...action.payload }
    }
  }
  return state
}