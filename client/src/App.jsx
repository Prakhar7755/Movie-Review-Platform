import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import NoPage from "./pages/NoPage.jsx";
import Profile from "./pages/Profile.jsx";
import MovieDetail from "./pages/MovieDetail.jsx";
import Movies from "./pages/Movies.jsx";
import AddMovie from "./pages/AddMovie.jsx";
import { useEffect, useState } from "react";

const App = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={isLoggedIn ? <Home /> : <Navigate to="/login" />}
      />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route
        path="/profile/:id"
        element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
      />
      <Route
        path="/movies/"
        element={isLoggedIn ? <Movies /> : <Navigate to="/login" />}
      />
      <Route
        path="/movie/:movieId"
        element={isLoggedIn ? <MovieDetail /> : <Navigate to="/login" />}
      />

      <Route
        path="/admin/add-movie"
        element={
          isLoggedIn && user.role === "admin" ? (
            <AddMovie />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route path="*" element={<NoPage />} />
    </Routes>
  );
};

export default App;
