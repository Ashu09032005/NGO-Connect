// cloudinary/index.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ✅ Better: load from environment variables
cloudinary.config({
  cloud_name: 'dhhyqzxnr',
  api_key: '452815548421777',
  api_secret: '5DflwnPZWeZbZ1h3XQ18MQkVOIs'
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ngo_images',
    allowed_formats: ['jpg', 'png', 'jpeg']
  }
});

module.exports = {
  cloudinary,
  storage
};
