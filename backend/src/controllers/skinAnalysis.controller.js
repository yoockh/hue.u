const { analyzeSkinTone } = require('../services/perfectCorp/skinToneAnalysis.service');
const { classifyUndertone } = require('../services/colorLogic/undertoneClassifier');
const { calculateContrast } = require('../services/colorLogic/contrastCalculator');
const { mapToSeason } = require('../services/colorLogic/seasonMapper');
const paletteData = require('../services/colorLogic/paletteData');

const analyzeSkin = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Foto wajah wajib diunggah.'
      });
    }

    // 1. Analyze skin using Perfect Corp API
    const colors = await analyzeSkinTone(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // 2. Classify undertone, contrast, and map to season
    const undertone = classifyUndertone(colors.skin_color);
    const contrast = calculateContrast(
      colors.skin_color,
      colors.hair_color,
      colors.eye_color
    );
    const season = mapToSeason(undertone, contrast);
    const recommendations = paletteData[season] || [];

    // 3. Construct and return final response
    return res.status(200).json({
      status: 'success',
      data: {
        analysis: colors,
        classification: {
          undertone,
          contrast,
          season
        },
        recommendations: {
          palette: recommendations
        }
      }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Gagal memproses analisis kulit.',
      code: error.code || 'internal_server_error'
    });
  }
};

module.exports = { analyzeSkin };
