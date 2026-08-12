// Shared type scale so screens stop picking their own one-off font sizes/weights.
// No custom font asset is bundled yet, so this keeps the platform system font —
// add a `fontFamily` here once a brand typeface is chosen. `wordmark` is the
// distinctive style the "Hue.U" text logo is built from (see components/Wordmark).
export default {
  wordmark: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  hero: { fontSize: 28, fontWeight: '800', letterSpacing: -0.4 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.2 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  label: { fontSize: 14, fontWeight: '500' },
  caption: { fontSize: 12, fontWeight: '500', letterSpacing: 0.2 },
  button: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
};
