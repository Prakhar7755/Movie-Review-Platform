export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (req.user && allowedRoles.includes(req.user.role)) {
        return next();
      }
      return res.status(403).json({ message: "Access denied." });
    } catch (error) {
      res.status(500).json({ message: "Authorization failed", error: error.message });
    }
  };
};
