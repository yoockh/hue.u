const products = require('../data/products.json');
const { AppError } = require('../utils/errorHandler');
const { getMatchRating } = require('../services/colorLogic/seasonCompatibility');

const VALID_SEASONS = ['spring', 'summer', 'autumn', 'winter'];

// Sort order for match ratings: good first, then fair, then poor.
const RATING_RANK = { good: 0, fair: 1, poor: 2 };

// Validate and normalize a season from the query string, throwing a 400 AppError
// when it is missing or not one of the four seasons.
const normalizeSeason = (season) => {
  if (!season) {
    throw new AppError(
      `Missing required "season" query parameter. Expected one of: ${VALID_SEASONS.join(', ')}.`,
      400,
      'missing_season'
    );
  }

  const normalized = season.trim().toLowerCase();

  if (!VALID_SEASONS.includes(normalized)) {
    throw new AppError(
      `Invalid season "${season}". Expected one of: ${VALID_SEASONS.join(', ')}.`,
      400,
      'invalid_season'
    );
  }

  return normalized;
};

// Attach a match_rating for the given user season to a product (non-mutating).
const withRating = (product, userSeason) => ({
  ...product,
  match_rating: getMatchRating(userSeason, product.season)
});

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

// GET /api/products/match?season=<userSeason>
// Returns every product with a match_rating for the user's season, ordered
// good -> fair -> poor. Separate from GET /api/products (which does not rank).
const getProductMatches = (req, res, next) => {
  try {
    const userSeason = normalizeSeason(req.query.season);

    const rated = products
      .map((product) => withRating(product, userSeason))
      // Stable sort keeps the catalog's original order within each rating tier.
      .sort((a, b) => RATING_RANK[a.match_rating] - RATING_RANK[b.match_rating]);

    return res.status(200).json({
      status: 'success',
      season: userSeason,
      data: rated
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to match products to season.', 500, 'products_match_error'));
  }
};

// GET /api/products/:id/match?season=<userSeason>
// Rates one product against the user's season and suggests up to 3 alternative
// 'good' matches, preferring the same garment_category so suggestions stay
// relevant. Used by the "Try This Product" flow.
const RECOMMENDATION_LIMIT = 3;

const getProductMatchById = (req, res, next) => {
  try {
    const userSeason = normalizeSeason(req.query.season);
    const productId = Number(req.params.id);

    const product = Number.isInteger(productId)
      ? products.find((p) => p.id === productId)
      : undefined;

    if (!product) {
      throw new AppError(
        `Product "${req.params.id}" not found.`,
        404,
        'product_not_found'
      );
    }

    const matchRating = getMatchRating(userSeason, product.season);

    // Candidate alternatives: other products that are a 'good' match for the
    // user's season. Same-category candidates come first so the top 3 favor
    // relevance, then other categories fill any remaining slots.
    const goodMatches = products.filter(
      (p) => p.id !== product.id && getMatchRating(userSeason, p.season) === 'good'
    );

    const sameCategory = goodMatches.filter(
      (p) => p.garment_category === product.garment_category
    );
    const otherCategory = goodMatches.filter(
      (p) => p.garment_category !== product.garment_category
    );

    const recommendations = [...sameCategory, ...otherCategory]
      .slice(0, RECOMMENDATION_LIMIT)
      .map((p) => withRating(p, userSeason));

    return res.status(200).json({
      status: 'success',
      season: userSeason,
      product: withRating(product, userSeason),
      match_rating: matchRating,
      recommendations
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to match product to season.', 500, 'product_match_error'));
  }
};

module.exports = {
  getProducts,
  getProductMatches,
  getProductMatchById
};
