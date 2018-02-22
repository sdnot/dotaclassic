import bignumber from "bignumber.js"

export function ToAccountID(steamid) {
  return new bignumber(steamid).minus("76561197960265728") - 0
}

export function ToSteamID(accid) {
  return `${new bignumber(accid).plus("76561197960265728")}`
}

export function radiantRatingWin(ratings) {
  const kFactor = 2000
  const pool = 50
  const radiantFactor = Math.pow(10, (ratings.radiant / kFactor))
  const direFactor = Math.pow(10, (ratings.dire / kFactor))

  return Math.round(direFactor / (direFactor + radiantFactor) * pool)
}

export function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}