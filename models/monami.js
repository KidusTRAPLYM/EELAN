const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const newSchema = new Schema({
  message: {
    type: String,
  },
  response: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
module.exports = mongoose.model("monami", newSchema);
