// Human-readable fragments used to explain *why* a given season was recommended,
// so the API returns reasoning rather than a bare season label.
const UNDERTONE_PHRASES = {
  warm: 'warm, golden undertones',
  cool: 'cool, pink undertones',
  neutral: 'balanced, neutral undertones'
};

// Two variants each: one that names hair (the usual case) and one that avoids it
// for photos where hair is not visible (e.g. hijab / head covering), so the
// sentence never implies a feature that was not analyzed.
const CONTRAST_PHRASES = {
  high: {
    withHair: 'high contrast between your skin, hair, and eyes',
    noHair: 'high contrast across your visible features'
  },
  low: {
    withHair: 'soft, low contrast between your skin, hair, and eyes',
    noHair: 'soft, low contrast across your visible features'
  }
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
// the six valid undertone x contrast combinations. `options.hairVisible` (default
// true) picks a contrast phrase that avoids mentioning hair when it wasn't seen.
function buildExplanation(season, undertone, contrast, { hairVisible = true } = {}) {
  const undertonePhrase = UNDERTONE_PHRASES[undertone] || 'your undertones';
  const contrastVariants = CONTRAST_PHRASES[contrast];
  const contrastPhrase = contrastVariants
    ? (hairVisible ? contrastVariants.withHair : contrastVariants.noHair)
    : 'your natural contrast';
  const seasonPhrase = SEASON_PHRASES[season] || 'colors that suit you';

  return `Your ${undertonePhrase} and ${contrastPhrase} place you in the ` +
    `${capitalize(season)} palette, which flatters you with ${seasonPhrase}.`;
}

module.exports = { buildExplanation };
