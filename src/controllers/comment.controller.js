import { asyncHandler } from "../utills/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import mongoose,{ isValidObjectId } from "mongoose";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";


const addComment = asyncHandler(async(req, res) => {
    const {videoId} = req.params;
    const {content} = req.body;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }
    if(!content){
        throw new ApiError(400, "Content is required");
    }
    if(!req.user){
        throw new ApiError(401, "Unauthorized, log in to continue");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    });
    if(!comment){
        throw new ApiError(500, "Something went wrong while creating comment");
    }
    const populatedComment = await Comment.findById(comment._id)
    .populate(
        "owner",
        "fullName email"
    )
    .populate(
        "video",
        "title"
    );
    res
    .status(201)
    .json(new ApiResponse(201, populatedComment, "Comment created successfully"));
})


const getVideoComments = asyncHandler(async(req, res) => {
    const {videoId} = req.params;
    const {page=1, limit=10} = req.query;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }


    //mongodb stores video id as string, so we need to convert it to object id
    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    const comments = await Comment.aggregate([
        {
            $match: {
                video: videoObjectId
            }
        },
        {
            $lookup: {
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"CommentOnWhichVideo"
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"commentedBy"
            }
        },
        {
            $unwind:"$CommentOnWhichVideo"
        },
        {
            $unwind:"$commentedBy"
        },
        {
            $project: {
                content:1,
                createdAt:1,
                updatedAt:1,   
                "commentedBy.fullName":1,
                "commentedBy.email":1,
                "CommentOnWhichVideo.title":1,
                // "CommentOnWhichVideo.description":1,
                // "CommentOnWhichVideo.thumbnail":1,
            }
        },
        {
            $sort: {
                createdAt:-1 //sort comments in descending order
            }
        },
        {
            $skip: (page-1)*parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    ]);
    if(!comments?.length===0){
        throw new ApiError(404, "No comments found");
    }
    res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));

});

const updateComment = asyncHandler(async(req, res) => {
    const {commentId} = req.params;
    const {content} = req.body; 
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID");    
    }
    if(!content){
        throw new ApiError(400, "Content is required");
    }
    if(!req.user){
        throw new ApiError (401, "Unauthorized, log in to continue");
    }
    const updatedComment = await Comment.findByIdAndUpdate(
    {
        _id: commentId,
        owner: req.user._id
    },
    {
        $set: {
            content
        }
    },
    {
        new: true
    }   

    )
    if(!updatedComment){
        throw new ApiError(500, "Something went wrong while updating comment");
    }
    res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});


const deleteComment = asyncHandler(async(req, res) => {
   const {commentId} = req.params;
   if(!isValidObjectId(commentId)){
    throw new ApiError(400, "Invalid comment Id")
   }
   if(!req.user){
    throw new ApiError(401, "Unauthorized, please login to continue.")
   }
   const deletedComment = await Comment.findOneAndDelete({
       _id: commentId,
       owner: req.user._id
   }
   
   
);
   if(!deletedComment){
    throw new ApiError(500, "Comment not deleted, something went wrong.")
   }
   res
   .status(200)
   .json(new ApiResponse(200,deletedComment, "Comment deleted successfully."))
})


export {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment
};