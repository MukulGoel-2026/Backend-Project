import {v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});     

export const uploadToCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", 
        })
        //file has been uploaded
        console.log("File has been uploded on Cloudinary" , response.url)
        return response; 
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the localy saved temporary file as the upload operation got fail
        return null;
    }
}

export {uploadToCloudinary};