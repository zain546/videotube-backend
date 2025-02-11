// Utility class for sending consistent API responses
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode; // HTTP status code (e.g., 200, 201, 400, 500)
    this.data = data; // Data payload (e.g., fetched records, success messages)
    this.message = message; // Custom response message (defaults to "Success")
    this.success = statusCode < 400; // Determines success based on status code (true for 2xx, false for 4xx/5xx)
  }
}

export default ApiResponse; // Export the class for use in API responses
// Utility class for generating custom error objects
