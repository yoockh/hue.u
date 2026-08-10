const products = require('../data/products.json');
const { AppError } = require('../utils/errorHandler');

const VALID_SEASONS = ['spring', 'summer', 'autumn', 'winter'];

const getProducts = (req, res, next) => {
  try {
    const { season } = req.query;

    if (!season) {
      return res.status(200).json({ status: 'success', data: products });
    }

    const requestedSeason = season.trim().toLowerCase();

    if (!VALID_SEASONS.includes(requestedSeason)) {
      throw new AppError(
        `Invalid season "${season}". Expected one of: ${VALID_SEASONS.join(', ')}.`,
        400,
        'invalid_season'
      );
    }

    // Products are tagged with the season they belong to, so recommendations are
    // an exact season match rather than a fuzzy substring match on a free-text
    // color name (which let "red" match "tired").
    const filteredProducts = products.filter(
      product => product.season === requestedSeason
    );

    return res.status(200).json({
      status: 'success',
      data: filteredProducts
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to retrieve product catalog.', 500, 'products_fetch_error'));
  }
};

module.exports = {
  getProducts
};
