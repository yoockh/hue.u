import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Easing, StyleSheet } from 'react-native';
import colors from '../constants/colors';

const LINE_MARGIN = 14; // keep the line off the very top/bottom edges

// Avatar image with a dashed "scanning" line that loops up and down across the
// face, for a light "analyzing" feel. Uses the built-in Animated API (native
// driver) — no reanimated dependency.
const ScanningAvatar = ({ source, height = 280 }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [LINE_MARGIN, height - LINE_MARGIN],
  });

  return (
    <View style={[styles.container, { height }]}>
      <Image source={source} style={styles.image} resizeMode="cover" />
      <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} pointerEvents="none">
        <View style={styles.glow} />
        <View style={styles.dashedLine} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  // Soft band behind the dashes for a subtle "scan glow".
  glow: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 10,
    top: -4,
    backgroundColor: colors.secondary,
    opacity: 0.22,
    borderRadius: 6,
  },
  dashedLine: {
    height: 0,
    borderTopWidth: 2,
    borderColor: colors.secondary,
    borderStyle: 'dashed',
  },
});

export default ScanningAvatar;
