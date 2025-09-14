import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../lib/axios.js";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [rating, setRating] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        ...(search && { title: search }),
        ...(genre && { genre }),
        ...(year && { year }),
      };

      const res = await api.get("/movies", { params });
      const data = res.data;

      if (data.success) {
        let results = data.movies;

        // client-side rating filter since backend doesn’t support it
        if (rating) {
          results = results.filter(
            (m) => m.averageRating >= parseFloat(rating)
          );
        }

        setMovies(results);
        setTotalPages(data.totalPages);
      } else {
        toast.error(data.message || "Failed to fetch movies");
      }
    } catch (err) {
      console.error("Error fetching movies:", err);
      toast.error("Error loading movies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, genre, year, rating]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMovies();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Movies</h1>

      {/* Filters */}
      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <input
          type="text"
          placeholder="Genre (e.g. Action)"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="px-4 py-2 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Min Rating</option>
          <option value="1">⭐ 1+</option>
          <option value="2">⭐ 2+</option>
          <option value="3">⭐ 3+</option>
          <option value="4">⭐ 4+</option>
        </select>

        <button
          type="submit"
          className="col-span-1 sm:col-span-2 md:col-span-4 py-2 bg-blue-700 hover:bg-blue-500 rounded-md text-white font-semibold transition"
        >
          Search / Filter
        </button>
      </form>

      {/* Movie Grid */}
      {loading ? (
        <p className="text-gray-400 text-center">Loading movies...</p>
      ) : movies.length === 0 ? (
        <p className="text-gray-400 text-center">No movies found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <Link
              key={movie._id}
              to={`/movie/${movie._id}`}
              className="bg-gray-800 rounded-lg overflow-hidden shadow hover:scale-105 transition transform"
            >
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-700 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold">{movie.title}</h3>
                <p className="text-sm text-gray-400">
                  {movie.releaseYear} • {movie.genre?.join(", ")}
                </p>
                <p className="mt-1">⭐ {movie.averageRating}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-8 gap-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Movies;
