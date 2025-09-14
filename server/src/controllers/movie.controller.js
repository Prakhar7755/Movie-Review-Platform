import MovieModel from "../models/movie.model.js";
import ReviewModel from "../models/review.model.js";
import { handleControllerError } from "../utils/handleControllerError.js";

// get all movies
const getAllMovies = async (req, res) => {
  try {
    let { page = 1, limit = 10, genre, year, title } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};
    if (genre) filter.genre = { $in: [genre] };
    if (year) filter.releaseYear = parseInt(year);
    if (title) filter.title = { $regex: title, $options: "i" }; // case insensitive search

    const movies = await MovieModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalMovies = await MovieModel.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: movies.length,
      total: totalMovies,
      page,
      totalPages: Math.ceil(totalMovies / limit),
      movies,
    });
  } catch (err) {
    return handleControllerError(res, err, "Error fetching movies ");
  }
};

// get a specific movie GET
const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    // get movie
    const movie = await MovieModel.findById(id);
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }

    // get reviews of the movie
    const reviews = await ReviewModel.find({ movieId: id })
      .populate("userId", "username profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      movie, // movie details
      reviews, // list of reviews with user info
    });
  } catch (err) {
    return handleControllerError(res, err, "Error fetching movie details");
  }
};

// create a movie POST FOR ADMINS only
const createMovie = async (req, res) => {
  try {
    const { title, genre, releaseYear, director, cast, synopsis, posterUrl } =
      req.body;
    if (!title || !genre || !releaseYear) {
      return res.status(400).json({
        success: false,
        message: "Title, genre, and release year are required.",
      });
    }
    const movie = await MovieModel.create({
      title,
      genre,
      releaseYear,
      director,
      cast,
      synopsis,
      posterUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Movie created successfully",
      movie,
    });
  } catch (err) {
    return handleControllerError(res, err, "Error creating movie");
  }
};

// get movie reviews GET
const getMovieReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await MovieModel.findById(id).select("title");
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }

    const reviews = await ReviewModel.find({ movieId: id })
      .populate("userId", "username profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      movie: movie.title,
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    return handleControllerError(res, err, "Error fetching movie reviews");
  }
};

// add reviews POST
const addMovieReview = async (req, res) => {
  try {
    const { id } = req.params; // movieId
    const { rating, reviewText } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const existingReview = await ReviewModel.findOne({
      userId: req.user.userId,
      movieId: id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this movie.",
      });
    }

    const movie = await MovieModel.findById(id);
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }

    // create new review
    const newReview = await ReviewModel.create({
      userId: req.user.userId,
      movieId: id,
      rating,
      reviewText,
    });

    // recalculate average rating
    const stats = await ReviewModel.aggregate([
      { $match: { movieId: movie._id } },
      {
        $group: {
          _id: "$movieId",
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    if (stats.length > 0) {
      movie.averageRating = parseFloat(stats[0].avgRating.toFixed(1));

      await movie.save();
    }

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: newReview,
      updatedAverageRating: movie.averageRating,
    });
  } catch (err) {
    return handleControllerError(res, err, "Error adding movie review");
  }
};

export {
  getAllMovies,
  getMovieById,
  createMovie,
  getMovieReviews,
  addMovieReview,
};
