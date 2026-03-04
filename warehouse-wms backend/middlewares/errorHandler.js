/**
 * Global Error Handling Middleware
 * Catches all errors from routes and controllers
 * Returns standardized error responses
 */

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details = err.details || null;

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    details = err.details;
  } else if (err.name === "AuthenticationError") {
    statusCode = 401;
    message = "Authentication Failed";
  } else if (err.name === "AuthorizationError") {
    statusCode = 403;
    message = "Not Authorized";
  } else if (err.name === "NotFoundError") {
    statusCode = 404;
    message = "Resource Not Found";
  } else if (err.name === "ConflictError") {
    statusCode = 409;
    message = "Conflict";
  }

  // Handle PostgreSQL errors
  if (err.code === "23505") {
    // Duplicate key
    statusCode = 409;
    message = "Record already exists";
  } else if (err.code === "23503") {
    // Foreign key violation
    statusCode = 400;
    message = "Invalid reference";
  }

  // Send standardized error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
