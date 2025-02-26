import { Video } from "../models/video.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/asyncHandler.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
import { VideoSchema } from "../validators/video.validator.js";
import { deleteLocalFile } from "../utills/deleteLocalFile .js";
import { getVideoDuration } from "../utills/getVideoDuration.js";
import color from "colors";


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
  if( !videoUrl || !videoUrl.secure_url){
    throw new ApiError(500, "Cloudinary Error: Video upload failed");
  }
  console.log("Video uploaded to Cloudinary:.".underline.green, videoUrl);

  console.log("Uploading thumbnail to Cloudinary:".underline.blue, thumbnailLocalPath);
  const thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath);

  if( !thumbnailUrl || !thumbnailUrl.secure_url){
    throw new ApiError(500, "Cloudinary Error: Thumbnail upload failed");
  }
  console.log("Thumbnail uploaded to Cloudinary:".underline.green, thumbnailUrl);

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
 const publishedVideo =  await Video.findById(newVideo._id).populate("owner", "fullName email");
  res
    .status(201)
    .json(new ApiResponse(201, publishedVideo, "Video published successfully!"));
});





const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { error } = VideoSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }
  const { title, description } = req.body;
  const thumbnail = req.files?.thumbnail;
  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail is required");
  }
  const thumbnailUrl = await uploadOnCloudinary(thumbnail);
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: { title, description, thumbnail: thumbnailUrl.secure_url },
    },
    { new: true }
  );
  if (!updatedVideo) {
    throw new ApiError(500, "Video not updated");
  }
  res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle publish status
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};