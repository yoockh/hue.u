import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const CameraGuideOverlay = ({ instructions }) => (
  <View style={styles.overlay} pointerEvents="none">
    <View style={styles.guideFrame} />
    <Text style={styles.instructions}>{instructions}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: 250,
    height: 350,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  instructions: {
    marginTop: 20,
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
});

export default CameraGuideOverlay;
