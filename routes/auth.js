import csrf from "csurf"
import { Router } from "express"
import passport from "passport"
import { Strategy as SteamStrategy } from "passport-steam"
import { findUserById, initialize } from "../database/user"

export function authRouterInit(address, session) {
  const router = Router()
  const csrfProtection = csrf()

  // Steam passport
  passport.serializeUser(function (id, done) {
    done(null, id)
  })

  passport.deserializeUser(function (id, done) {
    findUserById(id)
      .then(user => done(null, user))
      .catch(err => done(err, null))
  })

  passport.use(
    new SteamStrategy({
      returnURL: `${address}/auth/steam/return`,
      realm: address,
      apiKey: "DBDC643CA768279DF0F2B1624C857477"
    }, function (identifier, profile, done) {
      initialize(profile)
        .then(user => done(null, user._id))
        .catch(err => done(err, null))
    })
  )

  router.use(session)

  router.use(passport.initialize())
  router.use(passport.session())

  router.use(csrfProtection)

  router.get("/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.sendStatus(200)
    })
  })

  router.get("/auth/steam",
    (req, res, next) => {
      req.session.returnTo = req.query.returnTo || "/"
      next()
    },
    passport.authenticate("steam"))

  router.get("/auth/steam/return",
    passport.authenticate("steam", { failureRedirect: "/" }),
    (req, res) => {
      const returnTo = req.session.returnTo || "/"
      res.redirect(`${returnTo}?login`)
    })

  // router.post('/auth/signup', (req, res) => {
  //   register(req.body.id, req.body.username, req.body.email)
  //     .then(taken => res.send(taken))
  //     .catch(err => {
  //       console.log("Error saving user registration in database", err)
  //       res.sendStatus(500)
  //     })
  // })


  return router
}

export function ensureAuthenticated(req, res, next) {
  if (req.url == "/") return next()
  if (req.isAuthenticated()) return next()
  res.redirect("/")
}

export function ensureRegistered(req, res, next) {
  if (req.url == "/") return next()
  if (req.user) {
    if (req.user.username) return next()
  }
  res.redirect("/")
}