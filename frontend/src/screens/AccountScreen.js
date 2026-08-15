import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { UserRound } from 'lucide-react-native';
import GradientBackground from '../components/GradientBackground';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Account tab (5th nav item). Pure visual placeholder — no auth logic. The
// avatar is GENERATED, not a bundled photo: a pink->blue gradient disc with a
// gender-neutral lucide person glyph, ringed by a soft glass halo, so it matches
// the glass design system.
const AccountScreen = () => (
  <GradientBackground>
    <View style={styles.container}>
      {/* Generative glass avatar. */}
      <View style={styles.avatarHalo}>
        <View style={styles.haloClip}>
          <BlurView intensity={50} tint="light" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, styles.haloTint]} />
        </View>
        <LinearGradient
          colors={colors.gradientAccent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarDisc}
        >
          <UserRound size={56} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
      </View>

      <Text style={styles.title}>Coming Soon</Text>
      <Text style={styles.subtitle}>Account features are on the way — stay tuned!</Text>
    </View>
  </GradientBackground>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  avatarHalo: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  haloClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 80,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  haloTint: { backgroundColor: colors.glassFillSoft },
  avatarDisc: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowPink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  title: { ...typography.hero, color: colors.text, marginBottom: 8, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});

export default AccountScreen;
