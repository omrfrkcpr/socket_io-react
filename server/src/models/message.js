const { mongoose } = require("../configs/dbConnection");

const MessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  readerIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true, // Index to improve search performance for readers.
    },
  ],
  content: { type: String, required: true },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
