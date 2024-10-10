const { mongoose } = require("../configs/dbConnection");

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    notificationType: {
      type: String,
      enum: ["eventReminder", "eventUpdate", "eventJoinRequest", "scoreUpdate"],
      required: true,
    },
    content: { type: String, required: true },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
