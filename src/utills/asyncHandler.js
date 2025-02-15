// Utility function to handle async errors in Express route handlers
const asyncHandler = (requestHandler) => {
  return (req, res, next) =>
    Promise.resolve(requestHandler(req, res, next)) // Ensure requestHandler resolves correctly
      .catch((err) => {
        next(err);
      }); // Pass errors to Express error handling middleware
};

export default asyncHandler;
