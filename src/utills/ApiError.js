// Define a custom error class named ApiError that extends the built-in Error class
class ApiError extends Error {
  constructor(
    statusCode, // HTTP status code (e.g., 400 for Bad Request, 500 for Internal Server Error)
    message = "Something went wrong", // Default error message if none is provided
    errors = [], // Array to hold specific validation or error details
    stack = "" // Stack trace, useful for debugging
  ) {
    super(message); // Call the parent Error class constructor and set the error message

    this.statusCode = statusCode; // Store the HTTP status code
    this.data = null; // Can be used to hold additional data, default is null
    this.message = message; // Store the error message
    this.success = false; // A flag indicating failure (useful for API responses)
    this.errors = errors; // Store additional error details if provided

    // If a stack trace is provided, use it; otherwise, generate one automatically
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export {ApiError}; // Export the class to be used in other parts of the application
