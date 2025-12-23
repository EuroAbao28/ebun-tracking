const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// multer setup (sote file in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = { upload, cloudinary };
