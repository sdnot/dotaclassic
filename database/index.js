/*eslint no-console: "off"*/
import session from "express-session"
import mongoose from "mongoose"

export default function initDatabase(db_address) {
  const MongoStore = require("connect-mongo")(session)
  mongoose.Promise = global.Promise
  //mongoose.set("debug", true)
  mongoose.connect(db_address, { useMongoClient: true }, err => {
    if (err) throw err
    console.log("Connected to MongoDB")
  })
    .catch(err => {
      console.error("Error connecting to MongoDB", err)
    })

  const db = {
    mongoose,
    MongoStore,
    session
  }

  return db
}
