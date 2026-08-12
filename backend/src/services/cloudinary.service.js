const cloudinary = require('../config/cloudinary');

// All scan photos go into one tidy folder so they're easy to manage/prune from
// the Cloudinary dashboard.
const SCAN_FOLDER = 'hue-u/scan-history';

// Upload an in-memory image buffer (from multer) to Cloudinary and resolve its
// permanent secure (https) URL. Uses upload_stream so we never write to disk or
// base64-inflate the payload.
function uploadScanPhoto(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: SCAN_FOLDER, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        if (!result || !result.secure_url) {
          return reject(new Error('Cloudinary upload returned no URL.'));
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

module.exports = { uploadScanPhoto };
