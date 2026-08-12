import React from 'react';
import { Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Text-only brand logo. No image asset exists yet, so identity comes from a
// distinctive two-tone treatment of the "Hue.U" wordmark — pink "Hue" + teal
// ".U" — rendered as a single accessible header element.
const Wordmark = ({ size = typography.wordmark.fontSize }) => (
  <Text
    style={[styles.base, { fontSize: size }]}
    accessibilityRole="header"
    accessibilityLabel="Hue.U"
    allowFontScaling={false}
  >
    <Text style={styles.hue}>Hue</Text>
    <Text style={styles.u}>.U</Text>
  </Text>
);

const styles = StyleSheet.create({
  base: { ...typography.wordmark },
  hue: { color: colors.primaryStrong },
  u: { color: colors.secondaryStrong },
});

export default Wordmark;
