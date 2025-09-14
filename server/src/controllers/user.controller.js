import jwt from "jsonwebtoken";

import UserModel from "../models/user.model.js";
import ReviewModel from "../models/review.model.js";
import WatchlistModel from "../models/watchlist.model.js";
import MovieModel from "../models/movie.model.js";

// JWT SECRET SETUP
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required but not set.");
}
const jwtSecret = process.env.JWT_SECRET;

// signup
const signup = async (req, res) => {
  try {
    const { username, email, password, profilePicture } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and full name are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (process.env.NODE_ENV !== "production") {
      console.log(`Signup attempt for : ${normalizedEmail}`);
    }

    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`⚠️ Email already in use: ${normalizedEmail}`);
      }

      return res.status(400).json({
        success: false,
        message: "Email is already registered. Please use a different one.",
      });
    }

    const user = await UserModel.create({
      email: normalizedEmail,
      password: password,
      username: username.trim(),
      profilePicture: profilePicture,
    });

    if (!user) {
      if (process.env.NODE_ENV !== "production") {
        console.error("❌ Failed to save user to database.");
      }

      return res.status(500).json({
        success: false,
        message: "Unable to create account. Please try again later.",
      });
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`✅ User created: ${username} (${normalizedEmail})`);
    }

    res.status(201).json({
      success: true,
      message: `Account created successfully 🎉 Welcome, ${username}!`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error("🔥 Error during signup:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      ...(process.env.NODE_ENV !== "production" && { error: err.message }),
    });
  }
};

// login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email & password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (process.env.NODE_ENV !== "production") {
      console.log(`🔐 Login attempt for: ${normalizedEmail}`);
    }

    // check if user exists
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`⚠️ Login failed: user not found (${normalizedEmail})`);
      }
      return res.status(404).json({
        success: false,
        message:
          "User not found. Please check your email or register for a new account.",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `⚠️ Login failed: invalid password for ${normalizedEmail}`
        );
      }
      return res.status(401).json({
        success: false,
        message: "Invalid password. Please try again.",
      });
    }

    // JWT token CREATE karo
    const token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret, {
      expiresIn: "2h",
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`✅ User logged in successfully: ${normalizedEmail}`);
    }

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error("🔥 Login Error :", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      ...(process.env.NODE_ENV !== "production" && { error: err.message }),
    });
  }
};

// get user profile and reviews
const getUserProfileAndReviews = async (req, res) => {
  try {
    const { id } = req.params;

    // auth check
    if (req.user.userId !== id /*  */) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    // find user
    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // fetch user reviews and fill the movie details
    const reviews = await ReviewModel.find({ userId: id })
      .populate("movieId", "title posterUrl averageRating releaseYear")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      user,
      reviews,
    });
  } catch (err) {
    console.error("🔥 Error fetching user profile:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      err: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};

// update User profile
const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // authorize check
    if (req.user.userId !== id) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    const { username, email, profilePicture } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      {
        ...(username && { username }),
        ...(email && { email: email.toLowerCase().trim() }),
        ...(profilePicture && { profilePicture }),
      },
      { new: true, runValidators: true, select: "-password" }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("🔥 Error updating profile:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
};

// get user's watchlist
const getUserWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.userId !== id) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    const watchlist = await WatchlistModel.find({ userId: id })
      .populate("movieId", "title posterUrl averageRating releaseYear genre")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: watchlist.length,
      watchlist,
    });
  } catch (error) {
    console.error("🔥 Error fetching watchlist:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
};

// add movie to watchList
const addMovieToWatchlist = async (req, res) => {
  try {
    const { id } = req.params; // of user
    const { movieId } = req.body;

    if (req.user.userId !== id) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    if (!movieId) {
      return res
        .status(400)
        .json({ success: false, message: "movieId is required." });
    }

    const movie = await MovieModel.findById(movieId);
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found." });
    }

    // new entry
    const newEntry = await WatchlistModel.create({ userId: id, movieId });

    return res.status(201).json({
      success: true,
      message: `${movie.title} added to watchlist.`,
      watchlistItem: newEntry,
    });
  } catch (error) {
    console.error("🔥 Error adding to watchlist:", error.message);

    if (error.code === 11000) {
      // duplicate hai bro
      return res.status(400).json({
        success: false,
        message: "Movie already in watchlist.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
};

// remove the movie from watchlist
const removeMovieFromWatchlist = async (req, res) => {
  try {
    const { id, movieId } = req.params;
    if (req.user.userId !== id) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    const watchListItem = await WatchlistModel.findOne({ userId: id, movieId });
    if (!watchListItem) {
      return res.status(404).json({
        success: false,
        message: "Movie not found in watchlist.",
      });
    }

    await WatchlistModel.deleteOne({ _id: watchListItem._id });

    const movie = await MovieModel.findById(movieId).select("title");
    res.status(200).json({
      success: true,
      message: movie
        ? `${movie.title} removed from watchlist.`
        : "Movie removed from watchlist.",
    });
  } catch (error) {
    console.error("🔥 Error removing from watchlist:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
};

export {
  signup,
  login,
  getUserProfileAndReviews,
  updateUserProfile,
  getUserWatchlist,
  addMovieToWatchlist,
  removeMovieFromWatchlist,
};
