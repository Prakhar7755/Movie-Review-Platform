import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../lib/axios.js";

const MovieDetail = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // new state for review form
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await api.get(`/movies/${movieId}`);
        const data = res.data;

        if (data.success) {
          setMovie(data.movie);
          setReviews(data.reviews || []);
        } else {
          toast.error(data.message || "Failed to fetch movie details");
        }
      } catch (err) {
        console.error("Error fetching movie details:", err);
        toast.error("Error loading movie details");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.post(`/movies/${movieId}/reviews`, {
        rating,
        reviewText,
      });

      if (res.data.success) {
        toast.success("Review added!");
        setReviews([res.data.review, ...reviews]); // add new review to list
        setReviewText("");
        setRating(5);
      } else {
        toast.error(res.data.message || "Failed to add review");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-400 mt-10">Loading movie...</p>;
  }

  if (!movie) {
    return <p className="text-center text-red-400 mt-10">Movie not found</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-white">
      {/* Movie header */}
      <div className="flex flex-col md:flex-row items-start gap-6">
        {movie.posterUrl && (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-64 rounded-lg shadow-lg"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
          <p className="text-gray-400 mb-2">
            {movie.releaseYear} • {movie.genre?.join(", ")}
          </p>
          {movie.director && (
            <p className="mb-1">
              <span className="font-semibold">Director:</span> {movie.director}
            </p>
          )}
          {movie.cast?.length > 0 && (
            <p className="mb-2">
              <span className="font-semibold">Cast:</span>{" "}
              {movie.cast.join(", ")}
            </p>
          )}
          <p className="mb-4">{movie.synopsis}</p>
          <p>
            ⭐ <span className="font-semibold">{movie.averageRating}</span> (
            {movie.ratingsCount || reviews.length} ratings)
          </p>
        </div>
      </div>

      {/* Add review form */}
      <div className="mt-10 bg-gray-800 p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Add Your Review</h2>
        <form onSubmit={handleSubmitReview} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block font-medium">Rating (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-20 px-3 py-2 rounded-md text-white"
              required
            />
          </div>
          <div>
            <label className="mb-1 block font-medium">Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 rounded-md text-white"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`bg-blue-700 hover:bg-blue-500 text-white py-2 px-4 rounded-md font-semibold transition ${
              submitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>

      {/* Reviews section */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-400">No reviews yet. Be the first!</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li
                key={review._id}
                className="bg-gray-800 p-4 rounded-lg shadow"
              >
                <div className="flex items-center gap-3 mb-2">
                  {review.userId?.profilePicture && (
                    <img
                      src={review.userId.profilePicture}
                      alt={review.userId.username}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <p className="font-semibold">{review.userId?.username}</p>
                </div>
                <p className="mb-1">⭐ {review.rating}</p>
                <p className="text-gray-300">{review.reviewText}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
