export const handleControllerError = (res, error, contextMessage = "Internal Server Error") => {
  console.error(`🔥 ${contextMessage}:`, error.message);

  return res.status(500).json({
    success: false,
    message: contextMessage,
    ...(process.env.NODE_ENV !== "production" && { error: error.message }),
  });
};
