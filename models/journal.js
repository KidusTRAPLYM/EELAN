const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const journalSchema = new Schema({
  name: {
    type: String,
  },
  message: {
    type: String,
  },
  date: {
    type: String,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});
module.exports = mongoose.model("journal", journalSchema);
