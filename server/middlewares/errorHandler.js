const createError = require("http-errors");

const routeNotFoundHandler = (req, res, next) => {
  next(createError(404, "Route not found"));
};

const globalErrorHandler = (err, req, res, next) => {
  console.error("🚨 Error:", err);

  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";

  // for the mongoose schema errors (email, phone)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((error) => error.message)[0];
  }

  // for the mongoose CastErrors (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  res.status(statusCode).json({
    message,
  });
};

module.exports = { routeNotFoundHandler, globalErrorHandler };
