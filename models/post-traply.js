const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const newSchema = new Schema({
  message: {
    type: String,
  },
  type: {
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
  const diff = now - this.createdAt;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes < 2) return "one minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 2) return "one hour ago";
  if (hours < 24) return `${hours} hours ago`;
  if (days < 2) return "one day ago";
  if (days < 7) return `${days} days ago`;
  if (weeks < 2) return "one week ago";
  if (weeks < 5) return `${weeks} weeks ago`;
  if (months < 2) return "one month ago";
  if (months < 12) return `${months} months ago`;
  if (years < 2) return "one year ago";
  return `${years} years ago`;
});

// Add text index on message for text search
newSchema.index({ message: "text" });

newSchema.set("toJSON", { virtuals: true });
const model = mongoose.model("Post", newSchema);
module.exports = model;
