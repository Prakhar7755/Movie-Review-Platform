import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../lib/axios.js";

const AddMovie = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    releaseYear: "",
    director: "",
    cast: "",
    posterUrl: "",
    synopsis: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        genre: formData.genre.split(",").map((g) => g.trim()),
        cast: formData.cast.split(",").map((c) => c.trim()),
        releaseYear: parseInt(formData.releaseYear),
      };

      const res = await api.post("/movies", payload);
      if (res.data.success) {
        toast.success(res.data.message || "Movie added successfully!");
        navigate(`/movie/${res.data.movie._id}`);
      } else {
        toast.error(res.data.message || "Failed to add movie");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error adding movie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Add New Movie</h1>
      <form
        className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          name="title"
          placeholder="Title"
          required
          value={formData.title}
          onChange={handleChange}
          className="p-3 rounded bg-gray-700 text-white focus:outline-none"
        />
        <input
          type="text"
          name="genre"
          placeholder="Genre (comma separated)"
          required
          value={formData.genre}
          onChange={handleChange}
          className="p-3 rounded bg-gray-700 text-white focus:outline-none"
        />
        <input
          type="number"
          name="releaseYear"
          placeholder="Release Year"
          required
          value={formData.releaseYear}
          onChange={handleChange}
          className="p-3 rounded bg-gray-700 text-white focus:outline-none"
        />
        <input
          type="text"
          name="director"
          placeholder="Director"
          value={formData.director}
          onChange={handleChange}
          className="p-3 rounded bg-gray-700 text-white focus:outline-none"
        />
        <input
          type="text"
          name="cast"
          placeholder="Cast (comma separated)"
          value={formData.cast}
          onChange={handleChange}
          className="p-3 rounded bg-gray-700 text-white focus:outline-none"
        />
        <input
          type="text"
          name="posterUrl"
          placeholder="Poster URL"
          value={formData.posterUrl}
          onChange={handleChange}
          className="p-3 rounded bg-gray-700 text-white focus:outline-none"
        />
        <textarea
          name="synopsis"
          placeholder="Synopsis"
          value={formData.synopsis}
          onChange={handleChange}
          rows={4}
          className="p-3 rounded bg-gray-700 text-white focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className={`py-3 rounded bg-blue-600 hover:bg-blue-500 font-semibold transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Adding..." : "Add Movie"}
        </button>
      </form>
    </div>
  );
};

export default AddMovie;
