// requiring modules
const mongoose = require("mongoose");
// const mongooseType = mongoose.Types;
const Schema = mongoose.Schema;

// model schema
const newSchema = new Schema(
  {
    postId: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

// creating models
const commentModel = mongoose.model("comment", newSchema);
module.exports = commentModel;
