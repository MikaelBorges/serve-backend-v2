const cloudinary = require('cloudinary').v2

cloudinary.config({
  secure: true,
  api_key: process.env.CLOUD_KEY,
  cloud_name: process.env.CLOUD_NAME,
  api_secret: process.env.CLOUD_KEY_SECRET
})

module.exports = cloudinary