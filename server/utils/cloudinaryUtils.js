const { upload } = require("../middlewares/multerCloudinary");

const cloudinary = require("cloudinary").v2;

// upload image to cloudinary
const uploadImageToCloudinary = async (fileBuffer, folderDirectory) => {
  return new Promise((resolve, reject) => {
    // (1) create the stream (cloudinary is waiting for the data)
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderDirectory,
        resource_type: "image",
      },
      (error, result) => {
        // (3) tatakbo tong callback pag natapos na iprocess and pag upload sa cloudinary
        if (error) {
          console.log("Cloudinary upload error:", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // (2) send the image data to the cloudinary
    stream.end(fileBuffer);
  });
};

module.exports = { uploadImageToCloudinary };
