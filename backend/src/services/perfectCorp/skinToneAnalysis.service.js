const client = require('./client');
const { getAccessToken } = require('./auth.service');
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

async function analyzeSkinTone(fileBuffer, fileName, mimeType, srcFileId) {
  try {
    // 1. Resolve the source file id. When the caller already has a file id from a
    //    previous task (e.g. a dst_id), reuse it and skip the upload round-trip.
    let resolvedSrcId = srcFileId;
    if (!resolvedSrcId) {
      // Request upload URL and file ID
      const fileResponse = await client.post('/s2s/v2.0/file', {
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

      resolvedSrcId = fileEntry.file_id;
      const uploadRequest = fileEntry.requests[0];

      // Upload file directly to S3 using the presigned URL and headers from the API
      await uploadToS3(uploadRequest.url, fileBuffer, uploadRequest.headers);
    }

    // 2. Create the skin tone analysis task
    const taskResponse = await client.post('/s2s/v2.0/task/skin-tone-analysis', {
      src_file_id: resolvedSrcId
    });

    const taskData = taskResponse.data.data;
    if (!taskData?.task_id) {
      throw new Error('Failed to create skin tone analysis task.');
    }

    const { task_id: taskId } = taskData;

    // 4. Poll the task until it succeeds or fails
    const pollUrl = `${env.PERFECTCORP_BASE_URL}/s2s/v2.0/task/skin-tone-analysis/${taskId}`;
    const headers = { 'Authorization': `Bearer ${await getAccessToken()}` };

    // pollTaskStatus returns response.data, so inner task data lives at .data
    const result = await pollTaskStatus(pollUrl, headers);
    const colorResults = result.data?.results?.color;
    if (!colorResults) {
      throw new Error('Skin color analysis results not found in response.');
    }

    // The color-logic step expects three hex strings (skin/hair/eye). If the
    // live API omits one, returns it as null, or nests it differently, the value
    // reaches .replace() downstream as undefined and throws a cryptic
    // "Cannot read properties of undefined (reading 'replace')". Validate here,
    // at the data source, and fail with an actionable message that names the
    // missing field(s) and lists the keys the API actually returned.
    const REQUIRED_COLOR_FIELDS = ['skin_color', 'hair_color', 'eye_color'];
    const missingFields = REQUIRED_COLOR_FIELDS.filter(
      (field) => typeof colorResults[field] !== 'string' || colorResults[field].trim() === ''
    );
    if (missingFields.length > 0) {
      const err = new Error(
        `Skin color analysis response is missing required field(s): ${missingFields.join(', ')}. ` +
        `Fields returned under results.color: [${Object.keys(colorResults).join(', ')}].`
      );
      err.statusCode = 502;
      err.code = 'incomplete_color_analysis';
      throw err;
    }

    // Surface the reusable file ids alongside the color analysis so the same
    // photo can be chained into a follow-up task (e.g. a try-on) without being
    // re-uploaded. dst_id is included when the API returns one.
    return {
      ...colorResults,
      src_file_id: resolvedSrcId,
      dst_id: result.data?.results?.dst_id
    };
  } catch (error) {
    // Errors we've already classified (e.g. the incomplete-response guard above)
    // carry a statusCode — pass them through untouched instead of remapping them
    // to a 400 "readable" upstream error.
    if (error.statusCode) {
      throw error;
    }
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
