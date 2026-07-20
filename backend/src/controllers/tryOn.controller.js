const { tryOnClothes } = require('../services/perfectCorp/clothesVto.service');

const tryOn = async (req, res) => {
  try {
    const srcFiles = req.files?.['src_image'];
    const refFiles = req.files?.['ref_image'];
    const { ref_image_url, garment_category } = req.body;

    if (!srcFiles || srcFiles.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Foto model/tubuh Anda (src_image) wajib diunggah.'
      });
    }

    const srcFile = srcFiles[0];
    const refFile = refFiles && refFiles.length > 0 ? refFiles[0] : null;

    if (!refFile && !ref_image_url) {
      return res.status(400).json({
        status: 'error',
        message: 'Foto referensi baju (ref_image atau ref_image_url) wajib dilampirkan.'
      });
    }

    const category = garment_category || 'full_body';
    if (!['full_body', 'upper_body', 'lower_body'].includes(category)) {
      return res.status(400).json({
        status: 'error',
        message: 'Kategori pakaian (garment_category) harus salah satu dari: full_body, upper_body, lower_body.'
      });
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
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Gagal memproses Virtual Try-On pakaian.',
      code: error.code || 'internal_server_error'
    });
  }
};

module.exports = { tryOn };
