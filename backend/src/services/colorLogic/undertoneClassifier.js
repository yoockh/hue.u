// Undertone thresholds on the CIELAB (b* - a*) "warmth" axis, calibrated against
// a spread of labelled warm / cool / neutral skin swatches. Warm skin leans
// golden-yellow (b* well above a*); cool skin leans pink (a* close to or above
// b*); neutral sits between the two.
const WARM_THRESHOLD = 17;
const COOL_THRESHOLD = 7;

function hexToRgb(hexColor) {
  if (typeof hexColor !== 'string' || hexColor.trim() === '') {
    throw new Error(
      `Invalid hex color: expected a string like "#RRGGBB" but received ${JSON.stringify(hexColor)}.`
    );
  }
  const cleanHex = hexColor.replace('#', '');
  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16)
  };
}

// sRGB channel (0-255) -> linear-light component.
function srgbToLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// Convert an sRGB color to CIELAB using the D65 white point. CIELAB separates
// lightness (L*) from the red-green (a*) and blue-yellow (b*) opponent axes,
// which is a far better basis for undertone than an HSV hue angle that clusters
// nearly every skin tone into one narrow orange band.
function rgbToLab({ r, g, b }) {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);

  let x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
  let y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750;
  let z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041;

  // Normalize by the D65 reference white.
  x /= 0.95047;
  z /= 1.08883;

  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  };
}

function classifyUndertone(hexColor) {
  const { a, b } = rgbToLab(hexToRgb(hexColor));

  // How far the yellow (warm) axis leads the red (cool) axis.
  const warmth = b - a;

  if (warmth > WARM_THRESHOLD) {
    return 'warm';
  }
  if (warmth < COOL_THRESHOLD) {
    return 'cool';
  }
  return 'neutral';
}

module.exports = { classifyUndertone, rgbToLab };
