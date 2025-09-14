import { Link } from "react-router-dom";

const Navbar = () => {
  // const navigate = useNavigate();
  const userId = localStorage.getItem("userId"); // get logged-in users id from local storage
  const user = JSON.parse(localStorage.getItem("user"));


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <header className="bg-[#0f0e0e] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-[90px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <h1 className="text-2xl font-bold text-white">MovieApp</h1>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-6 text-white">
          <Link
            to="/"
            className="hover:text-blue-500 transition duration-200 font-medium"
          >
            Home
          </Link>
          <Link
            to="/movies"
            className="hover:text-blue-500 transition duration-200 font-medium"
          >
            Movies
          </Link>
          {userId && (
            <Link
              to={`/profile/${userId}`}
              className="hover:text-blue-500 transition duration-200 font-medium"
            >
              Profile
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              to="/admin/add-movie"
              className="hover:text-blue-500 transition duration-200 font-medium"
            >
              Add Movie
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-700 hover:bg-red-400 text-white px-4 py-2 rounded-md font-medium transition duration-200"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
