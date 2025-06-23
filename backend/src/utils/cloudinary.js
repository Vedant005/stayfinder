import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  console.log(localFilePath);

  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(response);

    console.log("File is uploaded on Cloudinary", response.url);

    // fs.unlinkSync(localFilePath);
    // return response;
    fs.unlink(localFilePath, (err) => {
      if (err) console.error("Error deleting temp file:", err.message);
      else console.log("Temp file deleted:", localFilePath);
    });

    return response;
  } catch (error) {
    console.log(error);

    // fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the uploas operation got failed
    // return null;

    fs.unlink(localFilePath, (err) => {
      if (err) console.error("Error deleting failed upload file:", err.message);
    });
    return null;
  }
};

export { uploadOnCloudinary };
