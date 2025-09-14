import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    genre: { type: [String], required: true, default: [] },
    releaseYear: { type: Number, required: true },
    director: { type: String },
    cast: { type: [String], default: [] },
    synopsis: { type: String },
    posterUrl: { type: String },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    ratingsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Movie = mongoose.models?.Movie || mongoose.model("Movie", movieSchema);

export default Movie;