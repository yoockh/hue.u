const client = require('./client');
const { getAccessToken } = require('./auth.service');
const { uploadToS3 } = require('../../utils/fileUpload');
const { pollTaskStatus } = require('../../utils/polling');
const env = require('../../config/env');

const ERROR_MESSAGES = {
  error_pose: 'Body pose is not suitable. Please stand upright, facing the camera with your full body clearly visible.',
  error_invalid_ref: 'The clothing reference photo is invalid or its garment category could not be detected.',
  error_invalid_src: 'Your model/body photo is invalid or could not be processed.',
  invalid_parameter: 'Invalid VTO request parameter.',
  error_nsfw_content_detected: 'NSFW content detected in the photo.',
  error_editing_failed: 'Virtual Try-On editing failed. Please try with a different photo.'
};

function getReadableError(code) {
  return ERROR_MESSAGES[code] || `Virtual Try-On processing failed: ${code}`;
}

async function uploadVtoFile(fileBuffer, fileName, mimeType) {
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
    throw new Error('Failed to initialize VTO file upload with Perfect Corp.');
  }

  const fileId = fileEntry.file_id;
  const uploadRequest = fileEntry.requests[0];

  // Upload using presigned URL and exact headers provided by the API
  await uploadToS3(uploadRequest.url, fileBuffer, uploadRequest.headers);
  return fileId;
}

async function tryOnClothes({
  srcFile,        // { buffer, originalname, mimetype } OR undefined
  srcFileId,      // reuse an already-uploaded/processed file id (e.g. a prior dst_id) OR undefined
  refFile,        // { buffer, originalname, mimetype } OR undefined
  refFileId,      // reuse an already-uploaded reference file id OR undefined
  refFileUrl,     // string URL OR undefined
  garmentCategory // "full_body" | "upper_body" | "lower_body"
}) {
  try {
    // 1. Resolve the source (model/body) file id. Reusing an existing upload lets
    //    repeated try-ons on the same photo skip the upload round-trip.
    let resolvedSrcId = srcFileId;
    if (!resolvedSrcId) {
      if (!srcFile || !srcFile.buffer) {
        throw new Error('A source image (file or src_file_id) is required.');
      }
      resolvedSrcId = await uploadVtoFile(
        srcFile.buffer,
        srcFile.originalname,
        srcFile.mimetype
      );
    }

    // 2. Determine reference file id or url, reusing an existing reference upload
    //    when one is provided.
    let resolvedRefId = refFileId;
    if (!resolvedRefId && refFile && refFile.buffer) {
      resolvedRefId = await uploadVtoFile(
        refFile.buffer,
        refFile.originalname,
        refFile.mimetype
      );
    }

    // 3. Create the try-on task
    const taskBody = {
      src_file_id: resolvedSrcId,
      garment_category: garmentCategory
    };

    if (resolvedRefId) {
      taskBody.ref_file_id = resolvedRefId;
    } else if (refFileUrl) {
      taskBody.ref_file_url = refFileUrl;
    } else {
      throw new Error('A clothing reference (file, file id, or URL) is required.');
    }

    const taskResponse = await client.post('/s2s/v2.0/task/cloth-v3', taskBody);

    const taskData = taskResponse.data.data;
    if (!taskData?.task_id) {
      throw new Error('Failed to create Virtual Try-On task.');
    }

    const { task_id: taskId } = taskData;

    // 4. Poll the task status
    const pollUrl = `${env.PERFECTCORP_BASE_URL}/s2s/v2.0/task/cloth-v3/${taskId}`;
    const headers = { 'Authorization': `Bearer ${await getAccessToken()}` };

    // pollTaskStatus returns response.data, so inner task data lives at .data
    const result = await pollTaskStatus(pollUrl, headers);
    const vtoResults = result.data?.results;
    if (!vtoResults?.url) {
      throw new Error('Virtual Try-On result image not found in response.');
    }

    // Echo the reusable source file id (and the API-provided dst_id inside
    // vtoResults) so the caller can chain another task without re-uploading:
    // src_file_id for a different garment on the same body, dst_id (the generated
    // image) as the source of a further edit.
    return {
      ...vtoResults,
      src_file_id: resolvedSrcId
    };
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

module.exports = { tryOnClothes };
