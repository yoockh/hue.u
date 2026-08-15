import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Framing guide drawn over the LIVE camera preview. The oval ring reacts in
// real time to the face-detection result passed down from CustomCameraScreen:
//
//   status = 'idle'      -> neutral white ring (detector unavailable / warming up)
//   status = 'searching' -> RED ring (no face, or face not yet inside the oval)
//   status = 'good'      -> GREEN ring (a face is detected AND framed proportionally)
//
// The oval interior stays clear so the face being framed is never obscured, and
// the shutter is NEVER gated on this — the color is only a hint. Guides the FACE
// only (eyes, nose, mouth, chin inside the oval), so it also reads correctly for
// hijab / head-covering photos.
const GUIDE_WIDTH = 240;
const GUIDE_HEIGHT = 312;

// Per-status visual theme for the ring + caption.
const STATUS_THEME = {
  idle: {
    ring: colors.glassBorder,
    glow: colors.glassBorderSoft,
    shadow: colors.shadowPink,
    tint: colors.glassFillStrong,
    text: colors.text,
    caption: 'Position your face within the oval',
  },
  searching: {
    ring: '#FF5A5F',                        // warm red — not framed yet
    glow: 'rgba(255, 90, 95, 0.55)',
    shadow: '#FF5A5F',
    tint: 'rgba(229, 72, 77, 0.30)',
    text: '#FFFFFF',
    caption: 'Center your face in the oval',
  },
  good: {
    ring: '#37D67A',                        // fresh green — framed well
    glow: 'rgba(55, 214, 122, 0.55)',
    shadow: '#2E9E6B',
    tint: 'rgba(46, 158, 107, 0.32)',
    text: '#FFFFFF',
    caption: 'Perfect — hold still and tap the shutter',
  },
};

const CameraGuideOverlay = ({ status = 'idle', instructions }) => {
  const theme = STATUS_THEME[status] || STATUS_THEME.idle;
  const caption = instructions || theme.caption;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.guideBox}>
        {/* Outer soft glow ring + inner crisp ring for a glass edge. Both tinted
            by the current detection status. */}
        <View style={[styles.ovalGlow, { borderColor: theme.glow, shadowColor: theme.shadow }]} />
        <View style={[styles.oval, { borderColor: theme.ring }]} />

        <View style={styles.eyeLine}>
          <View style={styles.eyeDot} />
          <View style={styles.eyeBar} />
          <View style={styles.eyeDot} />
        </View>
        <Text style={styles.eyeLabel}>Eye level</Text>
      </View>

      <View style={[styles.captionShadow, { shadowColor: theme.shadow }]}>
        <View style={styles.captionClip}>
          <BlurView intensity={50} tint="light" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.tint }]} />
          <Text style={[styles.instructions, { color: theme.text }]}>{caption}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  guideBox: { width: GUIDE_WIDTH, height: GUIDE_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  // Crisp glass ring.
  oval: {
    position: 'absolute',
    width: GUIDE_WIDTH,
    height: GUIDE_WIDTH,
    borderRadius: GUIDE_WIDTH / 2,
    borderWidth: 3,
    transform: [{ scaleY: GUIDE_HEIGHT / GUIDE_WIDTH }],
  },
  // Slightly larger, softer ring for a glow halo.
  ovalGlow: {
    position: 'absolute',
    width: GUIDE_WIDTH + 12,
    height: GUIDE_WIDTH + 12,
    borderRadius: (GUIDE_WIDTH + 12) / 2,
    borderWidth: 6,
    transform: [{ scaleY: GUIDE_HEIGHT / GUIDE_WIDTH }],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  captionClip: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  instructions: {
    ...typography.label,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    maxWidth: 300,
  },
});

export default CameraGuideOverlay;
