import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

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
    const result = await cloudinary.uploader.upload(filePath, {
      recource_type: "auto",
    });
    console.log("File is uploaded successfully", result.URL);
    return result;
  } catch (error) {
    fs.unlinkSync(localfilePath); // remove the locally saved temporary file as the upload operation got failed
    console.log("File upload failed", error);
    return null;
  }
};

export { uploadOnCloudinary };