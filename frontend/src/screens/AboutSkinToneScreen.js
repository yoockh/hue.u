import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Education screen opened from the dashboard "?" button. Presented as a modal
// in the root stack, so it deliberately has no bottom tabs.
//
// NOTE: content below is PLACEHOLDER only. The final, source-backed copy will be
// supplied separately — do not replace these with invented claims about skin
// tone / undertone.
const AboutSkinToneScreen = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <Text style={styles.title}>Understanding Your Skin Tone</Text>

    <Text style={styles.todo}>
      TODO: Final educational content pending reference research. The blocks below
      are placeholders and will be replaced with source-backed copy.
    </Text>

    <Text style={styles.heading}>What is skin tone?</Text>
    <Text style={styles.paragraph}>
      [Placeholder] A short, plain-language introduction will go here once the
      reference sources are confirmed.
    </Text>

    <Text style={styles.heading}>Undertone vs. surface color</Text>
    <Text style={styles.paragraph}>
      [Placeholder] This section will explain the concept in the final copy. Not
      written yet — intentionally left as a placeholder.
    </Text>

    <Text style={styles.heading}>How Hue.U uses this</Text>
    <Text style={styles.paragraph}>
      [Placeholder] A brief note on how the analysis maps to seasonal palettes
      will go here, aligned with the confirmed references.
    </Text>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { ...typography.hero, color: colors.text, marginBottom: 16 },
  todo: {
    ...typography.caption,
    color: colors.secondaryStrong,
    backgroundColor: colors.secondarySoft,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  heading: { ...typography.sectionTitle, color: colors.text, marginTop: 8, marginBottom: 6 },
  paragraph: { ...typography.body, color: colors.textSecondary, marginBottom: 20 },
});

export default AboutSkinToneScreen;
