const { mongoose } = require("../configs/dbConnection");

const ConversationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
});

module.exports = mongoose.model("Conversation", ConversationSchema);
