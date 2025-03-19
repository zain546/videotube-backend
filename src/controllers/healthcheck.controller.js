import { asyncHandler } from "../utills/asyncHandler.js";
import { ApiError } from "../utills/ApiError.js";
import {ApiResponse} from "../utills/ApiResponse.js";

const healthCheck = asyncHandler(async (req, res) => {
   try {
     return res
         .status(200)
         .json(new
          ApiResponse(200, "success", "Server is running"));
   } catch (error) {
     throw new ApiError(500, "Healthcheck failed, something went wrong");
   }
});     

export {
    healthCheck
}