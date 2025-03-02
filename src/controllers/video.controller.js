import { Video } from "../models/video.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/asyncHandler.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
import { VideoSchema } from "../validators/video.validator.js";
import { deleteLocalFile } from "../utills/deleteLocalFile .js";
import { getVideoDuration } from "../utills/getVideoDuration.js";
import color from "colors";
import { isValidObjectId } from "mongoose";

const publishAVideo = asyncHandler(async (req, res) => {
  // get video, upload to cloudinary, create video
  const { title, description } = req.body;

  const videoFile = req.files?.videoFile;
  const thumbnailFile = req.files?.thumbnail;
  const videoLocalPath = videoFile[0].path;
  const thumbnailLocalPath = thumbnailFile[0].path;
  const duration = await getVideoDuration(videoLocalPath);

  const { error } = VideoSchema.validate(req.body);
  if (error) {
    console.log("Validation error:".underline.red, error);
    deleteLocalFile(videoLocalPath);
    deleteLocalFile(thumbnailLocalPath);
    throw new ApiError(400, error.details[0].message);
  }

  if (!videoFile?.[0]?.path || !thumbnailFile?.[0]?.path) {
    throw new ApiError(400, "Video and thumbnail are required");
  }

  console.log("Uploading video to Cloudinary:".underline.blue, videoLocalPath);
  const videoUrl = await uploadOnCloudinary(videoLocalPath);
  if (!videoUrl || !videoUrl.secure_url) {
    throw new ApiError(500, "Cloudinary Error: Video upload failed");
  }
  console.log("Video uploaded to Cloudinary:.".underline.green, videoUrl);

  console.log(
    "Uploading thumbnail to Cloudinary:".underline.blue,
    thumbnailLocalPath
  );
  const thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnailUrl || !thumbnailUrl.secure_url) {
    throw new ApiError(500, "Cloudinary Error: Thumbnail upload failed");
  }
  console.log(
    "Thumbnail uploaded to Cloudinary:".underline.green,
    thumbnailUrl
  );

  const newVideo = await Video.create({
    title,
    description,
    videoFile: videoUrl.secure_url,
    thumbnail: thumbnailUrl.secure_url,
    duration: duration.toFixed(2),
    isPublished: true,
    owner: req.user?._id,
  });

  if (!newVideo) {
    throw new ApiError(500, "Video not published");
  }
  const publishedVideo = await Video.findById(newVideo._id).populate(
    "owner",
    "fullName email"
  );
  res
    .status(201)
    .json(
      new ApiResponse(201, publishedVideo, "Video published successfully!")
    );
});

// http://localhost:8000/api/v1/videos?page=1&limit=10&query=fun&sortBy=views&sortType=desc
const getAllVideos = asyncHandler(async (req, res) => {
  // get all videos based on query, sort, pagination
  const {
    page = 1, //default page is 1 if not provided
    limit = 10, //default limit is 10
    query = "", //default query is empty string
    sortBy = "createdAt", //default sortBy is createdAt
    sortType = "desc", //default sortType is desc
    userId, // User ID (optional, to filter videos by a specific user)
  } = req.query;

  //checking if user if logged in
  if (!req.user) {
    throw new ApiError(401, "Unauthorized! Log in to continue");
  }

  const match = {};
  if (query) {
    match.title = { $regex: query, $options: "i" };
  }
  if (userId) {
    match.owner = userId;
  }
  //- $regex allows partial matching (e.g., searching "fun" will find "funny video").
  // - $options: "i" makes it case-insensitive (e.g., "FUN" and "fun" are treated the same).

  const videos = await Video.aggregate([
    { $match: match }, // Filtering videos based on the match criteria
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $project: {
        videoFile: 1,
        title: 1,
        description: 1,
        thumbnail: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        updatedAt: 1,
        "owner.fullName": 1,
        "owner.email": 1,
      },
    },
    {
      $sort: {
        [sortBy]: sortType === "desc" ? -1 : 1,
      },
    },
    {
      $skip: (page - 1) * parseInt(limit),
      /*
        $skip: Skipping records for pagination
        - Formula: (page number - 1) * limit
        - If page = 2 and limit = 10, skips (2-1) * 10 = 10 records
      */
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  if (!videos.length) {
    throw new ApiError(404, "No videos found!");
  }

  res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully!"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const video = await Video.findById(videoId).populate(
    "owner",
    "fullName email"
  );
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //update video details like title, description, thumbnail
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const { title, description } = req.body;
  // Validate only provided fields, not forcing all fields
  const updateData = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  // Handle thumbnail update (if a new file is uploaded)
  if (req.file) {
    const thumbnailLocalPath = req.file.path;
    if (!thumbnailLocalPath) {
      throw new ApiError(400, "Thumbnail is missing!");
    }
    const thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnailUrl || !thumbnailUrl.secure_url) {
      throw new ApiError(500, "Cloudinary Error: Thumbnail upload failed");
    }
    updateData.thumbnail = thumbnailUrl.secure_url;
  }

  // Ensure at least one field is updated
  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No data provided for update!");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updateData,
    },
    { new: true, runValidators: true }
  );
  if (!updatedVideo) {
    throw new ApiError(500, "Video not updated");
  }
  res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});



const deleteVideo = asyncHandler(async (req, res) => {
  //TODO: delete video
  const { videoId } = req.params;
  if(!isValidObjectId(videoId)){
    throw new ApiError(400, "Invalid video ID");
  }
  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if(!deletedVideo){
    throw new ApiError(500, "Video not not found");
  }
  res
  .status(200)
  .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));

});

const togglePublishStatus = asyncHandler(async (req, res) => {
  //TODO: toggle publish status
  const { videoId } = req.params;
  if(!isValidObjectId(videoId)){
    throw new ApiError(400, "Invalid video ID");
  }
  const video = await Video.findById(videoId);
  if(!video){
    throw new ApiError(404, "Video not found");
  }
  video.isPublished = !video.isPublished;
  const updatedVideo = await video.save();
  if(!updatedVideo){
    throw new ApiError(500, "Video not updated");
  }
  res
  .status(200)
  .json(new ApiResponse(200, updatedVideo, "Video status updated successfully"));
});


export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
