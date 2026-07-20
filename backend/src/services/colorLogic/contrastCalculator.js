function getLightness(hex) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Perceptual luminance formula
  const lightness = 0.299 * r + 0.587 * g + 0.114 * b;
  return (lightness / 255) * 100;
}

function calculateContrast(skinHex, hairHex, eyeHex) {
  const skinL = getLightness(skinHex);
  const hairL = getLightness(hairHex);
  const eyeL = getLightness(eyeHex);

  const maxL = Math.max(skinL, hairL, eyeL);
  const minL = Math.min(skinL, hairL, eyeL);
  const diff = maxL - minL;

  // Threshold of 35% difference marks high contrast features
  return diff > 35 ? 'high' : 'low';
}

module.exports = { calculateContrast };
