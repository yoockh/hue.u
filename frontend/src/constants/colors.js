// Hue.U brand palette — "lollipop" pink + baby-blue, tuned to read as premium
// beauty-tech rather than childish. Two pink shades are kept on purpose:
//   - `primary`  (#FF6B9D) is the light brand pink used for identity, accents,
//     the wordmark, and active states.
//   - `primaryStrong` (#E84A7F) is a deeper pink used as the *filled* CTA
//     background so white label text clears WCAG large-text contrast (~3.7:1),
//     which the lighter pink (~2.7:1) does not.
// Likewise the teal/baby-blue has a light accent (`secondary`) plus a darker
// `secondaryStrong` for text/outline labels that must stay legible on white.
export default {
  // Pink
  primary: '#FF6B9D',        // brand pink — wordmark, accents, highlights
  primaryStrong: '#E84A7F',  // accessible filled-button background
  primarySoft: '#FFE1EC',    // pink tint for chips / selected states
  onPrimary: '#FFFFFF',      // text/icon on a pink-filled surface

  // Baby blue / teal
  secondary: '#5CC9D1',      // brand baby-blue — borders, accents
  secondaryStrong: '#1F8E9C',// accessible teal for outline/text labels
  // Exact spec color for SECONDARY buttons (border + label). Kept separate from
  // secondaryStrong (which stays #1F8E9C for chips/wordmark text contrast).
  buttonSecondary: '#2DBEBE',
  secondarySoft: '#DEF5F6',  // teal tint for surfaces
  onSecondary: '#FFFFFF',

  // Neutrals (warm, tinted toward the brand so nothing reads as default gray)
  background: '#FFF6FA',     // soft pink-tinted app background
  surface: '#FFFFFF',        // cards / sheets
  surfaceMuted: '#FDEFF5',   // placeholder / empty-state fill
  text: '#2B1F2A',           // deep plum near-black (high contrast on light bg)
  textSecondary: '#8A7C86',  // muted mauve-gray for captions/labels
  border: '#F3D9E6',         // soft pink hairline border

  // Feedback
  error: '#E5484D',
  errorSoft: '#FCE8E8',      // light red tint for error icon/badge backgrounds
  onError: '#FFFFFF',

  // Match-rating semantics for season/product compatibility badges. Muted,
  // warm-leaning green/amber/mauve so the good/fair/poor cue still reads at a
  // glance without clashing with the pink-blue brand palette.
  goodMatch: '#2E9E6B',      // fresh but muted green
  goodMatchSoft: '#E3F5EC',  // green tint for the badge background
  fairMatch: '#C98A1B',      // warm amber
  fairMatchSoft: '#FBF0DA',  // amber tint
  poorMatch: '#8A7C86',      // muted mauve-gray (matches textSecondary)
  poorMatchSoft: '#F0E7EC',  // neutral tint

  // Overlays (kept literal — used over photos, not the themed UI)
  scrim: 'rgba(43, 31, 42, 0.55)',

  // --- Glass-lollipop redesign tokens ---------------------------------------
  // Full-screen pastel background gradient (pink -> lilac -> blue), fed to
  // expo-linear-gradient by the shared GradientBackground component.
  // Exact spec: vertical (180deg) top -> bottom.
  gradientBackground: ['#FFE8F0', '#E8F0FF'],
  // Exact spec: horizontal (90deg) pink -> blue CTA gradient.
  gradientButton: ['#FF4D8D', '#5AC8FA'],
  // Bolder stops used for the pressed state so a tap deepens the gradient.
  gradientButtonStrong: ['#E84A7F', '#4FA3E0'],
  // A soft pink->blue used for accents (active tab pill, scan line).
  gradientAccent: ['#FF6B9D', '#5CC9D1'],

  // Glass surfaces: a white tint laid over a BlurView.
  glassFill: 'rgba(255, 255, 255, 0.55)',       // default card tint (spec)
  glassFillStrong: 'rgba(255, 255, 255, 0.74)', // floating nav / dialogs
  glassFillSoft: 'rgba(255, 255, 255, 0.42)',   // lighter tint for long lists
  glassBorder: 'rgba(255, 255, 255, 0.8)',      // crisp 1px highlight edge (spec)
  glassBorderSoft: 'rgba(255, 255, 255, 0.55)',
  // Darker glass tint for panels sitting over a photo, so overlaid text stays
  // legible without hiding the image behind it.
  glassTintDark: 'rgba(26, 18, 28, 0.26)',
  glassBorderDark: 'rgba(255, 255, 255, 0.45)',

  // Top-edge shine highlight on capsule buttons.
  shine: 'rgba(255, 255, 255, 0.50)',

  // Soft, color-tinted shadows (glow) instead of hard black drop shadows.
  shadowPink: '#FF6B9D',
  shadowBlue: '#5CC9D1',

  // Per-season gradient tints for the shareable color card's glass panel. Each
  // is a 2-stop diagonal that matches the season's character:
  //   Spring — warm pink -> orange   Summer — soft blue -> lavender
  //   Autumn — earthy brown -> orange Winter — bold blue -> purple
  // Keyed lowercase; look up with seasonGradient(season).
  seasonGradients: {
    spring: ['#FF8FB0', '#FFB463'],
    summer: ['#7FB4F2', '#B9A6F5'],
    autumn: ['#C77B3C', '#9A4E22'],
    winter: ['#4A63E0', '#8A38C9'],
  },
};
