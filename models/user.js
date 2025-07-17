// Modules being imported
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newUser = new Schema({
  name: {
    type: String,
    unique: true,
  },
});

newUser.statics.login = async function (name) {
  const user = await User.findOne({ name });
  if (user) {
    return user;
  }
};

const User = mongoose.model("User", newUser);
module.exports = User;
