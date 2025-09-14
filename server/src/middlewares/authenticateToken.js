import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required but not set.");
}
const jwtSecret = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  // Look for token in Authorization header, cookies, or body
  const authHeader = req.get("Authorization");
  const tokenFromHeader = authHeader && authHeader.split(" ")[1];
  const tokenFromCookie = req.cookies?.token;
  const tokenFromBody = req.body?.token;

  // Pick the token from the first available source
  const token = tokenFromHeader || tokenFromCookie || tokenFromBody;


  if (!token) {
    return res.sendStatus(401); // Unauthorized - token missing
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.error("❌ JWT verification error:", err.message);
      return res.sendStatus(403); 
    }
    req.user = user;
    next();
  });
};

export { authenticateToken };
