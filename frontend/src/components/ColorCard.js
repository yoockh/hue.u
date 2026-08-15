import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Shareable "color card" captured by ViewShot in AnalysisResultScreen. Redesign:
// the user's analyzed selfie is the hero image, with a frosted glass panel at the
// bottom carrying the wordmark, season, and palette swatches. The panel is tinted
// per-season and sits on a dark scrim so overlaid text stays legible over ANY
// photo.
//
// Capture note: react-native-view-shot doesn't reliably rasterize BlurView on
// Android, so the panel layers a season LinearGradient tint OVER the blur — that
// gradient (plus the scrim) carries the glass look even when the blur drops out
// of the snapshot. Purely presentational so it captures cleanly.
const ColorCard = ({ season, palette, photoUri }) => {
  const key = (season || '').toString().trim().toLowerCase();
  const gradient = colors.seasonGradients[key] || colors.gradientAccent;
  const swatches = (palette || []).slice(0, 6);

  return (
    <View style={styles.card}>
      {/* Hero: the analyzed selfie, or a season-gradient wash if no photo. */}
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Top-left wordmark chip so the brand reads over a bright photo. */}
      <View style={styles.brandChip}>
        <Text style={styles.brandHue}>Hue</Text>
        <Text style={styles.brandU}>.U</Text>
      </View>

      {/* Bottom glass panel. */}
      <View style={styles.panelWrap}>
        {/* Scrim: fade the photo to dark behind the panel for text contrast. */}
        <LinearGradient
          colors={['rgba(20,12,20,0)', 'rgba(20,12,20,0.55)']}
          style={styles.scrim}
          pointerEvents="none"
        />
        <View style={styles.panelClip}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          {/* Season tint over the blur — also the capture fallback. */}
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.panelTint]}
          />
          <View style={StyleSheet.absoluteFill} />

          <View style={styles.panelContent}>
            <Text style={styles.seasonLabel}>MY COLOR SEASON</Text>
            <Text style={styles.season}>{season}</Text>

            <View style={styles.swatchRow}>
              {swatches.map((color, index) => (
                <View key={index} style={[styles.swatch, { backgroundColor: color.hex }]} />
              ))}
            </View>

            <Text style={styles.footer}>Find your palette at Hue.U</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 0.8, // portrait 4:5, feels right for a shareable card
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.text,
  },
  brandChip: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  brandHue: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5, color: colors.primaryStrong },
  brandU: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5, color: colors.secondaryStrong },

  panelWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 220 },
  panelClip: {
    margin: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  panelTint: { opacity: 0.7 },
  panelContent: { padding: 18 },
  seasonLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  season: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: '#FFFFFF',
    textTransform: 'capitalize',
    marginBottom: 14,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  footer: {
    ...typography.label,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
});

export default ColorCard;
