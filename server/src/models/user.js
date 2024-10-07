const { mongoose } = require("../configs/dbConnection");

const UserSchema = new mongoose.Schema({
  username: { type: String, trim: true, required: true, unique: true },
  avatar: {
    type: String,
    trim: true,
  },
  email: { type: String, trim: true, required: true, unique: true },
  password: { type: String, trim: true, required: true },
});

module.exports = mongoose.model("User", UserSchema);
