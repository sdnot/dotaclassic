export function update_tournament(data) {
  return function (dispatch, getState) {
    dispatch({
      type: "UPDATE_TOURNAMENT",
      payload: {
        data,
        userAccountId: getState().user.account_id
      }
    })
  }
}

export function signup_player(description, parameters) {
  return function (dispatch, getState) {
    const user = getState().user
    dispatch({
      type: "SIGNUP_PLAYER",
      payload: {
        user: {
          _id: user._id,
          steamname: user.steamname,
          account_id: user.account_id,
          profileurl: user.profileurl,
          steamavatar: user.steamavatar,
          loccountrycode: user.loccountrycode
        },
        description,
        parameters
      }
    })
  }
}

export function leave_player(playerIndex) {
  return function (dispatch, getState) {
    dispatch({
      type: "LEAVE_PLAYER",
      payload: {
        playerIndex,
        userAccountId: getState().user.account_id
      }
    })
  }
}

export function signup_team(name, password) {
  return function (dispatch, getState) {
    const user = getState().user
    dispatch({
      type: "SIGNUP_TEAM",
      payload: {
        name,
        password,
        players: [{
          _id: user._id,
          steamname: user.steamname,
          account_id: user.account_id,
          profileurl: user.profileurl,
          steamavatar: user.steamavatar,
          loccountrycode: user.loccountrycode
        }]
      }
    })
  }
}

export function join_team(teamIndex) {
  return function (dispatch, getState) {
    const user = getState().user
    dispatch({
      type: "JOIN_TEAM",
      payload: {
        teamIndex,
        user: {
          _id: user._id,
          steamname: user.steamname,
          account_id: user.account_id,
          profileurl: user.profileurl,
          steamavatar: user.steamavatar,
          loccountrycode: user.loccountrycode
        }
      }
    })
  }
}

export function leave_team(teamIndex, playerIndex) {
  return function (dispatch) {
    dispatch({
      type: "LEAVE_TEAM",
      payload: {
        teamIndex,
        playerIndex
      }
    })
  }
}

export function kicked() {
  return function (dispatch, getState) {
    const account_id = getState().user.account_id
    dispatch({
      type: "KICKED",
      payload: {
        account_id
      }
    })
  }
}

export function kick_player(teamIndex, playerIndex) {
  return function (dispatch) {
    dispatch({
      type: "KICK_PLAYER",
      payload: {
        teamIndex,
        playerIndex
      }
    })
  }
}

export function check_in() {
  return function (dispatch) {
    dispatch({
      type: "CHECK_IN"
    })
  }
}

export function update_players(players) {
  return function (dispatch, getState) {
    dispatch({
      type: "UPDATE_PLAYERS",
      payload: {
        players,
        userAccountId: getState().user.account_id
      }
    })
  }
}

export function update_teams(teams) {
  return function (dispatch, getState) {
    dispatch({
      type: "UPDATE_TEAMS",
      payload: {
        teams,
        userAccountId: getState().user.account_id
      }
    })
  }
}

export function update_matches(matches) {
  return function (dispatch) {
    dispatch({
      type: "UPDATE_MATCHES",
      payload: {
        matches
      }
    })
  }
}