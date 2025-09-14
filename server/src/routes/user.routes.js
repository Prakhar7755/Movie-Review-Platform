import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import {
  signup,
  login,
  getUserProfileAndReviews,
  updateUserProfile,
  getUserWatchlist,
  addMovieToWatchlist,
  removeMovieFromWatchlist,
} from "../controllers/user.controller.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// protected user profile routes
router
  .route("/:id")
  .get(authenticateToken, getUserProfileAndReviews)
  .put(authenticateToken, updateUserProfile);

// Watchlist routes
router
  .route("/:id/watchlist")
  .get(authenticateToken, getUserWatchlist)
  .post(authenticateToken, addMovieToWatchlist);

router
  .route("/:id/watchlist/:movieId")
  .delete(authenticateToken, removeMovieFromWatchlist);


export default router;
