/*eslint no-console: "off"*/
import acceptLanguage from "accept-language"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import express from "express"
import compression from "compression"
import next from "next"
import { authRouterInit } from "./routes/auth"
import ioClient from "socket.io-client"
import antiSpam from "./socket-anti-spam"
import initDatabase from "./database"
import { User } from "./database/user"
import Chat from "./database/chat"
import {
  // eslint-disable-next-line no-unused-vars
  createTournament,
  latestTournament,
  getWeekWinner,
  getPreviousTournamentDatesWinners,
  getTournamentByDate,
  getTournamentById
} from "./database/tournament"

const { readFileSync } = require("fs")
const port = process.env.PORT || 5000
let address, db_address, dev = false, morgan, tournyManagerAddress, tournySocket

const SOCKET_MESSAGE_DELAY = 5000
const DATABASE_SAVE_DELAY = 5000

if (process.env.NODE_ENV === "production") {
  address = "http://www.dotaclassic.com"
  db_address = "mongodb://heroku:58565254Heroku@ds151078.mlab.com:51078/web-liga"
  tournyManagerAddress = "http://ec2-52-14-111-75.us-east-2.compute.amazonaws.com:8080"
} else {
  //address = 'http://190.142.22.42:' + port
  address = `http://localhost:${port}`
  db_address = "mongodb://localhost:27017/web-liga"
  dev = true
  morgan = require("morgan")
  tournyManagerAddress = "http://localhost:6000"
}

const db = initDatabase(db_address)
const session = db.session({
  secret: "58565254sdnot",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 2592000000 },
  store: new db.MongoStore({ mongooseConnection: db.mongoose.connection })
})

//Next application
const app = next({ dev })
//Next routes handler
const handle = app.getRequestHandler()

acceptLanguage.languages(["en", "es"])

// We need to expose React Intl's locale data on the request for the user's
// locale. This function will also cache the scripts by lang in memory.
const localeDataCache = new Map()
const getLocaleDataScript = (locale) => {
  const lang = locale.split("-")[0]
  if (!localeDataCache.has(lang)) {
    const localeDataFile = require.resolve(`react-intl/locale-data/${lang}`)
    const localeDataScript = readFileSync(localeDataFile, "utf8")
    localeDataCache.set(lang, localeDataScript)
  }
  return localeDataCache.get(lang)
}

// We need to load and expose the translations on the request for the user's
// locale. These will only be used in production, in dev the `defaultMessage` in
// each message description in the source code will be used.
const getMessages = (locale) => {
  return require(`./lang/${locale}.json`)
}

let tournament
// eslint-disable-next-line no-unused-vars
let startTournamentTimeout
let signUpDate
let weekWinner

/*createTournament()
  .then(result => {
    tournament = result
    tournament.populated("teams.players", [], { model: User })
    tournament.populated("teamsSignedUp.players", [], { model: User })
    tournament.populated("casters", [], { model: User })
    tournament.populated("players.user", [], { model: User })
    tournament.populated("winner.players", [], { model: User })
    for (let i = 0; i < 3; i++) {
      const team = {
        name: `${i}`,
        password: true,
        players: []
      }
      for (let x = 0; x < 5; x++) {
        const index = x + (i * 5)
        team.players.push({
          account_id: `${index}`,
          _id: `${index}`,
          steamname: `${index}`,
          profileurl: `${index}`,
          steamavatar: [`https://unsplash.it/32/32?random&time=${index}`],
          loccountrycode: "US"
        })
      }
      tournament.teams.push(team)
      tournament.teamsPasswords.push(`000${team.name}`)
    }

    const team = {
      name: "499",
      password: true,
      players: []
    }
    for (let x = 0; x < 4; x++) {
      team.players.push({
        account_id: `${x + 500}`,
        _id: `${x + 500}`,
        steamname: `${x + 500}`,
        profileurl: `${x + 500}`,
        steamavatar: [`https://unsplash.it/32/32?random&time=${x + 500}`],
        loccountrycode: "US"
      })
    }
    tournament.teams.push(team)
    tournament.teamsPasswords.push("plataNo")
    return tournament.save()
  })
  .then(() => {
    return getWeekWinner()
  })
  .then(result => {
    weekWinner = result
    return app.prepare()
  })*/

Promise.all([
  latestTournament(),
  getWeekWinner()
])
  .then(results => {
    tournament = results[0]
    weekWinner = results[1]
    return app.prepare()
  })
  .then(() => {
    //express server
    const server = express()
    server.use(compression())

    const authRouter = authRouterInit(address, session)

    server.get("/_*", (req, res) => {
      return handle(req, res)
    })

    server.get("/favicon.ico", (req, res) => {
      return handle(req, res)
    })

    server.get("/sitemap.xml", (req, res) => {
      const options = {
        root: `${__dirname}/static/`,
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        }
      }
      res.status(200).sendFile("sitemap.xml", options)
    })

    if (dev) {
      server.use(morgan("dev"))
    }

    server.use(bodyParser.json())
    server.use(bodyParser.urlencoded({ extended: false }))
    server.use(cookieParser("58565254sdnot"))

    server.get("/static/*", (req, res) => {
      return handle(req, res)
    })

    server.use("/", authRouter)

    const usersReinvite = []
    const usersBotPlayerJoinTeam = []

    server.post("/tournament/signup_player", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (tournament.status != "SIGN_UP" && tournament.status != "CHECK_IN") {
        return res.status(403).send("Las inscripciones han finalizado")
      }
      for (let i = 0; i < tournament.players.length; i++) {
        if (tournament.players[i].user.account_id == req.user.account_id) {
          return res.status(403).send("Ya estas registrado")
        }
      }
      for (let i = 0; i < tournament.teams.length; i++) {
        for (let x = 0; x < tournament.teams[i].players.length; x++) {
          if (tournament.teams[i].players[x].account_id == req.user.account_id) {
            return res.status(403).send("Ya eres parte de un equipo")
          }
        }
      }
      const player = {
        user: {
          _id: req.user._id,
          steamname: req.user.steamname,
          account_id: req.user.account_id,
          profileurl: req.user.profileurl,
          steamavatar: req.user.steamavatar,
          loccountrycode: req.user.loccountrycode
        },
        description: req.body.description,
        parameters: req.body.parameters
      }
      tournament.players.push(player)
      saveTournamentDB()
      emitPlayer("ADD", player)
      return res.sendStatus(200)
    })

    server.post("/tournament/leave_player", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (tournament.status != "SIGN_UP" && tournament.status != "CHECK_IN") {
        return res.status(403).send("Las inscripciones han finalizado")
      }
      let playerIndex = -1
      for (let i = 0; i < tournament.players.length; i++) {
        if (tournament.players[i].user.account_id == req.user.account_id) {
          playerIndex = i
          break
        }
      }
      if (playerIndex == -1) {
        return res.status(403).send("Jugador no encontrado")
      }
      tournament.players.splice(playerIndex, 1)
      saveTournamentDB()
      emitPlayer("REMOVE", { account_id: req.user.account_id })
      return res.sendStatus(200)
    })

    server.post("/tournament/signup_team", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (tournament.status != "SIGN_UP" && tournament.status != "CHECK_IN") {
        return res.status(403).send("Las inscripciones han finalizado")
      }
      for (let i = 0; i < tournament.teams.length; i++) {
        if (tournament.teams[i].name.toUpperCase() == req.body.name.toUpperCase()) {
          return res.status(200).send("Name taken")
        }
        for (let x = 0; x < tournament.teams[i].players.length; x++) {
          if (tournament.teams[i].players[x].account_id == req.user.account_id) {
            return res.status(403).send("Ya eres parte de un equipo")
          }
        }
      }
      for (let i = 0; i < tournament.players.length; i++) {
        if (tournament.players[i].user.account_id == req.user.account_id) {
          tournament.players.splice(i, 1)
          break
        }
      }
      const team = {
        name: req.body.name,
        players: [{
          _id: req.user._id,
          steamname: req.user.steamname,
          account_id: req.user.account_id,
          profileurl: req.user.profileurl,
          steamavatar: req.user.steamavatar,
          loccountrycode: req.user.loccountrycode
        }],
        password: !!req.body.password
      }
      if (tournament.teamsCheckInInit) team.checkIn = false
      tournament.teams.push(team)
      tournament.teamsPasswords.push(req.body.password || null)
      saveTournamentDB()
      emitTeam("ADD_TEAM", team)
      return res.sendStatus(200)
    })

    server.post("/tournament/join_team", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (tournament.status != "SIGN_UP" && tournament.status != "CHECK_IN") {
        return res.status(403).send("Las inscripciones han finalizado")
      }
      let teamIndex = -1
      for (let i = 0; i < tournament.teams.length; i++) {
        for (let x = 0; x < tournament.teams[i].players.length; x++) {
          if (tournament.teams[i].players[x].account_id == req.user.account_id) {
            return res.status(403).send("Ya eres parte de un equipo")
          }
        }
        if (tournament.teams[i].name == req.body.teamName) {
          teamIndex = i
        }
      }
      if (teamIndex == -1) {
        return res.status(403).send("Equipo no encontrado")
      }
      if (tournament.teams[teamIndex].players.length >= 5) {
        return res.status(403).send("Equipo completo")
      }
      if (tournament.teams[teamIndex].password && tournament.teamsPasswords[teamIndex].toUpperCase() != req.body.password.toUpperCase()) {
        return res.send("password")
      }
      for (let i = 0; i < tournament.players.length; i++) {
        if (tournament.players[i].user.account_id == req.user.account_id) {
          tournament.players.splice(i, 1)
          break
        }
      }
      const player = {
        _id: req.user._id,
        steamname: req.user.steamname,
        account_id: req.user.account_id,
        profileurl: req.user.profileurl,
        steamavatar: req.user.steamavatar,
        loccountrycode: req.user.loccountrycode
      }
      tournament.teams[teamIndex].players.push(player)
      saveTournamentDB()
      emitTeam("ADD_PLAYERS", { name: req.body.teamName, players: [player] })
      return res.sendStatus(200)
    })

    server.post("/tournament/leave_team", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (tournament.status != "SIGN_UP" && tournament.status != "CHECK_IN") {
        return res.status(403).send("Las inscripciones han finalizado")
      }
      let teamIndex = -1, playerIndex = -1
      for (let i = 0; i < tournament.teams.length; i++) {
        if (tournament.teams[i].name == req.body.teamName) {
          teamIndex = i
          for (let x = 0; x < tournament.teams[i].players.length; x++) {
            if (tournament.teams[i].players[x].account_id == req.user.account_id) {
              playerIndex = x
              break
            }
          }
          break
        }
      }
      if (teamIndex == -1) {
        return res.status(403).send("Equipo no encontrado")
      }
      if (playerIndex == -1) {
        return res.status(403).send("Jugador no encontrado")
      }
      if (tournament.teams[teamIndex].players.length == 1) {
        tournament.teams.splice(teamIndex, 1)
        tournament.teamsPasswords.splice(teamIndex, 1)
      }
      else {
        tournament.teams[teamIndex].players.splice(playerIndex, 1)
        if (tournament.teams[teamIndex].checkIn && tournament.teams[teamIndex].players.length < 5) {
          tournament.teams[teamIndex].checkIn = false
        }
      }
      saveTournamentDB()
      emitTeam("REMOVE_PLAYERS", {
        name: req.body.teamName,
        players: [req.user.account_id]
      })
      return res.sendStatus(200)
    })

    server.post("/tournament/kick_player", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (tournament.status != "SIGN_UP" && tournament.status != "CHECK_IN") {
        return res.status(403).send("Las inscripciones han finalizado")
      }
      let teamIndex = -1, playerIndex = -1
      for (let i = 0; i < tournament.teams.length; i++) {
        if (tournament.teams[i].name == req.body.teamName) {
          teamIndex = i
          for (let x = 0; x < tournament.teams[i].players.length; x++) {
            if (tournament.teams[i].players[x].account_id == req.body.playerAccountId) {
              playerIndex = x
              break
            }
          }
          break
        }
      }
      if (teamIndex == -1) {
        return res.status(403).send("Equipo no encontrado")
      }
      if (tournament.teams[teamIndex].players[0].account_id == req.user.account_id) {
        if (playerIndex == -1) {
          return res.sendStatus(200)
        }
        const account_id = tournament.teams[teamIndex].players[playerIndex].account_id
        tournament.teams[teamIndex].players.splice(playerIndex, 1)
        if (tournament.teams[teamIndex].checkIn && tournament.teams[teamIndex].players.length < 5) {
          tournament.teams[teamIndex].checkIn = false
        }
        saveTournamentDB()
        emitTeam("REMOVE_PLAYERS", { name: req.body.teamName, players: [req.body.playerAccountId] })
        setTimeout(() => {
          tournamentIo.in(account_id).emit("kicked")
        }, SOCKET_MESSAGE_DELAY)
        return res.sendStatus(200)
      } else {
        return res.status(403).send("No eres el capitán de este equipo")
      }
    })

    server.post("/tournament/team_checkin", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (tournament.status != "CHECK_IN") {
        return res.status(403).send("El torneo no esta en fase de check-in")
      }
      let teamIndex = -1
      for (let i = 0; i < tournament.teams.length; i++) {
        if (tournament.teams[i].name == req.body.teamName) {
          if (tournament.teams[i].players.length < 5) {
            return res.status(403).send("El equipo requiere de un minimo de 5 jugadores para poder participar")
          }
          if (tournament.teams[i].players[0].account_id != req.user.account_id) {
            return res.status(403).send("Solo el capitan puede realizar el check-in")
          }
          teamIndex = i
          break
        }
      }
      if (teamIndex == -1) {
        return res.status(403).send("Equipo no encontrado")
      }
      tournament.teams[teamIndex].checkIn = !tournament.teams[teamIndex].checkIn
      saveTournamentDB()
      emitTeam("CHECK_IN", { name: tournament.teams[teamIndex].name, checkIn: tournament.teams[teamIndex].checkIn })

      return res.sendStatus(200)
    })

    server.post("/tournament/reinvite", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (tournament.status != "STARTED") {
        return res.status(403).send("El torneo no esta en juego")
      }

      if (usersReinvite.indexOf(req.user._id) == -1) {
        usersReinvite.push(req.user._id)
        tournySocket.emit("reinvite", {
          playerId: req.user._id,
          matchId: req.body.matchId
        })
        setTimeout(() => {
          usersReinvite.splice(usersReinvite.indexOf(req.user._id))
        }, 60000)
        return res.sendStatus(200)
      }
      else if (req.user.admin) {
        tournySocket.emit("reinvite", {
          playerId: req.user._id,
          matchId: req.body.matchId
        })
        return res.sendStatus(200)
      }
      else {
        return res.send("wait")
      }
    })

    server.post("/tournament/score", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (!req.user.admin) {
        return res.status(403).send("Debes ser administrador para realizar esta accion")
      }
      if (tournament.status != "STARTED") {
        return res.status(403).send("El torneo no esta en juego")
      }

      tournySocket.emit("score", {
        matchId: req.body.matchId,
        score: req.body.score
      })

      return res.sendStatus(200)
    })

    server.post("/tournament/add_caster", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (tournament.status != "STARTED") {
        return res.status(403).send("El torneo no esta en juego")
      }
      if (req.user.admin || req.user.caster) {
        if (tournament.rounds[req.body.matchId.r - 1][req.body.matchId.m - 1].casters) {
          for (let i = 0; i < tournament.rounds[req.body.matchId.r - 1][req.body.matchId.m - 1].casters.length; i++) {
            if (tournament.rounds[req.body.matchId.r - 1][req.body.matchId.m - 1].casters[i] == req.user._id) {
              return res.status(403).send("Ya eres comentarista de esta partida")
            }
          }
        }
        tournySocket.emit("addCaster", {
          user: req.user,
          matchId: req.body.matchId
        })
        return res.sendStatus(200)
      }
      else {
        return res.status(403).send("Debes ser comentarista o administrador para realizar esta accion")
      }
    })

    server.post("/tournament/kill_bot", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (!req.user.admin) {
        return res.status(403).send("Debes ser administrador para realizar esta accion")
      }
      if (tournament.status != "STARTED") {
        return res.status(403).send("El torneo no esta en juego")
      }

      tournySocket.emit("killBot", {
        matchId: req.body.matchId
      })

      return res.sendStatus(200)
    })

    server.post("/tournament/start_bot", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (!req.user.admin) {
        return res.status(403).send("Debes ser administrador para realizar esta accion")
      }
      if (tournament.status != "STARTED") {
        return res.status(403).send("El torneo no esta en juego")
      }

      tournySocket.emit("startBot", {
        matchId: req.body.matchId
      })

      return res.sendStatus(200)
    })

    server.post("/tournament/pause_bot", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (!req.user.admin) {
        return res.status(403).send("Debes ser administrador para realizar esta accion")
      }
      if (tournament.status != "STARTED") {
        return res.status(403).send("El torneo no esta en juego")
      }
      if (tournament.rounds[req.body.matchId.r - 1][req.body.matchId.m - 1].status != "LOBBY") {
        return res.status(403).send("Lobby no encontrado")
      }

      tournySocket.emit("pauseLobby", {
        matchId: req.body.matchId
      })

      return res.sendStatus(200)
    })

    server.post("/tournament/unpause_bot", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (!req.user.admin) {
        return res.status(403).send("Debes ser administrador para realizar esta accion")
      }
      if (tournament.status != "STARTED") {
        return res.status(403).send("El torneo no esta en juego")
      }
      if (tournament.rounds[req.body.matchId.r - 1][req.body.matchId.m - 1].status != "LOBBY_PAUSED") {
        return res.status(403).send("Lobby no encontrado")
      }

      tournySocket.emit("unpauseLobby", {
        matchId: req.body.matchId
      })

      return res.sendStatus(200)
    })

    server.post("/tournament/lobby_properties", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (!req.user.admin) {
        return res.status(403).send("Debes ser administrador para realizar esta accion")
      }
      if (tournament.status != "STARTED") {
        return res.status(403).send("El torneo no esta en juego")
      }
      if (tournament.rounds[req.body.matchId.r - 1][req.body.matchId.m - 1].status.slice(0, 5) == "LOBBY") {
        tournySocket.emit("setLobbyProperties", {
          matchId: req.body.matchId,
          properties: req.body.properties
        })
        return res.sendStatus(200)
      }
      return res.status(403).send("No es posible realizar esta accion")
    })

    server.post("/tournament/bot_kick_player", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (!req.user.admin) {
        return res.status(403).send("Debes ser administrador para realizar esta accion")
      }
      if (tournament.status != "STARTED") {
        return res.status(403).send("El torneo no esta en juego")
      }
      if (tournament.rounds[req.body.matchId.r - 1][req.body.matchId.m - 1].status == "WAITING"
        || tournament.rounds[req.body.matchId.r - 1][req.body.matchId.m - 1].status.slice(0, 5) == "LOBBY") {
        let teamIndex = -1, playerIndex = -1
        for (let i = 0; i < tournament.teams.length; i++) {
          if (tournament.teams[i].name == req.body.teamName) {
            if (tournament.teams[i].players.length == 1) {
              return res.status(403).send("No es posible realizar esta accion")
            }
            teamIndex = i
            for (let x = 0; x < tournament.teams[i].players.length; x++) {
              if (tournament.teams[i].players[x].account_id == req.body.account_id) {
                playerIndex = x
                break
              }
            }
            break
          }
        }
        if (teamIndex == -1) {
          return res.status(403).send("Equipo no encontrado")
        }
        if (playerIndex == -1) {
          return res.status(403).send("Jugador no encontrado")
        }
        if (tournament.teams[teamIndex].players[playerIndex] && tournament.teams[teamIndex].players[playerIndex].account_id == req.body.account_id) {
          tournySocket.emit("kickPlayer", {
            matchId: req.body.matchId,
            team: req.body.team,
            playerId: tournament.teams[teamIndex].players[playerIndex].id
          })
        }
        return res.sendStatus(200)
      }
      return res.status(403).send("No es posible realizar esta accion")
    })

    server.post("/tournament/bot_player_join_team", (req, res) => {
      if (!req.user) {
        return res.status(403).send("Debes iniciar sesion para realizar esta accion")
      }
      if (usersBotPlayerJoinTeam.indexOf(req.user._id) > -1) {
        return res.send("wait")
      }
      if (tournament.status != "STARTED") {
        return res.status(403).send("El torneo no esta en juego")
      }
      if (tournament.rounds[req.body.matchId.r - 1][req.body.matchId.m - 1].status == "WAITING"
        || tournament.rounds[req.body.matchId.r - 1][req.body.matchId.m - 1].status.slice(0, 5) == "LOBBY") {
        let teamIndex = -1
        for (let i = 0; i < tournament.teams.length; i++) {
          if (tournament.teams[i].name == req.body.teamName) {
            if (tournament.teams[i].players.length == 5) {
              return res.status(403).send("Equipo completo")
            }
            teamIndex = i
          }
          for (let x = 0; x < tournament.teams[i].players.length; x++) {
            if (tournament.teams[i].players[x].account_id == req.user.account_id) {
              return res.status(403).send("Ya eres parte de un equipo")
            }
          }
        }
        if (teamIndex == -1) {
          return res.status(403).send("Equipo no encontrado")
        }
        if (tournament.teams[teamIndex].password && tournament.teamsPasswords[teamIndex].toUpperCase() != req.body.password.toUpperCase()) {
          return res.send("password")
        }
        const player = {
          _id: req.user._id,
          steamname: req.user.steamname,
          account_id: req.user.account_id,
          profileurl: req.user.profileurl,
          steamavatar: req.user.steamavatar,
          loccountrycode: req.user.loccountrycode
        }
        tournySocket.emit("playerJoinTeam", {
          matchId: req.body.matchId,
          team: req.body.team,
          player
        })
        usersBotPlayerJoinTeam.push(req.user._id)
        setTimeout(() => {
          usersBotPlayerJoinTeam.splice(usersBotPlayerJoinTeam.indexOf(req.user._id))
        }, 60000)
        return res.sendStatus(200)
      }
      return res.sendStatus(500)
    })

    let savingTournamentDB = false
    function saveTournamentDB() {
      if (!savingTournamentDB) {
        setTimeout(() => {
          tournament.save()
            .then(() => {
              savingTournamentDB = false
            })
            .catch(err => {
              console.error("Error saving tournament database", err)
              savingTournamentDB = false
            })
        }, DATABASE_SAVE_DELAY)
        savingTournamentDB = true
      }
    }

    let tournamentIo

    let emittingPlayer = false, emitPlayerData = []
    function emitPlayer(type, data) {
      emitPlayerData.push({ type, data })
      if (!emittingPlayer) {
        emittingPlayer = true
        setTimeout(() => {
          if (emitPlayerData.length > 0) {
            tournamentIo.emit("players", emitPlayerData)
            emitPlayerData = []
          }
          emittingPlayer = false
        }, SOCKET_MESSAGE_DELAY)
      }
    }

    let emittingTeam = false, emitTeamData = []
    /*data = {
      name,
      players: [{
        id,
        name,
        account_id,
        profileurl,
        steamavatar
      }],
      password
    }*/
    function emitTeam(type, data) {
      switch (type) {
        case "ADD_TEAM": {
          emitTeamData.push({ type, data })
          break
        }
        case "ADD_PLAYERS": {
          if (emitTeamData.length > 0
            && emitTeamData[emitTeamData.length - 1].data.name == data.name
            && emitTeamData[emitTeamData.length - 1].type == "ADD_PLAYERS") {
            emitTeamData[emitTeamData.length - 1].data.players.push(...data.players)
          }
          else {
            emitTeamData.push({ type, data })
          }
          break
        }
        case "REMOVE_PLAYERS": {
          if (emitTeamData.length > 0
            && emitTeamData[emitTeamData.length - 1].data.name == data.name
            && emitTeamData[emitTeamData.length - 1].type == "REMOVE_PLAYERS") {
            emitTeamData[emitTeamData.length - 1].data.players.push(...data.players)
          }
          else {
            emitTeamData.push({ type, data })
          }
          break
        }
        case "CHECK_IN": {
          if (emitTeamData.length > 0
            && emitTeamData[emitTeamData.length - 1].data.name == data.name
            && emitTeamData[emitTeamData.length - 1].type == "CHECK_IN") {
            emitTeamData[emitTeamData.length - 1].data.checkIn = data.checkIn
          }
          else {
            emitTeamData.push({ type, data })
          }
          break
        }
      }
      if (!emittingTeam) {
        emittingTeam = true
        setTimeout(() => {
          if (emitTeamData.length > 0) {
            tournamentIo.emit("teams", emitTeamData)
            emitTeamData = []
          }
          emittingTeam = false
        }, SOCKET_MESSAGE_DELAY)
      }
    }

    let emittingMatch = false, emitMatchData = []
    /*data = {
      casters,
      matchId,
      nextMatch: {
        id,
        p
      },
      winnerTeamId,
      timestamp,
      heroes: {
        radiant,
        dire
      }
    }*/
    function emitMatch(type, data) {
      let found = false
      for (let i = 0; i < emitMatchData.length; i++) {
        if (emitMatchData[i].data.matchId.s == data.matchId.s
          && emitMatchData[i].data.matchId.r == data.matchId.r
          && emitMatchData[i].data.matchId.m == data.matchId.m) {
          found = true
          if (type == "ADD_CASTER") {
            if (emitMatchData[i].data.casters) {
              emitMatchData[i].data.casters.push(...data.casters)
            }
            else {
              emitMatchData[i].data.casters = data.casters
            }
          }
          else {
            emitMatchData[i].type = type
            emitMatchData[i].data = { ...emitMatchData[i].data, ...data }
          }
          break
        }
        else {
          continue
        }
      }
      if (!found) emitMatchData.push({ type, data })
      if (!emittingMatch) {
        emittingMatch = true
        setTimeout(() => {
          tournamentIo.emit("matches", emitMatchData)
          emitMatchData = []
          emittingMatch = false
        }, SOCKET_MESSAGE_DELAY)
      }
    }

    // server.get("/start_tournament", (req, res) => {
    //   if (!req.user.admin || tournament.status != "SIGN_UP") {
    //     return res.sendStatus(403)
    //   }

    //   clearTimeout(startTournamentTimeout)
    //   startTournamentTimeout = null
    //   startCheckIn()

    //   return res.redirect("/")
    // })

    server.get("/r/tournament/:date", (req, res) => {
      // Check if timestamp is from Thu Jun 01 2017 to Sat Jun 01 2019
      if (req.params.date > 1496289600000 && req.params.date < 1559361600000) {
        getTournamentByDate(parseInt(req.params.date))
          .then(result => {
            return res.status(200).json(result)
          })
          .catch(err => {
            return res.status(500).send(err)
          })
      }
      else {
        return res.sendStatus(500)
      }
    })

    server.get("/r/previousTournaments", (req, res) => {
      getPreviousTournamentDatesWinners()
        .then(result => {
          return res.send(result)
        })
        .catch(err => {
          return res.status(500).send(err)
        })
    })

    function detectLocale(req) {
      return acceptLanguage.get(req.cookies.locale || req.headers["accept-language"]) || "en"
    }

    server.get("/chat", (req, res) => {
      const locale = detectLocale(req)
      if (!req.cookies.locale) res.cookie("locale", locale, { maxAge: 2592000000 })
      req.locale = locale
      req.localeDataScript = getLocaleDataScript(locale)
      req.messages = getMessages(locale)
      return handle(req, res)
    })

    //from this point on all routes will be handled by Next
    server.get("*", (req, res) => {
      req.serverTimestamp = Date.now()
      //res.cookie('locale', detectLocale(req), { maxAge: 2592000000 })
      const locale = detectLocale(req)
      if (!req.cookies.locale) res.cookie("locale", locale, { maxAge: 2592000000 })
      req.locale = locale
      req.localeDataScript = getLocaleDataScript(locale)
      req.messages = getMessages(locale)
      req.weekWinner = weekWinner
      return handle(req, res)
    })

    //express server listen for connections on port "port" (5000 if not specified)
    const serverListen = server.listen(port, "0.0.0.0", (err) => {
      if (err) throw err
      console.log(`> Ready on ${address} (${port})`)
    })

    function shuffleTeams(teams, teamsPasswords) {
      var currentIndex = teams.length, temporaryValue, randomIndex

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1

        // And swap it with the current element.
        temporaryValue = teams[currentIndex]
        teams[currentIndex] = teams[randomIndex]
        teams[randomIndex] = temporaryValue

        temporaryValue = teamsPasswords[currentIndex]
        teamsPasswords[currentIndex] = teamsPasswords[randomIndex]
        teamsPasswords[randomIndex] = temporaryValue
      }

      return { teams, teamsPasswords }
    }

    const socketUser = function (socket, next) {
      session(socket.handshake, {}, () => {
        if (socket.handshake.session.passport) {
          User.findById(socket.handshake.session.passport.user).select({
            steamname: 1,
            steamavatar: { $slice: [0, 1] },
            admin: 1,
            caster: 1
          })
            .then(user => {
              socket.user = user._doc
              next()
            })
            .catch(err => {
              console.error("Error getting socket user", err)
              next()
            })
        }
        else {
          next()
        }
      })
    }

    const io = require("socket.io")(serverListen)


    const chatIo = io.of("/chat")
    let chatUsers = []
    let chatUsersTimeout = []

    chatIo.use(socketUser)
    antiSpam.init({
      banTime: 30,         // Ban time in minutes
      kickThreshold: 15,          // User gets kicked after this many spam score
      kickTimesBeforeBan: 3,          // User gets banned after this many kicks
      banning: true,       // Uses temp IP banning after kickTimesBeforeBan
      heartBeatStale: 40,         // Removes a heartbeat after this many seconds
      heartBeatCheck: 4,          // Checks a heartbeat per this many seconds
      io: chatIo  // Bind the socket.io variable
    })

    antiSpam.event.on("kick", socket => {
      socket.emit("spamKick")
      socket.disconnect()
    })

    chatIo.on("connection", socket => {

      if (socket.banned) {
        socket.emit("spamBan", socket.bannedUntil)
        socket.disconnect()
      }

      antiSpam.addSpam(socket)

      Chat.find().sort({ _id: -1 }).limit(30)
        .then(messages => {
          socket.emit("messagesFetched", messages)
        })
        .catch(err => {
          console.error("Error fetching messages", err)
        })

      if (socket.user) {
        socket.join(socket.user._id)
        let found = false
        for (let i = 0; i < chatUsers.length; i++) {
          if (chatUsers[i]._id == socket.user._id) {
            found = true
            break
          }
        }
        if (!found) {
          chatUsers.push(socket.user)
          socket.broadcast.emit("userJoined", socket.user)
        }
      }
      socket.emit("users", chatUsers)

      socket.on("message", text => {
        antiSpam.addSpam(socket)

        if (socket.user) {
          Chat.create({
            text,
            user: socket.user._id
          })
            .then(result => {
              chatIo.emit("message", {
                _id: result._id,
                createdAt: result.createdAt,
                text: result.text,
                user: socket.user
              })
            })
            .catch(err => {
              console.error("Error creating new chat message", err)
            })
        }
      })

      socket.on("fetchMessages", lastMessageId => {
        antiSpam.addSpam(socket)

        Chat.find().sort({ _id: -1 }).where("_id").lt(lastMessageId).limit(30)
          .then(messages => {
            socket.emit("messagesFetched", messages)
          })
          .catch(err => {
            console.error("Error fetching messages", err)
          })
      })

      socket.on("disconnect", () => {
        antiSpam.addSpam(socket)

        if (!socket.user) return

        chatIo.in(socket.user._id).clients((error, clients) => {
          if (error) {
            return console.error(error)
          }
          if (clients.length == 0) {
            const userIndex = chatUsers.indexOf(socket.username)
            if (chatUsersTimeout[userIndex]) {
              clearTimeout(chatUsersTimeout[userIndex])
              chatUsersTimeout[userIndex] = undefined
            }
            chatUsersTimeout[userIndex] = setTimeout(() => {
              removeUserFromChatUsers(socket)
            }, 5000)
          }
        })
      })
    })

    function removeUserFromChatUsers(socket) {
      chatIo.in(socket.user._id).clients((error, clients) => {
        if (error) {
          return console.error(error)
        }
        if (clients.length == 0) {
          chatUsers.splice(chatUsers.indexOf(socket.user._id), 1)
          chatIo.emit("userLeft", socket.user._id)
        }
      })
    }

    tournamentIo = io.of("/tournament").on("connection", socket => {
      getTournamentById(tournament._id)
        .then(result => {
          const emitData = {
            status: result.status,
            prize: result.prize,
            teams: result.teams,
            timestamp: result.timestamp,
            startDate: result.startDate,
          }
          if (signUpDate) emitData.signUpDate = signUpDate
          if (result.rounds.length > 0) emitData.rounds = result.rounds
          if (result.casters.length > 0) emitData.casters = result.casters
          if (result.players.length > 0) emitData.players = result.players
          if (result.donators.length > 0) emitData.donators = result.donators
          if (result.teamsCheckInInit) emitData.teamsCheckInInit = result.teamsCheckInInit
          if (result.winner.name) emitData.winner = result.winner
          socket.emit("tournament", emitData)
        })
        .catch(err => {
          const emitData = {
            status: tournament.status,
            teams: tournament.teams,
            timestamp: tournament.timestamp,
            startDate: tournament.startDate,
          }
          if (signUpDate) emitData.signUpDate = signUpDate
          if (tournament.rounds.length > 0) emitData.rounds = tournament.rounds
          if (tournament.casters.length > 0) emitData.casters = tournament.casters
          if (tournament.players.length > 0) emitData.players = tournament.players
          if (tournament.teamsCheckInInit) emitData.teamsCheckInInit = tournament.teamsCheckInInit
          if (tournament.winner.name) emitData.winner = tournament.winner
          socket.emit("tournament", emitData)
          console.error("Error getting tournament on user tournament socket connection", err)
        })

      socket.on("room", account_id => {
        socket.account_id = account_id
        socket.join(account_id)
      })
    })

    if (tournament.status == "SIGN_UP") {
      startTournamentTimeout = setTimeout(() => {
        startTournamentTimeout = null
        startCheckIn()
      }, tournament.startDate.getTime() - Date.now())
    }

    if (tournament.status == "CHECK_IN") {
      startCheckIn()
    }

    if (tournament.status == "FINISHED") {
      nextTournament()
    }

    function startCheckIn() {
      tournament.status = "CHECK_IN"
      tournament.timestamp = Date.now()
      tournament.teamsCheckInInit = true
      tournament.teams.forEach(team => {
        team.checkIn = false
      })
      saveTournamentDB()
      tournamentIo.emit("tournament", {
        status: tournament.status,
        timestamp: tournament.timestamp,
        teamsCheckInInit: true
      })

      setTimeout(() => {
        startTournament()
      }, 900000)
    }

    function startTournament() {
      let teamsReady = [], teamsReadyPasswords = []
      tournament.teams.forEach((team, index) => {
        if (team.players.length >= 5 && team.checkIn) {
          teamsReady.push(team)
          teamsReadyPasswords.push(tournament.teamsPasswords[index])
        }
        tournament.teams[index].checkIn = undefined
      })
      tournament.teamsCheckInInit = undefined
      if (teamsReady.length < 4) {
        tournament.status = "CANCELED"
        tournament.timestamp = Date.now()
        tournamentIo.emit("tournament", {
          status: tournament.status,
          timestamp: tournament.timestamp,
        })
        saveTournamentDB()
        return
      }
      tournament.teamsSignedUp = {
        teams: tournament.teams,
        teamsPasswords: tournament.teamsPasswords
      }
      let temp = shuffleTeams(teamsReady, teamsReadyPasswords)
      tournament.teams = temp.teams
      tournament.teamsPasswords = temp.teamsPasswords
      temp = undefined
      teamsReady = undefined
      teamsReadyPasswords = undefined

      saveTournamentDB()

      tournySocket = ioClient.connect(tournyManagerAddress)

      tournySocket.on("connect", () => {
        console.log("Connected to Tournament manager")
      })

      tournySocket.on("init", () => {
        tournySocket.emit("start", tournament.teams)
      })

      tournySocket.on("started", payload => {
        tournament.rounds = payload.rounds
        tournament.teams = payload.teams
        tournament.status = "STARTED"
        saveTournamentDB()
        tournamentIo.emit("tournament", {
          rounds: tournament.rounds,
          status: tournament.status,
          teams: tournament.teams
        })
      })

      tournySocket.on("finished", payload => {
        tournament.status = "FINISHED"
        tournament.teams[payload.winnerTeamId - 1].match = { s: 1, r: tournament.rounds.length, m: 1 }
        tournament.winner = tournament.teams[payload.winnerTeamId - 1]
        tournament.rounds[tournament.rounds.length - 1][0].status = "MATCH_FINISHED"
        tournament.rounds[tournament.rounds.length - 1][0].timestamp = Date.now()
        tournament.rounds[tournament.rounds.length - 1][0].winner = payload.winnerTeamId == tournament.rounds[tournament.rounds.length - 1][0].teamTop.id ? 1 : 2
        tournament.markModified(`rounds.${tournament.rounds.length - 1}.0.status`)
        tournament.markModified(`rounds.${tournament.rounds.length - 1}.0.timestamp`)
        tournament.markModified(`rounds.${tournament.rounds.length - 1}.0.winner`)
        weekWinner = tournament.winner
        saveTournamentDB()
        nextTournament()
        tournamentIo.emit("tournament", {
          rounds: tournament.rounds,
          status: tournament.status,
          teams: tournament.teams,
          winner: tournament.winner,
          signUpDate
        })
        tournySocket.disconnect()
        tournySocket = null
      })

      tournySocket.on("lobbyCreated", payload => {
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].status = "LOBBY"
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].timestamp = payload.timestamp
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.status`)
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.timestamp`)
        saveTournamentDB()
        emitMatch("LOBBY", { matchId: payload.matchId, timestamp: payload.timestamp })
      })

      tournySocket.on("matchPicksStarted", payload => {
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].status = "MATCH_PICKS"
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].timestamp = payload.timestamp
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.status`)
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.timestamp`)
        saveTournamentDB()
        emitMatch("MATCH_PICKS", { matchId: payload.matchId, timestamp: payload.timestamp })
      })

      tournySocket.on("matchGameStarted", payload => {
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].status = "MATCH_GAME"
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].timestamp = payload.timestamp
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].teamTop.heroes = payload.heroes.radiant
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].teamBottom.heroes = payload.heroes.dire
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.status`)
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.timestamp`)
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.teamTop.heroes`)
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.teamBottom.heroes`)
        saveTournamentDB()
        emitMatch("MATCH_GAME", { matchId: payload.matchId, timestamp: payload.timestamp, heroes: payload.heroes })
      })

      tournySocket.on("matchFinished", payload => {
        tournament.teams[payload.winnerTeamId - 1].match = payload.nextMatch.id
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].status = "MATCH_FINISHED"
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].timestamp = payload.timestamp
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].winner = payload.pWinner + 1
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.status`)
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.timestamp`)
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.winner`)
        if (payload.nextMatch.p[0] > 0) {
          tournament.rounds[payload.nextMatch.id.r - 1][payload.nextMatch.id.m - 1].teamTop = {
            name: tournament.teams[payload.nextMatch.p[0] - 1].name,
            id: `${payload.nextMatch.p[0]}`
          }
          tournament.markModified(`rounds.${payload.nextMatch.id.r - 1}.${payload.nextMatch.id.m - 1}.teamTop`)
        }
        if (payload.nextMatch.p[1] > 0) {
          tournament.rounds[payload.nextMatch.id.r - 1][payload.nextMatch.id.m - 1].teamBottom = {
            name: tournament.teams[payload.nextMatch.p[1] - 1].name,
            id: `${payload.nextMatch.p[1]}`
          }
          tournament.markModified(`rounds.${payload.nextMatch.id.r - 1}.${payload.nextMatch.id.m - 1}.teamBottom`)
        }
        saveTournamentDB()
        emitMatch("MATCH_FINISHED", {
          matchId: payload.matchId,
          nextMatch: payload.nextMatch,
          winnerTeamId: payload.winnerTeamId,
          timestamp: payload.timestamp,
          winner: payload.pWinner + 1
        })
      })

      tournySocket.on("addCasterFulfilled", payload => {
        const caster = {
          _id: payload.user._id,
          account_id: payload.user.account_id,
          steamname: payload.user.steamname,
          profileurl: payload.user.profileurl,
          steamavatar: payload.user.steamavatar,
          loccountrycode: payload.user.loccountrycode
        }
        let found = false
        for (let i = 0; i < tournament.casters.length; i++) {
          if (tournament.casters[i].id == payload.user._id) {
            found = true
            break
          }
        }
        if (!found) {
          tournament.casters.push(caster)
        }
        if (tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].casters) {
          tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].casters.push(payload.user._id)
        }
        else {
          tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].casters = [payload.user._id]
        }
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.casters`)
        saveTournamentDB()
        emitMatch("ADD_CASTER", { matchId: payload.matchId, casters: [caster] })
      })

      tournySocket.on("killBotFulfilled", payload => {
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].status = "WAITING_NO_BOT"
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].timestamp = payload.timestamp
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.status`)
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.timestamp`)
        saveTournamentDB()
        emitMatch("WAITING_NO_BOT", { matchId: payload.matchId, timestamp: payload.timestamp })
      })

      tournySocket.on("startBotFulfilled", payload => {
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].status = "WAITING"
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].timestamp = payload.timestamp
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.status`)
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.timestamp`)
        saveTournamentDB()
        emitMatch("WAITING", { matchId: payload.matchId, timestamp: payload.timestamp })
      })

      tournySocket.on("pauseLobbyFulfilled", payload => {
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].status = "LOBBY_PAUSED"
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.status`)
        saveTournamentDB()
        emitMatch("LOBBY_PAUSED", { matchId: payload.matchId })
      })

      tournySocket.on("unpauseLobbyFulfilled", payload => {
        tournament.rounds[payload.matchId.r - 1][payload.matchId.m - 1].status = "LOBBY"
        tournament.markModified(`rounds.${payload.matchId.r - 1}.${payload.matchId.m - 1}.status`)
        saveTournamentDB()
        emitMatch("LOBBY", { matchId: payload.matchId })
      })

      tournySocket.on("botKickPlayerFulfilled", payload => {
        for (let i = 0; i < tournament.teams[payload.teamIndex].players.length; i++) {
          if (tournament.teams[payload.teamIndex].players[i].id == payload.playerId) {
            const playerRemoved = tournament.teams[payload.teamIndex].players.splice(i, 1)[0]
            saveTournamentDB()
            emitTeam("REMOVE_PLAYERS", {
              name: tournament.teams[payload.teamIndex].name,
              players: [playerRemoved.account_id]
            })
            setTimeout(() => {
              tournamentIo.in(playerRemoved.account_id).emit("kicked")
            }, SOCKET_MESSAGE_DELAY)
            break
          }
        }
      })

      tournySocket.on("botPlayerJoinTeamFulfilled", payload => {
        let found = false
        for (let i = 0; i < tournament.teams[payload.teamIndex].players.length; i++) {
          if (tournament.teams[payload.teamIndex].players[i].account_id == payload.player.account_id) {
            found = true
            break
          }
        }
        if (!found) {
          tournament.teams[payload.teamIndex].players.push(payload.player)
          saveTournamentDB()
          emitTeam("ADD_PLAYERS", {
            name: tournament.teams[payload.teamIndex].name,
            players: [payload.player]
          })
        }
      })
    }

    function nextTournament() {
      signUpDate = new Date()
      if (signUpDate.getDay() != 1) {
        signUpDate.setDate(signUpDate.getDate() + (0 - signUpDate.getDay() + 7) % 7 + 1)
      }
      signUpDate.setHours(15, 0, 0, 0)
      setTimeout(() => {
        signUpDate = undefined
        createTournament()
          .then(result => {
            tournament = result
            tournament.populated("teams.players", [], { model: User })
            tournament.populated("teamsSignedUp.players", [], { model: User })
            tournament.populated("casters", [], { model: User })
            tournament.populated("players.user", [], { model: User })
            tournament.populated("winner.players", [], { model: User })
            startTournamentTimeout = setTimeout(() => {
              startTournamentTimeout = null
              startCheckIn()
            }, tournament.startDate.getTime() - Date.now())
            const emitData = {
              status: tournament.status,
              teams: tournament.teams,
              timestamp: tournament.timestamp,
              startDate: tournament.startDate
            }
            tournamentIo.emit("tournament", emitData)
          })
          .catch(err => {
            console.error("Error creating tournament", err)
          })
      }, signUpDate.getTime() - Date.now())
    }
  })
  .catch(err => {
    console.error(err)
  })