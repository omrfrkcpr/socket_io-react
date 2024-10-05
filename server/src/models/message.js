const { mongoose } = require("../configs/dbConnection");

const MessageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
