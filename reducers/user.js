export default function reducer(state = {
  _id: null, // user unique steamid
  account_id: null,
  steamname: null, // user steam name
  steamavatar: null, // array of user steam avatar
  profileurl: null, // link to user's steam profile
  email: null, // user unique email
  username: null, //user unique username
  csrfToken: null
}, action) {
  switch (action.type) {
    case "UPDATE_USER": {
      return { ...state, ...action.payload }
    }
  }
  return state
}