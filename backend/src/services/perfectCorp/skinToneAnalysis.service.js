const client = require('./client');
const { uploadToS3 } = require('../../utils/fileUpload');
const { pollTaskStatus } = require('../../utils/polling');
const env = require('../../config/env');

const ERROR_MESSAGES = {
  error_face_position_invalid: 'Wajah tidak terdeteksi atau posisinya tidak pas. Pastikan wajah berada di tengah bingkai.',
  error_face_angle_upward: 'Posisi wajah terlalu mendongak ke atas. Harap ambil foto sejajar mata.',
  error_face_angle_downward: 'Posisi wajah terlalu menunduk ke bawah. Harap ambil foto sejajar mata.',
  error_face_angle_leftward: 'Wajah terlalu menoleh ke kiri. Harap hadapkan wajah lurus ke kamera.',
  error_face_angle_rightward: 'Wajah terlalu menoleh ke kanan. Harap hadapkan wajah lurus ke kamera.',
  error_nsfw_content_detected: 'Konten sensitif/NSFW terdeteksi dalam foto.',
  error_invalid_file: 'File foto rusak atau tidak valid.',
  error_file_size_exceeded: 'Ukuran file foto terlalu besar.'
};

function getReadableError(code) {
  return ERROR_MESSAGES[code] || `Gagal menganalisis foto wajah: ${code}`;
}

async function analyzeSkinTone(fileBuffer, fileName, mimeType) {
  try {
    // 1. Request upload URL and file ID
    const fileResponse = await client.post('/s2s/v2.0/file/skin-tone-analysis', {
      file_name: fileName,
      file_type: mimeType
    });

    const fileData = fileResponse.data.data;
    if (!fileData || !fileData.file_id || !fileData.upload_url) {
      throw new Error('Gagal menginisialisasi upload file ke Perfect Corp.');
    }

    const { file_id: fileId, upload_url: uploadUrl } = fileData;

    // 2. Upload file directly to S3
    await uploadToS3(uploadUrl, fileBuffer, mimeType);

    // 3. Create the skin tone analysis task
    const taskResponse = await client.post('/s2s/v2.0/task/skin-tone-analysis', {
      file_id: fileId
    });

    const taskData = taskResponse.data.data;
    if (!taskData || !taskData.task_id) {
      throw new Error('Gagal membuat task analisis skin tone.');
    }

    const { task_id: taskId } = taskData;

    // 4. Poll the task until it succeeds or fails
    const pollUrl = `${env.PERFECTCORP_BASE_URL}/s2s/v2.0/task/skin-tone-analysis/${taskId}`;
    const headers = { 'Authorization': `Bearer ${env.PERFECTCORP_API_KEY}` };

    const result = await pollTaskStatus(pollUrl, headers);
    
    const results = result.data?.results;
    if (!results || !results.color) {
      throw new Error('Hasil analisis warna kulit tidak ditemukan.');
    }

    return results.color;
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
