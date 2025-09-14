import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  rating: { type: Number, min: 1, max: 5, required: true },
  reviewText: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const Review =
  mongoose.models?.Review || mongoose.model("Review", reviewSchema);

export default Review;
