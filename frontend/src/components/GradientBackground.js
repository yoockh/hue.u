import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';

// Full-screen pastel pink -> lilac -> blue wash used as the base of every screen
// in the glass-lollipop redesign. Diagonal (top-left to bottom-right) so the
// pink and blue read as distinct corners. Children render on top.
const GradientBackground = ({ children, style }) => (
  <LinearGradient
    colors={colors.gradientBackground}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.fill, style]}
  >
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  fill: { flex: 1 },
});

export default GradientBackground;
