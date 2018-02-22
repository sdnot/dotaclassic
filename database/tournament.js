import mongoose from "mongoose"
import autopopulate from "mongoose-autopopulate"
const Schema = mongoose.Schema

// const matchSchema = new Schema({
//   id: {
//     s: Number,
//     r: Number,
//     m: Number
//   },
//   casters: [String],
//   teamTop: {
//     name: String,
//     id: String,
//     heroes: [Number]
//   },
//   teamBot: {
//     name: String,
//     id: String,
//     heroes: [Number]
//   },
//   winner: Number, //0 no winner, 1 teamTop, 2 teamBottom
//   status: String,
//   timestamp: Number
// }, { id: false, _id: false })

// const playerSchema = new Schema({
//   id: String,
//   name: String,
//   account_id: String,
//   profileurl: String,
//   steamavatar: [String],
//   loccountrycode: String,
//   description: String,
//   parameters: String
// }, { id: false, _id: false })

const userRef = {
  type: String,
  ref: "User",
  autopopulate: { select: { __v: 0, admin: 0 } }
}

const playerSchema = new Schema({
  user: userRef,
  description: String,
  parameters: String
}, { id: false, _id: false })

const teamSchema = new Schema({
  name: String,
  players: [userRef],
  password: Boolean,
  checkIn: Boolean,
  match: {
    s: Number,
    r: Number,
    m: Number
  }
}, { id: false, _id: false })

const donatorSchema = new Schema({
  user: userRef,
  donation: Number
})

const tournamentSchema = new Schema({
  status: String,
  timestamp: Number,
  startDate: Date,
  winner: {
    name: String,
    players: [userRef]
  },
  teamsPasswords: [String],
  teamsCheckInInit: Boolean,
  casters: [userRef],
  players: [playerSchema],
  teams: [teamSchema],
  rounds: [Schema.Types.Mixed],
  teamsSignedUp: {
    teams: [teamSchema],
    teamsPasswords: [String]
  },
  prize: Number,
  donators: [donatorSchema]
})
tournamentSchema.plugin(autopopulate)

let Tournament
try {
  Tournament = mongoose.model("Tournament")
} catch (err) {
  Tournament = mongoose.model("Tournament", tournamentSchema)
}

export function latestTournament() {
  return Tournament.findOne().sort({ startDate: -1 })
}

export function getTournamentById(id) {
  return Tournament.findById(id).select({ __v: 0 })
}

export function fetchTeams(tournamentId) {
  return Tournament.findById(tournamentId).select({ teams: 1 })
}

export function getWeekWinner() {
  return new Promise((resolve, reject) => {
    Tournament.findOne().sort({ startDate: -1 }).exists("winner.name").select({ _id: 0, winner: 1 })
      .then(result => {
        if (!result) {
          resolve(null)
        }
        resolve(result.winner)
      })
      .catch(err => {
        reject(err)
      })
  })
}

export function getTournamentByDate(startDateTimestamp) {
  return new Promise((resolve, reject) => {
    Tournament.findOne({ startDate: new Date(startDateTimestamp) })
      .select({
        _id: 0,
        status: 1,
        teamsSignedUp: 1,
        rounds: 1,
        teams: 1,
        casters: 1,
        winner: 1,
        startDate: 1,
        __v: 1
      })
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        reject(err)
      })
  })
}

export function getPreviousTournamentDatesWinners() {
  return new Promise((resolve, reject) => {
    Tournament.find().sort({ startDate: -1 })
      .where("status", "FINISHED")
      .exists("winner.name")
      .select({
        _id: 0,
        startDate: 1,
        winner: 1,
        __v: 1
      })
      .then(result => {
        const datesWinners = result.map(item => {
          return { startDate: Date.parse(item.startDate), winner: item.winner.name, __v: item.__v }
        })
        resolve(datesWinners)
      })
      .catch(err => {
        reject(err)
      })
  })
}

export function createTournament() {
  var startDate = new Date()
  if (startDate.getDay() != 0) {
    startDate.setDate(startDate.getDate() + (-2 - startDate.getDay() + 7) % 7 + 1)
  }
  startDate.setHours(15, 0, 0, 0)

  return Tournament.create({
    status: "SIGN_UP",
    timestamp: Date.now(),
    startDate,
    prize: 0
  })
}