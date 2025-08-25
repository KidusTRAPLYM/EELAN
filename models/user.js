// Modules being imported
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const newUser = new Schema({
  name: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    unique: true,
  },
  passwordHint: { type: String },
  avatar: { type: String, default: "/Images/avatar3.png" }
});
newUser.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

newUser.statics.login = async function (name, password) {
  const user = await this.findOne({ name });
  if (!user) {
    throw Error("User not found");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw Error("Incorrect password");
  }
  return user;
};

const User = mongoose.model("User", newUser);
module.exports = User;
