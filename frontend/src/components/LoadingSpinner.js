import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Full-screen glass loading overlay (used by flows without the dedicated scan
// animation, e.g. the virtual try-on). Frosted wash so the screen behind stays
// faintly visible instead of a flat white block.
const LoadingSpinner = ({ message = 'Loading...' }) => (
  <View style={styles.container}>
    <BlurView intensity={50} tint="light" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
    <View style={[StyleSheet.absoluteFill, styles.wash]} />
    <ActivityIndicator size="large" color={colors.primaryStrong} />
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  wash: { backgroundColor: 'rgba(255,246,250,0.4)' },
  message: {
    marginTop: 14,
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
});

export default LoadingSpinner;
