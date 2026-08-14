import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

// Static visual framing guide shown over the selected/taken photo. This is NOT
// live face detection — we only have an image picker, no camera-feed processing.
// It draws a centered face oval with an eye-level reference so the user can frame
// the shot before uploading. It intentionally guides the FACE only (eyes, nose,
// mouth, chin sit within the oval) and never assumes hair is visible, so it reads
// correctly for hijab / head-covering photos.

// The guide box is unscaled so the feature marks stay put; the oval itself is a
// circle stretched vertically into a true ellipse via scaleY.
const GUIDE_WIDTH = 240;
const GUIDE_HEIGHT = 312;

const CameraGuideOverlay = ({ instructions = 'Position your face within the frame' }) => (
  <View style={styles.overlay} pointerEvents="none">
    <View style={styles.guideBox}>
      <View style={styles.oval} />

      {/* Eye-level reference: place your eyes along this line and the rest of the
          face (nose, mouth, chin) falls naturally inside the oval below. */}
      <View style={styles.eyeLine}>
        <View style={styles.eyeDot} />
        <View style={styles.eyeBar} />
        <View style={styles.eyeDot} />
      </View>
      <Text style={styles.eyeLabel}>Eye level</Text>
    </View>

    <Text style={styles.instructions}>{instructions}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideBox: {
    width: GUIDE_WIDTH,
    height: GUIDE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // A circle stretched vertically into a face-shaped ellipse.
  oval: {
    position: 'absolute',
    width: GUIDE_WIDTH,
    height: GUIDE_WIDTH,
    borderRadius: GUIDE_WIDTH / 2,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderStyle: 'dashed',
    transform: [{ scaleY: GUIDE_HEIGHT / GUIDE_WIDTH }],
  },
  // Eye-level guide, sitting a little above the vertical centre of the face.
  eyeLine: {
    position: 'absolute',
    top: GUIDE_HEIGHT * 0.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeBar: {
    width: 96,
    height: 2,
    marginHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  eyeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  eyeLabel: {
    position: 'absolute',
    top: GUIDE_HEIGHT * 0.4 + 10,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  instructions: {
    marginTop: 28,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: 300,
  },
});

export default CameraGuideOverlay;
