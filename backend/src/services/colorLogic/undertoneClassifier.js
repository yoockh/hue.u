function classifyUndertone(hexColor) {
  const cleanHex = hexColor.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Skin undertone is best read from how much the red (warm) channel leads the
  // blue (cool) channel. An HSV hue angle is a poor fit: almost every skin tone
  // lands in the narrow 20-40 degree orange band, so the previous 6-degree
  // neutral window classified nearly everyone as "warm".
  //
  // NOTE: these thresholds are first-pass estimates. They should be calibrated
  // against a labelled dataset of real skin swatches (or replaced with a Lab /
  // ITA-based measure) before relying on the boundaries.
  const warmth = r - b;

  if (warmth < 30) {
    return 'cool';
  } else if (warmth > 60) {
    return 'warm';
  }
  return 'neutral';
}

module.exports = { classifyUndertone };
