const client = require('./client');
const { uploadToS3 } = require('../../utils/fileUpload');
const { pollTaskStatus } = require('../../utils/polling');
const env = require('../../config/env');

const ERROR_MESSAGES = {
  error_face_position_invalid: 'Face not detected or position is invalid. Please ensure your face is centered in the frame.',
  error_face_angle_upward: 'Face is tilted too far upward. Please take the photo at eye level.',
  error_face_angle_downward: 'Face is tilted too far downward. Please take the photo at eye level.',
  error_face_angle_leftward: 'Face is turned too far to the left. Please face the camera straight on.',
  error_face_angle_rightward: 'Face is turned too far to the right. Please face the camera straight on.',
  error_nsfw_content_detected: 'NSFW content detected in the photo.',
  error_invalid_file: 'The photo file is corrupted or invalid.',
  error_file_size_exceeded: 'The photo file size is too large.'
};

function getReadableError(code) {
  return ERROR_MESSAGES[code] || `Failed to analyze face photo: ${code}`;
}

async function analyzeSkinTone(fileBuffer, fileName, mimeType) {
  try {
    // 1. Request upload URL and file ID
    const fileResponse = await client.post('/s2s/v2.0/file/skin-tone-analysis', {
      files: [
        {
          content_type: mimeType,
          file_name: fileName,
          file_size: fileBuffer.length
        }
      ]
    });

    const fileData = fileResponse.data.data;
    const fileEntry = fileData?.files?.[0];
    if (!fileEntry?.file_id || !fileEntry?.requests?.[0]?.url) {
      throw new Error('Failed to initialize file upload with Perfect Corp.');
    }

    const fileId = fileEntry.file_id;
    const uploadRequest = fileEntry.requests[0];

    // 2. Upload file directly to S3 using the presigned URL and headers from the API
    await uploadToS3(uploadRequest.url, fileBuffer, uploadRequest.headers);

    // 3. Create the skin tone analysis task
    const taskResponse = await client.post('/s2s/v2.0/task/skin-tone-analysis', {
      src_file_id: fileId
    });

    const taskData = taskResponse.data.data;
    if (!taskData?.task_id) {
      throw new Error('Failed to create skin tone analysis task.');
    }

    const { task_id: taskId } = taskData;

    // 4. Poll the task until it succeeds or fails
    const pollUrl = `${env.PERFECTCORP_BASE_URL}/s2s/v2.0/task/skin-tone-analysis/${taskId}`;
    const headers = { 'Authorization': `Bearer ${env.PERFECTCORP_API_KEY}` };

    // pollTaskStatus returns response.data, so inner task data lives at .data
    const result = await pollTaskStatus(pollUrl, headers);
    const colorResults = result.data?.results?.color;
    if (!colorResults) {
      throw new Error('Skin color analysis results not found in response.');
    }

    return colorResults;
  } catch (error) {
    if (error.code) {
      const readableMessage = getReadableError(error.code);
      const newErr = new Error(readableMessage);
      newErr.statusCode = 400;
      newErr.code = error.code;
      throw newErr;
    }
    throw error;
  }
}

module.exports = { analyzeSkinTone };
