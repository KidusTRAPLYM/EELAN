const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const newSchema = new Schema({
  message: {
    type: String,
  },
  like: {
    type: Number,
    default: 0,
  },
  dislike: {
    type: Number,
    default: 0,
  },
  likedBy: {
    type: [String],
    default: [],
  },
  dislikedBy: {
    type: [String],
    default: [],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
newSchema.virtual("timeago").get(function () {
  const now = Date.now();
  const timeDifference = now - this.createdAt;
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds === 1) {
    return `Just now`;
  } else if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (minutes === 1) {
    return `One minute ago`;
  } else if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (hours === 1) {
    return `One hour ago`;
  } else if (hours < 60) {
    return `${hours} hours ago`;
  } else if (days === 1) {
    return `One day ago`;
  } else if (days < 24) {
    return `${days} days ago`;
  } else if (weeks === 1) {
    return `One week ago`;
  } else if (weeks < 7) {
    return `${weeks} weeks ago`;
  } else if (months === 1) {
    return `One month ago`;
  } else if (months < 30) {
    return `${months} months ago`;
  } else if (years === 1) {
    return `One year ago`;
  } else if (years < 365) {
    return `${years} years ago`;
  }
});
newSchema.set("toJSON", { virtuals: true });
const model = mongoose.model("Post", newSchema);
module.exports = model;
