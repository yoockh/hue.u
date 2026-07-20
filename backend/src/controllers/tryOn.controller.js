const { tryOnClothes } = require('../services/perfectCorp/clothesVto.service');
const { AppError } = require('../utils/errorHandler');

const tryOn = async (req, res, next) => {
  try {
    const srcFiles = req.files?.['src_image'];
    const refFiles = req.files?.['ref_image'];
    const { ref_image_url, garment_category } = req.body || {};

    if (!srcFiles || srcFiles.length === 0) {
      throw new AppError('Your model/body photo (src_image) is required.', 400, 'missing_source_image');
    }

    const srcFile = srcFiles[0];
    const refFile = refFiles && refFiles.length > 0 ? refFiles[0] : null;

    if (!refFile && !ref_image_url) {
      throw new AppError('A clothing reference (ref_image or ref_image_url) is required.', 400, 'missing_reference_image');
    }

    const category = garment_category || 'full_body';
    if (!['full_body', 'upper_body', 'lower_body'].includes(category)) {
      throw new AppError('garment_category must be one of: full_body, upper_body, lower_body.', 400, 'invalid_garment_category');
    }

    const result = await tryOnClothes({
      srcFile,
      refFile,
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
