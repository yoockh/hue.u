const { analyzeSkinTone } = require('../services/perfectCorp/skinToneAnalysis.service');
const { classifyUndertone } = require('../services/colorLogic/undertoneClassifier');
const { calculateContrast } = require('../services/colorLogic/contrastCalculator');
const { mapToSeason } = require('../services/colorLogic/seasonMapper');
const { buildExplanation } = require('../services/colorLogic/explanationBuilder');
const paletteData = require('../services/colorLogic/paletteData');
const { saveScan } = require('../services/firestore.service');
const { AppError } = require('../utils/errorHandler');

const analyzeSkin = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('A face photo is required.', 400, 'missing_file');
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
    const explanation = buildExplanation(season, undertone, contrast);

    const responseData = {
      analysis: colors,
      classification: {
        undertone,
        contrast,
        season
      },
      recommendations: {
        palette: recommendations,
        explanation
      }
    };

    // 3. Persist to scan history (best-effort). Fire-and-forget so a Firestore
    //    outage never blocks or fails the analysis the user came for — just log.
    saveScan(responseData).catch((err) => {
      console.error('Failed to save scan history to Firestore:', err.message);
    });

    // 4. Return the analysis
    return res.status(200).json({
      status: 'success',
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeSkin };
