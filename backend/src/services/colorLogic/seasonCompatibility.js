// Season-to-season compatibility for rating how well a product's season suits a
// user's season. Pure lookup logic — no AI/ML — derived from the same
// undertone x contrast model the season mapper uses:
//
//   spring = warm + high contrast
//   autumn = warm + low  contrast
//   winter = cool + high contrast
//   summer = cool + low  contrast
//
// Rating rules:
//   - Same season exactly                       -> 'good'
//   - Same undertone, different contrast         -> 'fair'
//       (warm pair: spring+autumn, cool pair: summer+winter)
//   - Different undertone (warm vs cool)         -> 'poor'
const SEASON_PROFILE = {
  spring: { undertone: 'warm', contrast: 'high' },
  autumn: { undertone: 'warm', contrast: 'low' },
  winter: { undertone: 'cool', contrast: 'high' },
  summer: { undertone: 'cool', contrast: 'low' }
};

const VALID_SEASONS = Object.keys(SEASON_PROFILE);

// Returns one of 'good' | 'fair' | 'poor'. Season inputs are case-insensitive.
// Throws on an unknown season so callers surface a clear error rather than a
// silent wrong rating.
function getMatchRating(userSeason, productSeason) {
  const user = String(userSeason || '').trim().toLowerCase();
  const product = String(productSeason || '').trim().toLowerCase();

  const userProfile = SEASON_PROFILE[user];
  const productProfile = SEASON_PROFILE[product];

  if (!userProfile || !productProfile) {
    const bad = !userProfile ? userSeason : productSeason;
    throw new Error(
      `Unknown season "${bad}". Expected one of: ${VALID_SEASONS.join(', ')}.`
    );
  }

  if (user === product) {
    return 'good';
  }

  if (userProfile.undertone === productProfile.undertone) {
    return 'fair';
  }

  return 'poor';
}

module.exports = { getMatchRating, SEASON_PROFILE, VALID_SEASONS };
