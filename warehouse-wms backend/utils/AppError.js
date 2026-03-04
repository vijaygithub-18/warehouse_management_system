/**
 * Custom Error Class
 * Use this in controllers to throw standardized errors
 * Example: throw new AppError("Product not found", 404, "NotFoundError")
 */

class AppError extends Error {
  constructor(message, statusCode = 500, name = "Error", details = null) {
    super(message);
    this.statusCode = statusCode;
    this.name = name;
    this.details = details;
  }
}

module.exports = AppError;
