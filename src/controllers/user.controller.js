import asyncHandler from "../utills/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  // Code to register a user
  res.status(200).json({
    message: "ok",
  });
});

export { registerUser };
