const mongoose = require("mongoose");
const { Place } = require("./Place");

const reviewSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  placeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
  },
  username: {
    type: String,
  },
  comment: {
    type: String,
  },
  rate: {
    type: Number,
  },
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = { Review };
