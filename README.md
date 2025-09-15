# 🎬 Movie Review Platform

A full-stack movie review platform (monorepo) built with **React + Vite (client)** and **Node.js + Express + MongoDB (server)**.
Users can sign up, log in (JWT), browse movies, add reviews, and manage a watchlist. Admins can add movies.

**GitHub:** [https://github.com/Prakhar7755/Movie-Review-Platform.git](https://github.com/Prakhar7755/Movie-Review-Platform.git)

**Live Link:** [https://movie-review-platform-57pl.onrender.com](https://movie-review-platform-57pl.onrender.com)

---

## 📁 Repo layout (monorepo)

```
/
├─ package.json            # root (scripts to build/start both)
├─ client/                 # React app (Vite + Tailwind)
│  ├─ package.json
│  └─ src/...
└─ server/                 # Express API
   ├─ package.json
   └─ src/...
```

---

## 🚀 Quick start (development)

> You can run client and server independently for dev, or in production use the root build/start scripts.

### Prerequisites

* Node.js (v18+ recommended)
* npm or yarn
* MongoDB running locally or a MongoDB Atlas connection string

### 1 — Install dependencies

From project root (recommended to use two terminals):

```bash
# server
cd server
npm install
# or
# yarn

# client
cd ../client
npm install
# or
# yarn
```

### 2 — Run server and client (dev)

Terminal 1 — start server:

```bash
cd server
npm run dev        # nodemon ./app.js
# or `yarn dev`
```

Terminal 2 — start client:

```bash
cd client
npm run dev        # vite
# or `yarn dev`
```

Open the client at the address Vite shows (typically `http://localhost:5173`).

### 3 — Root scripts (production / build)

From repo root:

```bash
# Build both
yarn build

# Start server (assumes server is built or production-ready)
yarn start
```

> Note: root `package.json` uses Yarn commands to install/build both packages (`yarn --cwd server ...`), so use Yarn if running root scripts.

---

## 🔧 Environment variables

### server/.env.sample

```
MONGO_URI="mongodb://localhost:27017/movie-review-platform"
PORT=5001
NODE_ENV=production
CORS_ORIGIN=http://localhost:5173
JWT_SECRET="your-secret"
```

### client/.env.sample

```
# set VITE_MODE to "development" while developing locally
VITE_MODE="development"
# or
# VITE_MODE="production"
```

**Notes**

* `JWT_SECRET` is required; the server throws if missing.
* `CORS_ORIGIN` should match your client URL during development.
* `MONGO_URI` can point to local MongoDB or Atlas.

---

## 🔌 API Documentation

Base URL (development): `http://localhost:5001/api`

### Auth / Users

* `POST /api/users/signup` — Register a new user

  * Body JSON:

    ```json
    {
      "username":"jane",
      "email":"jane@example.com",
      "password":"securepassword",
      "profilePicture":"https://..."
    }
    ```
  * Success response (no token returned):

    ```json
    {
      "success": true,
      "message": "Account created successfully 🎉 Welcome, jane!",
      "user": { "id":"...", "username":"jane", "email":"jane@example.com", "role":"user", "profilePicture": null }
    }
    ```
  * After signup, user should **login** to obtain a JWT.

* `POST /api/users/login` — Login (returns JWT)

  * Body:

    ```json
    { "email":"jane@example.com", "password":"securepassword" }
    ```
  * Success response:

    ```json
    {
      "success": true,
      "message": "User logged in successfully",
      "token": "<JWT>",
      "user": { "id":"...", "username":"jane", "email":"jane@example.com", "role":"user", "profilePicture": null }
    }
    ```

* `GET /api/users/:id` — Get user profile & reviews (protected)

  * Headers: `Authorization: Bearer <JWT>`
  * Returns user (without password) and their reviews (populated with movie details).

* `PUT /api/users/:id` — Update profile (protected)

  * Headers: `Authorization: Bearer <JWT>`
  * Body: any of `{ username, email, profilePicture }`
  * Only allowed if `req.user.userId === :id`.

### Watchlist (protected)

* `GET /api/users/:id/watchlist` — Get user's watchlist
  Headers: `Authorization: Bearer <JWT>`

* `POST /api/users/:id/watchlist` — Add to watchlist
  Body: `{ "movieId": "<movieId>" }`
  Headers: `Authorization: Bearer <JWT>`

* `DELETE /api/users/:id/watchlist/:movieId` — Remove from watchlist
  Headers: `Authorization: Bearer <JWT>`

### Movies

* `GET /api/movies` — Get all movies (supports query params)

  * Query params:

    * `page` (default 1)
    * `limit` (default 10)
    * `genre` (exact match in array)
    * `year` (releaseYear)
    * `title` (case-insensitive regex search)
  * Response:

    ```json
    {
      "success": true,
      "count": 10,
      "total": 42,
      "page": 1,
      "totalPages": 5,
      "movies": [ /* array of movie objects */ ]
    }
    ```

* `GET /api/movies/:id` — Movie details (includes reviews)

  * Returns `{ success: true, movie: {...}, reviews: [...] }`

* `POST /api/movies` — Create movie (**admin-only**)

  * Protected: `Authorization: Bearer <JWT>`
  * Requires admin role (middleware `checkRole("admin")`)
  * Body example:

    ```json
    {
      "title":"New Movie",
      "genre":["Action", "Sci-Fi"],
      "releaseYear":2024,
      "director":"Director Name",
      "cast":["Actor A", "Actor B"],
      "synopsis":"Short synopsis",
      "posterUrl":"https://..."
    }
    ```

### Reviews

* `GET /api/movies/:id/reviews` — Get reviews for movie
* `POST /api/movies/:id/reviews` — Add a review (protected)

  * Body: `{ "rating": 1-5, "reviewText": "..." }`
  * Headers: `Authorization: Bearer <JWT>`
  * Backend prevents duplicate reviews by same user for the same movie; it recalculates the movie averageRating after adding the review.

---

## 🗄️ Database setup

The server uses **Mongoose**. The connection helper (server side) looks like:

```js
// server/src/db/connectDB.js (example)
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/movie-review-platform";
    await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};
export default connectDB;
```

### Seed sample data

You can seed the DB manually (MongoDB Compass / `mongoimport`) or create a small Node seed script under `server/scripts/seed.js`:

```js
// server/scripts/seed.js (example)
import mongoose from "mongoose";
import connectDB from "../src/db/connectDB.js";
import Movie from "../src/models/movie.model.js";

await connectDB();

const movies = [
  { title: "Eternal Horizon", genre: ["Sci-Fi","Adventure"], releaseYear: 2022, director: "Maya Thompson", cast: ["Liam Harris","Sophia Kim"], synopsis:"...", posterUrl:"..." },
  // add more...
];

await Movie.insertMany(movies);
console.log("Seed done");
process.exit(0);
```

Run:

```bash
cd server
node ./scripts/seed.js
```

Or use MongoDB Compass to insert documents into `movies` collection.

---

## 🛡️ Auth & Security notes

* JWT tokens are issued at login and must be sent in `Authorization: Bearer <token>` for protected routes.
* The backend middleware `authenticateToken` looks for the token in:

  * `Authorization` header (Bearer token)
  * cookies (`req.cookies?.token`)
  * request body `req.body.token`
* For production, consider storing tokens in **httpOnly cookies** to mitigate XSS — localStorage is simple but has security tradeoffs.
* Make sure `JWT_SECRET` is kept secret.

---

## ♻️ Frontend details / conventions

* `client/src/lib/axios.js` sets up an axios instance with a request interceptor that automatically attaches the token from `localStorage`:

  ```js
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  ```
* Routes use React Router; protected routes check `localStorage.isLoggedIn === "true"` and `localStorage.user` (parsed).
* Minimal state management uses local state + `localStorage`. This was chosen to keep the project small and deadline-friendly — could be refactored to Context or Redux later.

---

## ⚙️ How the client and server communicate

* Client base URL in dev: `http://localhost:5001/api` (controlled via `VITE_MODE` in `.env`)
* Example: fetching movies:

  ```js
  api.get("/movies?page=1&limit=12");
  ```
* Example: posting a review (JWT attached automatically by interceptor):

  ```js
  api.post(`/movies/${movieId}/reviews`, { rating: 5, reviewText: "Great!" });
  ```

---

## 📝 Additional notes & design decisions

* **Monorepo**: chosen to keep client and server together for easy code management and single repo submission. Root scripts facilitate building/starting both packages.
* **Simplicity for deadline**: used React + Tailwind + local state to deliver functionality quickly. No Redux to reduce setup time.
* **Auth stored in localStorage**: pragmatic choice for speed; consider httpOnly cookies for production.
* **Role-based admin**: `createMovie` is gated with `checkRole("admin")` middleware. Admin UI is behind a protected route: `/admin/add-movie`.
* **Error handling**: backend uses consistent `{ success, message }` patterns; client uses `react-toastify` for user feedback.
* **Extensibility**: easy to plug TMDB API for richer metadata and trailers if desired.
* **CORS**: server expects CORS\_ORIGIN to be set (e.g., `http://localhost:5173`) — adjust if you run client on a different port.

---

## ✅ Checklist for submission

* [x] GitHub repo: `https://github.com/Pr/Movie-Review-Platform.git`
* [x] README with installation, API docs, DB instructions, env vars, notes
* [x] Working front-end (client) and back-end (server)
* [x] Deploy and add live demo link : `https://movie-review-platform-57pl.onrender.com`

---

## 📦 Troubleshooting

* **401 Unauthorized when posting reviews**

  * Ensure you are logged in and token exists in `localStorage.token`.
  * Confirm axios interceptor is adding `Authorization` header.
  * Check `JWT_SECRET` is the same across environments.

* **CORS errors**

  * Ensure `CORS_ORIGIN` matches the client origin or use `*` during local dev (not recommended for production).

* **MongoDB connection issues**

  * Verify `MONGO_URI` and that MongoDB is accessible.
  * Check firewall rules for Atlas.

---

## 📌 Useful commands recap

From `server/`:

* `npm run dev` — dev server (nodemon)
* `npm start` — start server

From `client/`:

* `npm run dev` — start Vite dev server
* `npm run build` — build client for production
* `npm run preview` — preview build

Root:

* `yarn build` — installs/builds both packages
* `yarn start` — start server

---

## License

MIT