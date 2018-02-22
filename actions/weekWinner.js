export function update_weekWinner(data) {
  return function (dispatch) {
    dispatch({
      type: "UPDATE_WEEKWINNER",
      payload: data
    })
  }
}