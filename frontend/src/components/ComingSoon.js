import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Reusable empty/placeholder state for tabs/screens (e.g. History empty). Always
// rendered INSIDE a GradientBackground, so the container stays transparent (it
// previously painted a solid colors.background that covered the gradient) and the
// icon sits in a frosted glass badge consistent with GlassCard.
const ComingSoon = ({ icon = 'sparkles-outline', title, message = 'Coming soon' }) => (
  <View style={styles.container}>
    <View style={styles.badge}>
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.badgeTint]} />
      <Ionicons name={icon} size={44} color={colors.primaryStrong} />
    </View>
    {title ? <Text style={styles.title}>{title}</Text> : null}
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.shadowPink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 4,
  },
  badgeTint: { backgroundColor: colors.glassFill },
  title: { ...typography.title, color: colors.text, marginBottom: 6 },
  message: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});

export default ComingSoon;
