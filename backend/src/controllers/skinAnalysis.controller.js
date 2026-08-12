const { analyzeSkinTone } = require('../services/perfectCorp/skinToneAnalysis.service');
const { classifyUndertone } = require('../services/colorLogic/undertoneClassifier');
const { calculateContrast } = require('../services/colorLogic/contrastCalculator');
const { mapToSeason } = require('../services/colorLogic/seasonMapper');
const { buildExplanation } = require('../services/colorLogic/explanationBuilder');
const paletteData = require('../services/colorLogic/paletteData');
const { saveScan } = require('../services/firestore.service');
const { uploadScanPhoto } = require('../services/cloudinary.service');
const { AppError } = require('../utils/errorHandler');

const analyzeSkin = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('A face photo is required.', 400, 'missing_file');
    }

    // Kick off the Cloudinary upload in parallel with the PerfectCorp analysis so
    // the two independent network calls overlap. It must never fail the request,
    // so swallow any error into a null URL (the scan is just saved without a photo).
    const photoUrlPromise = uploadScanPhoto(req.file.buffer).catch((err) => {
      console.error('Cloudinary upload failed; scan photo will not be stored:', err.message);
      return null;
    });

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

    // 3. Persist to scan history once the photo URL is ready (best-effort, after
    //    the response). Fire-and-forget so neither the Cloudinary upload nor a
    //    Firestore outage ever blocks or fails the analysis the user came for.
    photoUrlPromise.then((photoUrl) => {
      saveScan(responseData, photoUrl).catch((err) => {
        console.error('Failed to save scan history to Firestore:', err.message);
      });
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
