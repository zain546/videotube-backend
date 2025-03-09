import { isValidObjectId } from "mongoose";
import {asyncHandler} from "../utills/asyncHandler.js";
import { ApiError} from "../utills/ApiError.js";
import { ApiResponse} from "../utills/ApiResponse.js";
import {Like} from "../models/like.model.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID");
    }
  
    const existingLike = await Like.findOne({
      video: videoId,
      likedBy: userId,
    });
    if (existingLike) {
      await Like.findByIdAndDelete({ _id: existingLike._id });
      return res
        .status(200)
        .json(new ApiResponse(200, existingLike, "Video unliked"));
    }
    const newLike = await Like.create({
      video: videoId,
      likedBy: userId,
    });
    if(!newLike){
        throw new ApiError(500,"Error in liking video.")
    }
    const populatedLike = await Like.findById(newLike._id).populate(
      "likedBy",
      "fullName"
    );
    return res
      .status(200)
      .json(new ApiResponse(200, populatedLike, "Video liked."));
  });


const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId} = req.params;
    const userId =  req.user?._id;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }
    const existingLike = await Like.findOne({
        comment:commentId,
        likedBy:userId
    });
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
    
        return res
          .status(200)
          .json(new ApiResponse(200, existingLike, "Comment unliked successfully"));
      }
    const newLike = await Like.create({
        comment:commentId,
        likedBy:userId
    })
    if(!newLike){
        throw new ApiError(500,"Error in liking comment.")
    }
 const populatedLike = await Like.findById(newLike._id).populate(
      "likedBy",
      "fullName"
    );
    return res
      .status(200)
      .json(new ApiResponse(200, populatedLike, "Comment liked successfully"));
});


const toggleTweetLike = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    const userId = req.user?._id;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet ID.")
    }

    const existingLike = await Like.findOne({
        tweet:tweetId,
        likedBy:userId
    });
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200,existingLike,"Tweet unliked.")
    }
    const newLike = await Like.create({
        tweet: tweetId,
        likedBy:userId
    })
    if(!newLike){
        throw new ApiError(500,"Error in liking tweet.")
    }
    const populatedLike = await Like.findById(newLike._id).populate("likedBy","fullName");
    res
    .status(200)
    .json(new ApiResponse(200, populatedLike, "Tweet liked."))
});


const getLikedVideos = asyncHandler(async(req,res)=>{
const userId = req.user?._id;
const likedVideos = await Like.find({
    likedBy:userId,
    video:{$exists:true}
}).populate("video", "title videoFile")
  /*
      What does `$exists: true` do?
      - This ensures that the `video` field is present in the document.
      - Why? Because the `Like` collection stores likes for multiple entities (e.g., tweets or comments).
      - Without this check, we might accidentally return likes for comments and tweets instead of videos.
    */
    if(!likedVideos){
        throw new ApiError(500,"Error in getting liked videos")
    }
    res
    .status(200)
    .json(new ApiResponse(200,likedVideos,"Liked videos fetched successfully."))
});

export{
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}