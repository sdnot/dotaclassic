import mongoose from "mongoose"
import autopopulate from "mongoose-autopopulate"
const Schema = mongoose.Schema

const userRef = {
  type: String,
  ref: "User",
  autopopulate: {
    select: {
      steamname: 1,
      steamavatar: { $slice: [0, 1] },
      admin: 1,
      caster: 1
    }
  }
}

const chatSchema = new Schema({
  text: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: userRef
}, { versionKey: false })
chatSchema.plugin(autopopulate)

const Chat = mongoose.model("Chat", chatSchema, "chat")

export default Chat