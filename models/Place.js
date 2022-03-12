const mongoose = require("mongoose");
const { Review } = require("./Review");

const placeSchema = mongoose.Schema({
  name: {
    type: String,
  },
  address: {
    type: String,
  },
  geometry: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  review: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  rate: {
    type: Number,
  },
  img: {
    type: String,
  },
  imgName: {
    type: String,
  },
  writer: {
    type: mongoose.Schema.ObjectId,
  },
});

placeSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.review,
      },
    });
  }
});

const Place = mongoose.model("Place", placeSchema);
module.exports = { Place };
