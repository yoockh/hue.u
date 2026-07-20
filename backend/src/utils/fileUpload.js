const axios = require('axios');

async function uploadToS3(uploadUrl, fileBuffer, mimeType) {
  await axios.put(uploadUrl, fileBuffer, {
    headers: {
      'Content-Type': mimeType
    }
  });
}

module.exports = { uploadToS3 };
