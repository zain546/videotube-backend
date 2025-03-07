import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!req.user) {
    throw new ApiError(401, "Unauthorized, Please login to continue!");
  }
  if (!content) {
    throw new ApiError(400, "Content is required!");
  }
  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });
  if (!tweet) {
    throw new ApiError(400, "Tweet not created, something went wrong!");
  }
  const populatedTweet = await Tweet.findById(tweet._id).populate(
    "owner",
    "fullName"
  );
  if (!populatedTweet) {
    throw new ApiError(500, "Tweet not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, populatedTweet, "Tweet created successfully!"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }
  const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });
  if (!tweets || tweets.length === 0) {
    throw new ApiError(500, "Tweets are not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched successfully! "));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content in required");
  }
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }
  const userId = req.user?._id;

  const updatedTweet = await Tweet.findOneAndUpdate(
    {
      _id: tweetId,
      owner: userId,
    },
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedTweet) {
    throw new ApiError(500, "Tweet not updated, Something went wrong");
  }
  res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});


const deleteTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    const userId = req.user?._id;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, 'Invalid tweet ID')
    }
    const deletedTweet = await Tweet.findOneAndDelete({
        _id:tweetId,
        owner:userId
    })
    if(!deletedTweet){
        throw new ApiError(400, "Something went wrong while deleting tweet.")
    }
    res
    .status(200)
    .json(new ApiResponse(200,deletedTweet,"Tweet deleted successfully."))
})


export { createTweet, getUserTweets, updateTweet,deleteTweet };
