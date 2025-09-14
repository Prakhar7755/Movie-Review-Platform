import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
  {
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
    dateAdded: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

watchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const Watchlist =
  mongoose.models?.Watchlist || mongoose.model("Watchlist", watchlistSchema);

export default Watchlist;
