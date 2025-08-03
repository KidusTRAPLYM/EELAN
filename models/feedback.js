const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const newSchema = new Schema({
  message: {
    type: String,
  },
});
module.exports = mongoose.model("feedback", newSchema);
