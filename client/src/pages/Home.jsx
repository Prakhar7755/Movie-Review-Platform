import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axios.js";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch latest movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get("/movies?limit=10&page=1"); // latest 10 movies
        if (res.data.success) {
          setMovies(res.data.movies);
        }
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero / Featured Section */}
      <section className="relative bg-gray-800 h-96 flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Welcome to MovieApp
          </h1>
          <p className="text-gray-300 mb-6">
            Discover trending movies, reviews, and more.
          </p>
          <Link
            to="/movies"
            className="px-6 py-3 bg-blue-700 hover:bg-blue-500 rounded-md font-medium transition duration-200"
          >
            Browse All Movies
          </Link>
        </div>
      </section>

      {/* Trending / Latest Movies */}
      <section className="max-w-7xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-semibold mb-6">Latest Movies</h2>
        {loading ? (
          <p>Loading movies...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <Link
                to={`/movie/${movie._id}`}
                key={movie._id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transform transition duration-200"
              >
                <img
                  src={movie.posterUrl || "/placeholder.png"}
                  alt={movie.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3">
                  <h3 className="font-semibold">{movie.title}</h3>
                  <p className="text-gray-400 text-sm">
                    {movie.releaseYear} | {movie.genre.join(", ")}
                  </p>
                  <p className="text-yellow-400 mt-1">
                    ⭐ {movie.averageRating || "N/A"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
