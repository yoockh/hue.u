const axios = require('axios');

async function uploadToS3(uploadUrl, fileBuffer, headers) {
  await axios.put(uploadUrl, fileBuffer, {
    headers
  });
}

module.exports = { uploadToS3 };
