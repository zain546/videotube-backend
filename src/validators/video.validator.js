import Joi from "joi";

const VideoSchema  =  Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
})


export{
    VideoSchema,
}