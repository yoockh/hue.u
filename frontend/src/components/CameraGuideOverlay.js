import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Static glass framing guide shown over the selected/taken photo. NOT live face
// detection — just a pre-submit framing aid. Redesigned for the glass-lollipop
// look: a soft glass oval ring (double edge + pink glow) with an eye-level
// reference and a frosted caption pill. Guides the FACE only (eyes, nose, mouth,
// chin inside the oval) and never assumes hair is visible, so it reads correctly
// for hijab / head-covering photos. The oval interior stays clear so the face
// being framed is never obscured.
const GUIDE_WIDTH = 240;
const GUIDE_HEIGHT = 312;

const CameraGuideOverlay = ({ instructions = 'Position your face within the oval' }) => (
  <View style={styles.overlay} pointerEvents="none">
    <View style={styles.guideBox}>
      {/* Outer soft glow ring + inner crisp ring for a glass edge. */}
      <View style={styles.ovalGlow} />
      <View style={styles.oval} />

      <View style={styles.eyeLine}>
        <View style={styles.eyeDot} />
        <View style={styles.eyeBar} />
        <View style={styles.eyeDot} />
      </View>
      <Text style={styles.eyeLabel}>Eye level</Text>
    </View>

    <View style={styles.captionShadow}>
      <View style={styles.captionClip}>
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.captionTint]} />
        <Text style={styles.instructions}>{instructions}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  guideBox: { width: GUIDE_WIDTH, height: GUIDE_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  // Crisp glass ring.
  oval: {
    position: 'absolute',
    width: GUIDE_WIDTH,
    height: GUIDE_WIDTH,
    borderRadius: GUIDE_WIDTH / 2,
    borderWidth: 2.5,
    borderColor: colors.glassBorder,
    transform: [{ scaleY: GUIDE_HEIGHT / GUIDE_WIDTH }],
  },
  // Slightly larger, softer ring for a glow halo.
  ovalGlow: {
    position: 'absolute',
    width: GUIDE_WIDTH + 12,
    height: GUIDE_WIDTH + 12,
    borderRadius: (GUIDE_WIDTH + 12) / 2,
    borderWidth: 6,
    borderColor: colors.glassBorderSoft,
    transform: [{ scaleY: GUIDE_HEIGHT / GUIDE_WIDTH }],
    shadowColor: colors.shadowPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
  },
  eyeLine: {
    position: 'absolute',
    top: GUIDE_HEIGHT * 0.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeBar: { width: 96, height: 2, marginHorizontal: 8, backgroundColor: 'rgba(255,255,255,0.7)' },
  eyeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.95)' },
  eyeLabel: {
    position: 'absolute',
    top: GUIDE_HEIGHT * 0.4 + 10,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: 'rgba(255,255,255,0.9)',
  },
  captionShadow: {
    marginTop: 28,
    borderRadius: 16,
    shadowColor: colors.shadowPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  captionClip: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  captionTint: { backgroundColor: colors.glassFillStrong },
  instructions: {
    ...typography.label,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    maxWidth: 300,
  },
});

export default CameraGuideOverlay;
