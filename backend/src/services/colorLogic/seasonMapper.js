function mapToSeason(undertone, contrast) {
  const highContrast = contrast === 'high';

  if (undertone === 'warm') {
    return highContrast ? 'spring' : 'autumn';
  }

  if (undertone === 'cool') {
    return highContrast ? 'winter' : 'summer';
  }

  // Neutral undertones suit both warm and cool palettes, so contrast decides the
  // result. High contrast pairs with the brighter, clearer palettes and low
  // contrast with the softer, muted ones. We lean warm-bright on high contrast
  // (spring) and cool-soft on low contrast (summer) so neutral has its own path
  // rather than collapsing into cool.
  return highContrast ? 'spring' : 'summer';
}

module.exports = { mapToSeason };
