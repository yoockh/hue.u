function getLightness(hex) {
  if (typeof hex !== 'string' || hex.trim() === '') {
    throw new Error(
      `Invalid hex color: expected a string like "#RRGGBB" but received ${JSON.stringify(hex)}.`
    );
  }
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Perceptual luminance formula
  const lightness = 0.299 * r + 0.587 * g + 0.114 * b;
  return (lightness / 255) * 100;
}

function calculateContrast(...hexes) {
  // Contrast is the lightness spread across the user's visible features. Accept
  // any number of feature colors and ignore the ones the API did not return
  // (e.g. hair_color is absent for hijab / head-covering photos), so a partial
  // feature set still yields a valid result instead of crashing on undefined.
  const lightnesses = hexes
    .filter((hex) => typeof hex === 'string' && hex.trim() !== '')
    .map(getLightness);

  // With fewer than two measurable features there is no spread to speak of;
  // treat that as soft (low) contrast rather than failing.
  if (lightnesses.length < 2) {
    return 'low';
  }

  const maxL = Math.max(...lightnesses);
  const minL = Math.min(...lightnesses);
  const diff = maxL - minL;

  // Threshold of 35% difference marks high contrast features
  return diff > 35 ? 'high' : 'low';
}

module.exports = { calculateContrast };
