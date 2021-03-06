const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// cerate user schema

const UserSchema = new Schema({
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    reqire: true
  },
  avatar: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Users = mongoose.model("users", UserSchema);
