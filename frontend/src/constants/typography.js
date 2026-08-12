// Shared type scale so screens stop picking their own one-off font sizes/weights.
// No custom font asset is bundled yet, so this keeps the platform system font —
// add a `fontFamily` here once a brand typeface is chosen.
export default {
  title: { fontSize: 24, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  label: { fontSize: 14, fontWeight: '400' },
  button: { fontSize: 16, fontWeight: '600' },
};
