const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); // Ensure Cloudinary is configured

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rentdirect', // Cloudinary folder name
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const imageUploads = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 20 }, // 20MB limit per file
}).array("image", 10); // Allow up to 10 images

module.exports = { imageUploads };
