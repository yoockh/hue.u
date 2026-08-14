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

    // 2. Classify undertone, contrast, and map to season.
    // Undertone is derived from skin_color alone (always present). Contrast is a
    // lightness spread, so build it from whatever features the API returned:
    // hair when it's there, otherwise the remaining defined features (eyes,
    // eyebrows, lips) still give a meaningful spread. This is what lets a hijab /
    // head-covering photo — which never includes hair_color — classify normally.
    const undertone = classifyUndertone(colors.skin_color);

    const contrastFeatures = [colors.skin_color, colors.eye_color];
    if (colors.hair_color) {
      contrastFeatures.push(colors.hair_color);
    } else {
      contrastFeatures.push(colors.eyebrow_color, colors.lip_color);
    }
    const contrast = calculateContrast(...contrastFeatures);

    const season = mapToSeason(undertone, contrast);
    const recommendations = paletteData[season] || [];
    const explanation = buildExplanation(season, undertone, contrast, {
      hairVisible: Boolean(colors.hair_color)
    });

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
