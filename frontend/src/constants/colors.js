// No official brand color spec exists yet, so primary/secondary are drawn from
// the app's own Winter seasonal palette (backend/src/services/colorLogic/paletteData.js)
// as a placeholder identity, distinct from the default iOS system blue. Confirm
// with design before treating these as final.
export default {
  primary: '#E0115F', // "Ruby Red" (Winter palette) — brand CTA color
  onPrimary: '#FFFFFF', // text/icon color on top of a primary-filled surface
  secondary: '#4169E1', // "Royal Blue" (Winter palette) — brand secondary/outline color
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  error: '#FF3B30',
};
