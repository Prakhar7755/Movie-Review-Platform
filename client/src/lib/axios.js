import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_MODE === "development"
    ? `http://localhost:5001/api/`
    : "/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// add auth token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
