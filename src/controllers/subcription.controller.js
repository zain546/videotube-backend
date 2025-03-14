import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id;

  // Validate channelId format
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  // Prevent subscribing to own channel
  if (subscriberId.toString() === channelId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  // Check if channel exists
  const channelExists = await User.findById(channelId).lean();
  if (!channelExists) {
    throw new ApiError(404, "Channel not found");
  }

  // Check if subscription exists
  const existingSubscription = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  }).lean();

  if (existingSubscription) {
    await Subscription.deleteOne({ _id: existingSubscription._id });
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Unsubscribed successfully"));
  }

  // Create new subscription
  const newSubscription = await Subscription.create({
    subscriber: subscriberId,
    channel: channelId,
  });

  // Populate subscriber & channel details
  const populatedSubscription = await Subscription.findById(newSubscription._id)
    .populate("subscriber", "fullName email")
    .populate("channel", "fullName email")
    .lean();

  res
    .status(200)
    .json(
      new ApiResponse(200, populatedSubscription, "Subscribed successfully")
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const channelId = req.user?._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }
  const subcribers = await Subscription.find({
    channel: channelId,
  })
    .populate("subscriber", "fullName email")
    .lean();
  if (subcribers.length == 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No subscribers found for this channel"));
  }
  res
    .status(200)
    .json(new ApiResponse(200, subcribers, "Subscribers fetched successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscriberId = req.user?._id;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const subscribedChannels = await Subscription.find({
    subscriber: subscriberId,
  })
    .populate("channel", "_id name email")
    .populate("subscriber", "fullName")
    .lean();

  if (subscribedChannels.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No subscribed channels found"));
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
