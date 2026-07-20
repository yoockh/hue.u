const client = require('./client');
const { uploadToS3 } = require('../../utils/fileUpload');
const { pollTaskStatus } = require('../../utils/polling');
const env = require('../../config/env');

const ERROR_MESSAGES = {
  error_pose: 'Pose tubuh kurang sesuai. Harap berdiri tegak menghadap kamera dengan posisi tubuh penuh terlihat jelas.',
  error_invalid_ref: 'Foto baju referensi tidak valid atau tidak terdeteksi kategori pakaiannya.',
  error_invalid_src: 'Foto model/tubuh Anda tidak valid atau sulit diproses.',
  invalid_parameter: 'Parameter request VTO tidak valid.',
  error_nsfw_content_detected: 'Konten sensitif/NSFW terdeteksi dalam foto.',
  error_editing_failed: 'Gagal melakukan editing Virtual Try-On. Silakan coba foto lain.'
};

function getReadableError(code) {
  return ERROR_MESSAGES[code] || `Gagal memproses Virtual Try-On: ${code}`;
}

async function uploadVtoFile(fileBuffer, fileName, mimeType) {
  const fileResponse = await client.post('/s2s/v2.0/file/cloth-v3', {
    file_name: fileName,
    file_type: mimeType
  });

  const fileData = fileResponse.data.data;
  if (!fileData || !fileData.file_id || !fileData.upload_url) {
    throw new Error('Gagal menginisialisasi upload file VTO ke Perfect Corp.');
  }

  const { file_id: fileId, upload_url: uploadUrl } = fileData;
  await uploadToS3(uploadUrl, fileBuffer, mimeType);
  return fileId;
}

async function tryOnClothes({
  srcFile,       // { buffer, originalname, mimetype }
  refFile,       // { buffer, originalname, mimetype } OR undefined
  refFileUrl,    // string URL OR undefined
  garmentCategory // "full_body" | "upper_body" | "lower_body"
}) {
  try {
    // 1. Upload model/source image
    const srcFileId = await uploadVtoFile(
      srcFile.buffer,
      srcFile.originalname,
      srcFile.mimetype
    );

    // 2. Determine reference file id or url
    let refFileId;
    if (refFile && refFile.buffer) {
      refFileId = await uploadVtoFile(
        refFile.buffer,
        refFile.originalname,
        refFile.mimetype
      );
    }

    // 3. Create the try-on task
    const taskBody = {
      garment_category: garmentCategory
    };

    if (srcFileId) {
      taskBody.src_file_id = srcFileId;
    }
    
    if (refFileId) {
      taskBody.ref_file_id = refFileId;
    } else if (refFileUrl) {
      taskBody.ref_file_url = refFileUrl;
    } else {
      throw new Error('Foto referensi baju (file atau URL) wajib dilampirkan.');
    }

    const taskResponse = await client.post('/s2s/v2.0/task/cloth-v3', taskBody);

    const taskData = taskResponse.data.data;
    if (!taskData || !taskData.task_id) {
      throw new Error('Gagal membuat task Virtual Try-On.');
    }

    const { task_id: taskId } = taskData;

    // 4. Poll the task status
    const pollUrl = `${env.PERFECTCORP_BASE_URL}/s2s/v2.0/task/cloth-v3/${taskId}`;
    const headers = { 'Authorization': `Bearer ${env.PERFECTCORP_API_KEY}` };

    const result = await pollTaskStatus(pollUrl, headers);

    const results = result.data?.results;
    if (!results || !results.image_url) {
      throw new Error('Hasil gambar Virtual Try-On tidak ditemukan.');
    }

    return results;
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
