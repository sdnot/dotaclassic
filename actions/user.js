export function update_user(data) {
  return function (dispatch) {
    dispatch({
      type: "UPDATE_USER",
      payload: data
    })
  }
}