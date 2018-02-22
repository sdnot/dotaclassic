import mongoose from "mongoose"
const Schema = mongoose.Schema
import { ToAccountID } from "../util"

const userSchema = new Schema({
  _id: String,
  account_id: String,
  stats: Object,
  steamname: String,
  steamavatar: [String],
  username: String,
  username_lower: String,
  email: String,
  email_lower: String,
  profileurl: String,
  loccountrycode: String,
  admin: Boolean,
  caster: Boolean
})

export let User
try {
  User = mongoose.model("User")
} catch (err) {
  User = mongoose.model("User", userSchema)
}

export function fetchUsers() {
  return User.find()
}

export function findUserById(id) {
  return User.findById(id).select({ __v: 0 })
}

export function initialize(user) {
  let update = {
    _id: user.id,
    account_id: ToAccountID(user.id),
    steamname: user.displayName,
    steamavatar: [
      user.photos[0].value,
      user.photos[1].value,
      user.photos[2].value
    ],
    profileurl: user._json.profileurl,
    loccountrycode: user._json.loccountrycode
  }
  const options = { new: true, upsert: true }
  return User.findByIdAndUpdate(user.id, update, options)
}

export function register(id, username, email) {
  return new Promise((resolve, reject) => {
    let taken = {
      username: null,
      email: null
    }
    const username_lower = username.toLowerCase()
    const email_lower = email.toLowerCase()

    const findResults = Promise.all(
      [
        User.findOne({ username_lower }),
        User.findOne({ email_lower })
      ]
    )

    findResults
      .then(results => {
        if (results[0])
          taken.username = username
        if (results[1])
          taken.email = email
        if (taken.username || taken.email) {
          return resolve(taken)
        }
        User.update({ _id: id }, { username, username_lower, email, email_lower })
          .then(() => resolve(taken))
          .catch((err) => reject(err))
      })
      .catch(err => reject(err))
  })
}

export function findUsernamesById(steamids) {
  let queryIds = []
  for (let i = 0; i < steamids.length; i++) {
    queryIds.push({ _id: steamids[i] })
  }
  const query = { $or: [...queryIds] }
  return User.find(query, "username")
}

export function findRatingsById(steamids) {
  let queryIds = []
  for (let i = 0; i < steamids.length; i++) {
    queryIds.push({ _id: steamids[i] })
  }
  const query = { $or: [...queryIds] }
  return User.find(query, "stats.rating")
}

export function updateUser(user) {
  const options = { new: true, upsert: true }
  return User.findByIdAndUpdate(user._id, { ...user }, options)
}