import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ColorSwatch from './ColorSwatch';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Visual card captured by ShareableColorCard and shared as an image — keep this
// purely presentational (no interaction) so it captures cleanly.
const ColorCard = ({ season, palette }) => (
  <View style={styles.card}>
    <Text style={styles.brand}>Hue.U</Text>
    <Text style={styles.seasonLabel}>My Color Season</Text>
    <Text style={styles.season}>{season}</Text>
    <View style={styles.swatchRow}>
      {palette.slice(0, 8).map((color, index) => (
        <ColorSwatch key={index} color={color.hex} size={36} />
      ))}
    </View>
    <Text style={styles.footer}>Find your palette at Hue.U</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  brand: { ...typography.sectionTitle, color: colors.primary, marginBottom: 12 },
  seasonLabel: { ...typography.label, color: colors.textSecondary },
  season: { ...typography.title, textTransform: 'capitalize', marginBottom: 16 },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  footer: { ...typography.label, color: colors.textSecondary, textAlign: 'right' },
});

export default ColorCard;
