import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';

// "Hue.U" wordmark drawn with plain React Native text — pink "Hue" + teal ".U",
// bold and playful per the lollipop theme. Previously an SVG (react-native-svg),
// but that needs a native ViewManager compiled into the dev client; plain <Text>
// renders identically here, needs no native module, and keeps the two brand
// tones as two inline runs that join seamlessly into "Hue.U".
//
// variant:
//   "plain" (default) — transparent, for the navigation header.
//   "badge"           — sits on a rounded pink-tint square, for app-icon use.
const Wordmark = ({ height = 26, variant = 'plain' }) => {
  const isBadge = variant === 'badge';
  const fontSize = height;
  const pad = isBadge ? height * 0.4 : 0;

  return (
    <View
      accessibilityRole="header"
      accessibilityLabel="Hue.U"
      style={[
        styles.row,
        isBadge && {
          backgroundColor: colors.primarySoft,
          borderRadius: (height + pad * 2) * 0.28,
          paddingHorizontal: pad,
          paddingVertical: pad,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize, color: colors.primaryStrong }]}>Hue</Text>
      <Text style={[styles.text, { fontSize, color: colors.secondaryStrong }]}>.U</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { fontWeight: '800', letterSpacing: -0.5, includeFontPadding: false },
});

export default Wordmark;
