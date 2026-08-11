const { tryOnClothes } = require('../services/perfectCorp/clothesVto.service');
const { AppError } = require('../utils/errorHandler');

const tryOn = async (req, res, next) => {
  try {
    const srcFiles = req.files?.['src_image'];
    const refFiles = req.files?.['ref_image'];
    const { ref_image_url, garment_category, src_file_id, ref_file_id } = req.body || {};

    const srcFile = srcFiles && srcFiles.length > 0 ? srcFiles[0] : null;
    const refFile = refFiles && refFiles.length > 0 ? refFiles[0] : null;

    // A caller can either upload a fresh model photo or reuse a file id returned
    // by a previous task (e.g. the src_file_id/dst_id from skin analysis), which
    // lets them skip re-uploading the same image.
    if (!srcFile && !src_file_id) {
      throw new AppError('Your model/body photo (src_image) or a src_file_id is required.', 400, 'missing_source_image');
    }

    if (!refFile && !ref_file_id && !ref_image_url) {
      throw new AppError('A clothing reference (ref_image, ref_file_id, or ref_image_url) is required.', 400, 'missing_reference_image');
    }

    const category = garment_category || 'full_body';
    if (!['full_body', 'upper_body', 'lower_body'].includes(category)) {
      throw new AppError('garment_category must be one of: full_body, upper_body, lower_body.', 400, 'invalid_garment_category');
    }

    const result = await tryOnClothes({
      srcFile,
      srcFileId: src_file_id,
      refFile,
      refFileId: ref_file_id,
      refFileUrl: ref_image_url,
      garmentCategory: category
    });

    return res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { tryOn };
