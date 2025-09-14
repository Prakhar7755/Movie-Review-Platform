import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { checkRole } from "../middlewares/checkRole.js";
import {
  getAllMovies,
  getMovieById,
  createMovie,
  getMovieReviews,
  addMovieReview,
} from "../controllers/movie.controller.js";

const router = express.Router();

router
  .route("/")
  .get(getAllMovies)
  .post(authenticateToken, checkRole("admin"), createMovie);

router.route("/:id").get(getMovieById);

router
  .route("/:id/reviews")
  .get(getMovieReviews)
  .post(authenticateToken, addMovieReview);

export default router;
