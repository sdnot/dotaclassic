import update from "immutability-helper"

update.extend("$auto", (value, object) => {
  return object ?
    update(object, value) :
    update({}, value)
})
update.extend("$autoArray", (value, object) => {
  return object ?
    update(object, value) :
    update([], value)
})

export default function reducer(state = {
  status: "",
  prize: 0,
  teams: [],
  rounds: [],
  casters: [],
  players: [],
  donators: [],
  user: {
    player: null,
    team: null
  }
}, action) {

  switch (action.type) {
    case "UPDATE_TOURNAMENT": {
      const { data, userAccountId } = action.payload
      let newState = state
      if (data.players && userAccountId) {
        for (let i = 0; i < data.players.length; i++) {
          if (data.players[i].user.account_id == userAccountId) {
            newState = update(newState, {
              user: {
                player: {
                  $auto: {
                    description: { $set: data.players[i].description },
                    parameters: { $set: data.players[i].parameters }
                  }
                }
              }
            })
          }
        }
      }
      if (data.teams && userAccountId && !newState.user.player) {
        for (let i = 0; i < data.teams.length; i++) {
          for (let x = 0; x < data.teams[i].players.length; x++) {
            if (data.teams[i].players[x].account_id == userAccountId) {
              newState = update(newState, {
                user: {
                  team: {
                    $auto: {
                      id: { $set: i + 1 },
                      name: { $set: data.teams[i].name },
                      match: { $set: data.teams[i].match || null }
                    }
                  }
                }
              })
              break
            }
          }
        }
      }
      if (data.teamsCheckInInit && state.status == "SIGN_UP") {
        for (let i = 0; i < newState.teams.length; i++) {
          newState = update(newState, {
            teams: {
              [i]: {
                $auto: {
                  checkIn: { $set: false }
                }
              }
            }
          })
        }
      }
      if (data.status == "STARTED" && state.status == "CHECK_IN" && state.user.team && state.teams[state.user.team.id - 1].checkIn == false) {
        newState = update(newState, {
          user: {
            team: { $set: null }
          }
        })
      }
      return { ...newState, ...data }
    }
    case "SIGNUP_PLAYER": {
      return update(state, {
        players: { $push: [action.payload] },
        user: {
          player: {
            $auto: {
              description: { $set: action.payload.description },
              parameters: { $set: action.payload.parameters }
            }
          }
        }
      })
    }
    case "LEAVE_PLAYER": {
      let newState = state
      let playerIndex = -1
      if (action.payload.playerIndex) {
        playerIndex = action.payload.playerIndex
      }
      else {
        for (let i = 0; i < newState.players.length; i++) {
          if (newState.players[i].user.account_id == action.payload.userAccountId) {
            playerIndex = i
            break
          }
        }
      }
      if (playerIndex > -1) {
        newState = update(newState, {
          players: { $splice: [[playerIndex, 1]] },
          user: {
            player: { $set: null }
          }
        })
      }
      return newState
    }
    case "SIGNUP_TEAM": {
      let newState = state
      if (newState.teamsCheckInInit) {
        action.payload.checkIn = false
      }
      if (newState.user.player) {
        for (let i = 0; i < newState.players.length; i++) {
          if (newState.players[i].user._id == action.payload.players[0]._id) {
            newState = update(newState, {
              players: { $splice: [[i, 1]] }
            })
          }
        }
      }
      return update(newState, {
        teams: { $push: [action.payload] },
        user: {
          player: { $set: null },
          team: {
            $auto: {
              id: { $set: newState.teams.length + 1 },
              name: { $set: action.payload.name },
              match: { $set: null }
            }
          }
        }
      })
    }
    case "JOIN_TEAM": {
      let newState = state
      if (newState.user.player) {
        for (let i = 0; i < newState.players.length; i++) {
          if (newState.players[i].user._id == action.payload.user._id) {
            newState = update(newState, {
              players: { $splice: [[i, 1]] }
            })
            break
          }
        }
      }
      return update(newState, {
        teams: {
          [action.payload.teamIndex]: {
            players: { $push: [action.payload.user] }
          }
        },
        user: {
          player: { $set: null },
          team: {
            $auto: {
              id: { $set: action.payload.teamIndex + 1 },
              name: { $set: newState.teams[action.payload.teamIndex].name },
              match: { $set: newState.teams[action.payload.teamIndex].match || null }
            }
          }
        }
      })
    }
    case "LEAVE_TEAM": {
      let newState = update(state, {
        teams: {
          [action.payload.teamIndex]: {
            players: { $splice: [[action.payload.playerIndex, 1]] }
          }
        },
        user: {
          team: { $set: null }
        }
      })
      if (newState.teams[action.payload.teamIndex].checkIn && newState.teams[action.payload.teamIndex].players.length < 5) {
        newState = update(newState, {
          teams: {
            [action.payload.teamIndex]: {
              checkIn: { $set: false }
            }
          }
        })
      }
      return newState
    }
    case "KICKED": {
      if (!state.user.team) return state
      return update(state, {
        user: {
          team: { $set: null }
        }
      })
    }
    case "KICK_PLAYER": {
      let newState = update(state, {
        teams: {
          [action.payload.teamIndex]: {
            players: { $splice: [[action.payload.playerIndex, 1]] }
          }
        }
      })
      if (newState.teams[action.payload.teamIndex].checkIn && newState.teams[action.payload.teamIndex].players.length < 5) {
        newState = update(newState, {
          teams: {
            [action.payload.teamIndex]: {
              checkIn: { $set: false }
            }
          }
        })
      }
      return newState
    }
    case "CHECK_IN": {
      if (!state.user.team) {
        return state
      }
      const teamIndex = state.user.team.id - 1
      return update(state, {
        teams: {
          [teamIndex]: {
            checkIn: { $set: !state.teams[teamIndex].checkIn }
          }
        }
      })
    }
    case "UPDATE_PLAYERS": {
      let newState = state
      for (let i = 0; i < action.payload.players.length; i++) {
        switch (action.payload.players[i].type) {
          case "ADD": {
            let found = false
            for (let x = 0; x < newState.players.length; x++) {
              if (newState.players[x].user.account_id == action.payload.players[i].data.user.account_id) {
                found = true
                break
              }
            }
            if (!found) {
              newState = update(newState, {
                players: { $push: [action.payload.players[i].data] },
              })
            }
            if (action.payload.players[i].data.user.account_id == action.payload.userAccountId) {
              newState = update(newState, {
                user: {
                  player: {
                    $auto: {
                      description: { $set: action.payload.players[i].data.description },
                      parameters: { $set: action.payload.players[i].data.parameters }
                    }
                  }
                }
              })
            }
            break
          }
          case "REMOVE": {
            for (let x = 0; x < newState.players.length; x++) {
              if (newState.players[x].user.account_id == action.payload.players[i].data.account_id) {
                if (newState.players[x].user.account_id == action.payload.userAccountId && newState.user.player) {
                  newState = update(newState, {
                    user: {
                      player: { $set: null }
                    }
                  })
                }
                newState = update(newState, {
                  players: { $splice: [[x, 1]] },
                })
                break
              }
            }
            break
          }
        }
      }
      return newState
    }
    case "UPDATE_TEAMS": {
      let newState = state
      for (let i = 0; i < action.payload.teams.length; i++) {
        let teamIndex = -1
        for (let x = 0; x < newState.teams.length; x++) {
          if (newState.teams[x].name == action.payload.teams[i].data.name) {
            teamIndex = x
            break
          }
        }
        switch (action.payload.teams[i].type) {
          case "ADD_TEAM": {
            if (newState.teamsCheckInInit) {
              action.payload.teams[i].data.checkIn = false
            }
            if (teamIndex > -1) {
              newState = update(newState, {
                teams: { $splice: [[teamIndex, 1]] }
              })
              if (newState.user.team && newState.user.team.id > (teamIndex + 1)) {
                newState = update(newState, {
                  user: {
                    team: {
                      id: { $set: newState.user.team.id - 1 }
                    }
                  }
                })
              }
            }
            newState = update(newState, {
              teams: { $push: [action.payload.teams[i].data] }
            })
            for (let x = 0; x < action.payload.teams[i].data.players.length; x++) {
              if (newState.user.player && action.payload.teams[i].data.players[x].account_id == action.payload.userAccountId) {
                newState = update(newState, {
                  user: {
                    player: { $set: null }
                  }
                })
              }
              for (let k = 0; k < newState.players.length; k++) {
                if (newState.players[k].user.account_id == action.payload.teams[i].data.players[x].account_id) {
                  newState = update(newState, {
                    players: { $splice: [[k, 1]] }
                  })
                }
              }
              if (action.payload.teams[i].data.players[x].account_id == action.payload.userAccountId) {
                newState = update(newState, {
                  user: {
                    team: {
                      $auto: {
                        id: { $set: newState.teams.length },
                        name: { $set: action.payload.teams[i].data.name },
                        match: { $set: action.payload.teams[i].data.match || null }
                      }
                    }
                  }
                })
              }
            }
            break
          }
          case "ADD_PLAYERS": {
            if (teamIndex == -1) continue
            const addedPlayers = []
            for (let x = 0; x < action.payload.teams[i].data.players.length; x++) {
              if (newState.user.player && action.payload.teams[i].data.players[x].account_id == action.payload.userAccountId) {
                newState = update(newState, {
                  user: {
                    player: { $set: null }
                  }
                })
              }
              for (let k = 0; k < newState.players.length; k++) {
                if (newState.players[k].user.account_id == action.payload.teams[i].data.players[x].account_id) {
                  newState = update(newState, {
                    players: { $splice: [[k, 1]] }
                  })
                }
              }
              let found = false
              for (let j = 0; j < newState.teams[teamIndex].players.length; j++) {
                if (action.payload.teams[i].data.players[x].account_id == newState.teams[teamIndex].players[j].account_id) {
                  found = true
                  if (action.payload.teams[i].data.players[x].account_id == action.payload.userAccountId && !newState.user.team) {
                    newState = update(newState, {
                      user: {
                        team: {
                          $auto: {
                            id: { $set: newState.teams.length },
                            name: { $set: action.payload.teams[i].data.name },
                            match: { $set: action.payload.teams[i].data.match || null }
                          }
                        }
                      }
                    })
                  }
                  break
                }
              }
              if (!found) addedPlayers.push(action.payload.teams[i].data.players[x])
            }
            if (addedPlayers.length > 0) {
              newState = update(newState, {
                teams: {
                  [teamIndex]: {
                    players: { $push: addedPlayers }
                  }
                }
              })
              for (let i = 0; i < addedPlayers.length; i++) {
                if (addedPlayers[i].account_id == action.payload.userAccountId) {
                  newState = update(newState, {
                    user: {
                      team: {
                        $auto: {
                          id: { $set: teamIndex + 1 },
                          name: { $set: newState.teams[teamIndex].name },
                          match: { $set: newState.teams[teamIndex].match || null }
                        }
                      }
                    }
                  })
                  break
                }
              }
            }
            break
          }
          case "REMOVE_PLAYERS": {
            if (teamIndex == -1) continue
            const removedPlayers = []
            for (let x = 0; x < action.payload.teams[i].data.players.length; x++) {
              if (action.payload.teams[i].data.players[x] == action.payload.userAccountId && newState.user.team) {
                newState = update(newState, {
                  user: {
                    team: { $set: null }
                  }
                })
              }
              for (let j = newState.teams[teamIndex].players.length - 1; j >= 0; j--) {
                if (action.payload.teams[i].data.players[x] == newState.teams[teamIndex].players[j].account_id) {
                  removedPlayers.push([j, 1])
                }
              }
            }
            if (removedPlayers.length == newState.teams[teamIndex].players.length) {
              newState = update(newState, {
                teams: { $splice: [[teamIndex, 1]] }
              })
              if (newState.user.team && newState.user.team.id > (teamIndex + 1)) {
                newState = update(newState, {
                  user: {
                    team: {
                      id: { $set: newState.user.team.id - 1 }
                    }
                  }
                })
              }
            }
            else if (removedPlayers.length > 0) {
              newState = update(newState, {
                teams: {
                  [teamIndex]: {
                    players: { $splice: removedPlayers }
                  }
                }
              })
              if (newState.teams[teamIndex].checkIn && newState.teams[teamIndex].players.length < 5) {
                newState = update(newState, {
                  teams: {
                    [teamIndex]: {
                      checkIn: { $set: false }
                    }
                  }
                })
              }
            }
            break
          }
          case "CHECK_IN": {
            if (teamIndex == -1) continue
            newState = update(newState, {
              teams: {
                [teamIndex]: {
                  checkIn: { $set: action.payload.teams[i].data.checkIn }
                }
              }
            })
          }
        }
      }
      return newState
    }
    case "UPDATE_MATCHES": {
      let newState = state
      for (let i = 0; i < action.payload.matches.length; i++) {
        const { r, m } = action.payload.matches[i].data.matchId
        if (action.payload.matches[i].type != "MATCH_FINISHED" && action.payload.matches[i].type != "ADD_CASTER") {
          newState = update(newState, {
            rounds: {
              [r - 1]: {
                [m - 1]: {
                  status: { $set: action.payload.matches[i].type },
                  timestamp: { $set: action.payload.matches[i].data.timestamp }
                }
              }
            }
          })
        }
        else if (action.payload.matches[i].type == "MATCH_FINISHED") {
          const nextR = action.payload.matches[i].data.nextMatch.id.r,
            nextM = action.payload.matches[i].data.nextMatch.id.m,
            winnerTeamId = action.payload.matches[i].data.winnerTeamId,
            nextTeam = (action.payload.matches[i].data.nextMatch.p[0] == winnerTeamId) ? "teamTop" : "teamBottom"

          newState = update(newState, {
            rounds: {
              [r - 1]: {
                [m - 1]: {
                  status: { $set: action.payload.matches[i].type },
                  timestamp: { $set: action.payload.matches[i].data.timestamp },
                  winner: { $set: action.payload.matches[i].data.winner }
                }
              },
              [nextR - 1]: {
                [nextM - 1]: {
                  [nextTeam]: {
                    id: { $set: `${winnerTeamId}` },
                    name: { $set: newState.teams[winnerTeamId - 1].name }
                  }
                }
              }
            },
            teams: {
              [winnerTeamId - 1]: {
                match: { $set: action.payload.matches[i].data.nextMatch.id }
              }
            }
          })

          if (newState.user.team && winnerTeamId == newState.user.team.id) {
            newState = update(newState, {
              user: {
                team: {
                  match: { $set: action.payload.matches[i].data.nextMatch.id }
                }
              }
            })
          }
        }
        if (action.payload.matches[i].data.heroes) {
          newState = update(newState, {
            rounds: {
              [r - 1]: {
                [m - 1]: {
                  teamTop: {
                    $auto: {
                      heroes: { $set: action.payload.matches[i].data.heroes.radiant }
                    }
                  },
                  teamBottom: {
                    $auto: {
                      heroes: { $set: action.payload.matches[i].data.heroes.dire }
                    }
                  }
                }
              }
            }
          })
        }
        if (action.payload.matches[i].data.casters) {
          const castersId = []
          for (let x = 0; x < action.payload.matches[i].data.casters.length; x++) {
            let found = false
            castersId.push(action.payload.matches[i].data.casters[x].id)
            for (let j = 0; j < newState.casters.length; j++) {
              if (newState.casters[j].id == action.payload.matches[i].data.casters[x].id) {
                found = true
                break
              }
            }
            if (!found) {
              newState = update(newState, {
                casters: { $push: [action.payload.matches[i].data.casters[x]] },
              })
            }
          }
          newState = update(newState, {
            rounds: {
              [r - 1]: {
                [m - 1]: {
                  casters: { $autoArray: { $push: [...castersId] } }
                }
              }
            }
          })
        }
      }
      return newState
    }
  }

  return state
}