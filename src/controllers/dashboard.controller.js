import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";

const getChannelStats = asyncHandler(async (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user._id) {
        return next(new ApiError(401, "Unauthorized! Log in to continue"));
      }
  
      const userId = req.user._id;
  
      // Fetch all necessary user data in parallel
      const [
        totalSubscribers,
        totalVideos,
        userVideos,
        totalTweets,
        userTweets,
        totalComments,
        userComments
      ] = await Promise.all([
        Subscription.countDocuments({ subscriber: userId }),
        Video.countDocuments({ owner: userId }),
        Video.find({ owner: userId }).distinct("_id"), // Fetch user video IDs
        Tweet.countDocuments({ owner: userId }),
        Tweet.find({ owner: userId }).distinct("_id"), // Fetch user tweet IDs
        Comment.countDocuments({ owner: userId }),
        Comment.find({ owner: userId }).distinct("_id") // Fetch user comment IDs
      ]);
  
      // Fetch likes using previously fetched video, tweet, and comment IDs
      const [totalVideoLikes, totalTweetLikes, totalCommentLikes] = await Promise.all([
        Like.countDocuments({ video: { $in: userVideos } }),
        Like.countDocuments({ tweet: { $in: userTweets } }),
        Like.countDocuments({ comment: { $in: userComments } }) // Corrected key from "Comment" to "comment"
      ]);
  
      // Aggregate total views from all videos owned by the user
      const totalViewsResult = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } },
        { $project: { _id: 0, totalViews: 1 } }
      ]);
  
      const totalViews = totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;
  
      // Send response
      res.status(200).json(
        new ApiResponse(200, {
          totalVideos,
          totalVideoLikes,
          totalSubscribers,
          totalViews,
          totalTweets,
          totalTweetLikes,
          totalComments,
          totalCommentLikes
        }, "Channel stats fetched successfully")
      );
  
    } catch (error) {
      console.error("Error fetching channel stats:", error);
      next(new ApiError(500, "Error fetching channel stats", error));
    }
  });
  
const getChannelVideos = asyncHandler(async (req, res) => {
  //  Get all the videos uploaded by the channel
  const videos = await Video.find({ owner: req.user._id }).lean();
  if(!videos || videos.length === 0){
    return res.status(200).json(new ApiResponse(200, [], "No videos found for this channel"));
  }
  res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
