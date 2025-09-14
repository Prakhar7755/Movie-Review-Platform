import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../lib/axios";

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    profilePicture: "",
  });

  // fetch profile and reviews
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setUser(res.data.user);
          setReviews(res.data.reviews);
          setForm({
            username: res.data.user.username,
            email: res.data.user.email,
            profilePicture: res.data.user.profilePicture || "",
          });
        } else {
          toast.error(res.data.message || "Failed to fetch profile");
        }
      } catch (err) {
        toast.error(err.message || "Error fetching profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  // update profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await api.put(`/users/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setUser(res.data.user);
        toast.success("Profile updated successfully");
        setEditMode(false);
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (err) {
      toast.error(err.message || "Error updating profile");
    }
  };

  if (loading) return <p className="text-center text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-6">
          <img
            src={user?.profilePicture || "https://via.placeholder.com/150"}
            alt="profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
          />
          <div className="flex-1">
            {editMode ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded bg-gray-700"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 rounded bg-gray-700"
                />
                <input
                  type="text"
                  placeholder="Profile Picture URL"
                  value={form.profilePicture}
                  onChange={(e) =>
                    setForm({ ...form, profilePicture: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded bg-gray-700"
                />
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{user?.username}</h1>
                <p className="text-gray-300">{user?.email}</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-3 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">My Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-400">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-gray-800 p-4 rounded-lg shadow-md"
                >
                  <h3 className="text-lg font-bold">{review.movieId.title}</h3>
                  <p className="text-sm text-gray-400">
                    Rating: ⭐ {review.rating}
                  </p>
                  <p className="mt-2">{review.reviewText}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
