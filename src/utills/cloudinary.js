import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
// import colors from "colors";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) return null;
    //upload the file
    const response = await cloudinary.uploader.upload(localfilePath, {
      resource_type: "auto",
    });
    // console.log("File is uploaded successfully","\n","response: ".underline.blue, response);

    fs.unlinkSync(localfilePath); // remove the locally saved temporary file after successful upload

    return response;
  } catch (error) {
    fs.unlinkSync(localfilePath); // remove the locally saved temporary file as the upload operation got failed
    console.log("File upload failed", error);
    return null;
  }
};

export { uploadOnCloudinary };