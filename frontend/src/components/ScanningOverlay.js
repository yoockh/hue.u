import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';
import typography from '../constants/typography';

const OVAL_W = 210;
const OVAL_H = 270;
const TRAVEL = OVAL_H - 24; // vertical range of the scan line inside the oval

// Full-screen "analyzing" overlay shown while the skin analysis request is in
// flight. A soft glass wash over the screen, a face oval, and a pink->blue scan
// line that sweeps up and down with a glow — replaces the generic spinner.
// Built on the Animated API (native driver) so it stays smooth on Android.
const ScanningOverlay = ({ message = 'Analyzing your colors...' }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sweep = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(progress, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    sweep.start();
    breathe.start();
    return () => { sweep.stop(); breathe.stop(); };
  }, [progress, pulse]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [12, TRAVEL] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.8] });

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.wash]} />

      <View style={styles.center}>
        <View style={styles.ovalBox}>
          {/* Pulsing glass ring. */}
          <Animated.View style={[styles.oval, { opacity: ringOpacity }]} />

          {/* Sweeping scan line + soft glow band. */}
          <Animated.View style={[styles.scan, { transform: [{ translateY }] }]} pointerEvents="none">
            <View style={styles.glow} />
            <LinearGradient
              colors={['rgba(255,107,157,0)', colors.primary, colors.secondary, 'rgba(92,201,209,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.line}
            />
          </Animated.View>
        </View>

        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 20, justifyContent: 'center', alignItems: 'center' },
  wash: { backgroundColor: 'rgba(255,246,250,0.35)' },
  center: { alignItems: 'center' },
  ovalBox: { width: OVAL_W, height: OVAL_H, justifyContent: 'flex-start', alignItems: 'center' },
  oval: {
    position: 'absolute',
    width: OVAL_W,
    height: OVAL_W,
    borderRadius: OVAL_W / 2,
    borderWidth: 2,
    borderColor: colors.glassBorder,
    transform: [{ scaleY: OVAL_H / OVAL_W }],
    // Soft pink glow around the ring.
    shadowColor: colors.shadowPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  scan: { position: 'absolute', top: 0, left: 18, right: 18, alignItems: 'center' },
  glow: { position: 'absolute', left: 0, right: 0, top: -6, height: 16, backgroundColor: colors.primary, opacity: 0.18, borderRadius: 8 },
  line: { height: 3, alignSelf: 'stretch', borderRadius: 2 },
  message: { ...typography.body, fontWeight: '600', color: colors.text, marginTop: 28, textAlign: 'center' },
});

export default ScanningOverlay;
