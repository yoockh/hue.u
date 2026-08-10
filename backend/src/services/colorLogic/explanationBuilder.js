// Human-readable fragments used to explain *why* a given season was recommended,
// so the API returns reasoning rather than a bare season label.
const UNDERTONE_PHRASES = {
  warm: 'warm, golden undertones',
  cool: 'cool, pink undertones',
  neutral: 'balanced, neutral undertones'
};

const CONTRAST_PHRASES = {
  high: 'high contrast between your skin, hair, and eyes',
  low: 'soft, low contrast between your skin, hair, and eyes'
};

const SEASON_PHRASES = {
  spring: 'warm, clear, and bright shades',
  summer: 'cool, soft, and muted shades',
  autumn: 'warm, deep, and earthy shades',
  winter: 'cool, bold, and high-contrast shades'
};

function capitalize(word) {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Build a single sentence for a given undertone / contrast / season combination.
// The three inputs together yield a distinct, natural-language "why" for each of
// the six valid undertone x contrast combinations.
function buildExplanation(season, undertone, contrast) {
  const undertonePhrase = UNDERTONE_PHRASES[undertone] || 'your undertones';
  const contrastPhrase = CONTRAST_PHRASES[contrast] || 'your natural contrast';
  const seasonPhrase = SEASON_PHRASES[season] || 'colors that suit you';

  return `Your ${undertonePhrase} and ${contrastPhrase} place you in the ` +
    `${capitalize(season)} palette, which flatters you with ${seasonPhrase}.`;
}

module.exports = { buildExplanation };
