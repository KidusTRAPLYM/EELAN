// Modules being imported
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newUser = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
});
newUser.statics.login = async function (email) {
  const user = await User.findOne({ email });
  if (user) {
    return user;
  }
};
const User = mongoose.model("User", newUser);
module.exports = User;
