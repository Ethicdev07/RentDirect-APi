const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary'); 

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rentdirect', 
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const imageUploads = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 20 }, 
}).array("image", 10); 

module.exports = { imageUploads };
