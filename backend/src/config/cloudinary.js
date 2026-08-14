const cloudinary = require('cloudinary').v2;
const env = require('./env');

// Configure the Cloudinary Node.js SDK from the three standard credential vars
// (cloud_name / api_key / api_secret). `secure: true` returns https:// URLs.
// See https://cloudinary.com/documentation/node_quickstart
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true
});

module.exports = cloudinary;
