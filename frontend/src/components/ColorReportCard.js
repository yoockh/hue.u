import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import colors from '../constants/colors';
import typography from '../constants/typography';

// SINGLE source of truth for the color report — used BOTH as the on-screen
// result (AnalysisResultScreen) AND as the content captured by react-native-
// view-shot for sharing. Replaces the old split between "Your Color Profile"
// (flat) and the separate "Share Color Card". One cohesive, glass-panelled
// infographic report.
//
// Props:
//   data      = analysisResult.data  { classification, recommendations, analysis }
//   photoUri  = the analyzed selfie (small rounded thumbnail in the header)
//
// Kept purely presentational so ViewShot captures it cleanly. The root is a
// pastel gradient wash so the GlassCard panels read as glass even inside a
// view-shot snapshot (where BlurView may not rasterize).
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const FeatureSwatch = ({ label, hex }) => (
  <View style={styles.feature}>
    <View style={[styles.featureSwatch, { backgroundColor: hex }]} />
    <Text style={styles.featureLabel}>{label}</Text>
    <Text style={styles.featureHex}>{hex}</Text>
  </View>
);

const ColorReportCard = ({ data, photoUri }) => {
  const classification = data?.classification || {};
  const recommendations = data?.recommendations || {};
  const analysis = data?.analysis || {};
  const { season, undertone, contrast } = classification;
  const palette = recommendations.palette || [];

  const seasonKey = (season || '').toString().trim().toLowerCase();
  const seasonGradient = colors.seasonGradients[seasonKey] || colors.gradientAccent;

  // Only show features the API actually returned — never fabricate a swatch.
  const features = [
    { label: 'Skin', hex: analysis.skin_color },
    { label: 'Hair', hex: analysis.hair_color },
    { label: 'Eyes', hex: analysis.eye_color },
  ].filter((f) => f.hex);

  return (
    <LinearGradient
      colors={colors.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.report}
    >
      {/* HEADER: brand + selfie thumbnail, then a season gradient banner. */}
      <GlassCard style={styles.panel} padding={16}>
        <View style={styles.headerRow}>
          <View style={styles.brandBlock}>
            <View style={styles.brandRow}>
              <Text style={styles.brandHue}>Hue</Text>
              <Text style={styles.brandU}>.U</Text>
            </View>
            <Text style={styles.reportLabel}>COLOR REPORT</Text>
          </View>

          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]}>
              <Ionicons name="person-outline" size={26} color={colors.textSecondary} />
            </View>
          )}
        </View>

        <LinearGradient
          colors={seasonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.seasonBanner}
        >
          <Text style={styles.seasonEyebrow}>YOUR SEASON</Text>
          <Text style={styles.seasonName}>{cap(season) || '—'}</Text>
          {undertone ? (
            <View style={styles.undertoneChip}>
              <Text style={styles.undertoneChipText}>{cap(undertone)} undertone</Text>
            </View>
          ) : null}
        </LinearGradient>
      </GlassCard>

      {/* UNDERTONE + why this season. */}
      <GlassCard style={styles.panel} padding={16}>
        <Text style={styles.sectionLabel}>UNDERTONE</Text>
        <Text style={styles.undertoneValue}>{cap(undertone) || 'Not available'}</Text>
        {contrast ? (
          <Text style={styles.metaLine}>Contrast: <Text style={styles.metaStrong}>{cap(contrast)}</Text></Text>
        ) : null}
        {recommendations.explanation ? (
          <Text style={styles.explanation}>{recommendations.explanation}</Text>
        ) : null}
      </GlassCard>

      {/* ANALYZED FEATURES — only what the API returned. */}
      {features.length > 0 ? (
        <GlassCard style={styles.panel} padding={16}>
          <Text style={styles.sectionLabel}>ANALYZED FEATURES</Text>
          <View style={styles.featureRow}>
            {features.map((f) => (
              <FeatureSwatch key={f.label} label={f.label} hex={f.hex} />
            ))}
          </View>
        </GlassCard>
      ) : null}

      {/* PALETTE grid. */}
      {palette.length > 0 ? (
        <GlassCard style={styles.panel} padding={16}>
          <Text style={styles.sectionLabel}>YOUR PALETTE</Text>
          <View style={styles.paletteGrid}>
            {palette.map((c, i) => (
              <View key={i} style={styles.paletteItem}>
                <View style={[styles.paletteSwatch, { backgroundColor: c.hex }]} />
                <Text style={styles.paletteName} numberOfLines={1}>{c.name}</Text>
              </View>
            ))}
          </View>
        </GlassCard>
      ) : null}

      <Text style={styles.footer}>Find your palette at Hue.U</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  report: { borderRadius: 24, padding: 14 },
  panel: { marginBottom: 12 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandBlock: { flex: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandHue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, color: colors.primaryStrong },
  brandU: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, color: colors.secondaryStrong },
  reportLabel: { ...typography.caption, letterSpacing: 1.6, color: colors.textSecondary, marginTop: 2 },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.glassBorder,
    backgroundColor: colors.surfaceMuted,
  },
  thumbFallback: { justifyContent: 'center', alignItems: 'center' },

  seasonBanner: {
    marginTop: 14,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  seasonEyebrow: { ...typography.caption, letterSpacing: 1.6, color: 'rgba(255,255,255,0.9)' },
  seasonName: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.28)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  undertoneChip: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  undertoneChipText: { ...typography.label, fontWeight: '700', color: '#FFFFFF' },

  sectionLabel: { ...typography.caption, letterSpacing: 1.4, color: colors.textSecondary, marginBottom: 8 },
  undertoneValue: { ...typography.title, color: colors.text, textTransform: 'capitalize' },
  metaLine: { ...typography.label, color: colors.textSecondary, marginTop: 4 },
  metaStrong: { color: colors.text, fontWeight: '700' },
  explanation: { ...typography.body, fontSize: 14, color: colors.text, marginTop: 10, lineHeight: 21 },

  featureRow: { flexDirection: 'row', justifyContent: 'space-around' },
  feature: { alignItems: 'center' },
  featureSwatch: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.glassBorder,
    marginBottom: 6,
  },
  featureLabel: { ...typography.label, fontWeight: '700', color: colors.text },
  featureHex: { ...typography.caption, fontSize: 11, color: colors.textSecondary },

  paletteGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  paletteItem: { width: '25%', alignItems: 'center', marginBottom: 14 },
  paletteSwatch: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: colors.glassBorder,
    marginBottom: 5,
  },
  paletteName: { ...typography.caption, fontSize: 11, color: colors.text, textAlign: 'center', paddingHorizontal: 2 },

  footer: { ...typography.label, fontWeight: '600', color: colors.textSecondary, textAlign: 'center', marginTop: 2 },
});

export default ColorReportCard;
