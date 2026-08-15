import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';

// Full-screen pastel wash used as the base of every screen. Vertical (180deg,
// top -> bottom): #FFE8F0 at the top -> #E8F0FF at the bottom. Children on top.
const GradientBackground = ({ children, style }) => (
  <LinearGradient
    colors={colors.gradientBackground}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={[styles.fill, style]}
  >
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  fill: { flex: 1 },
});

export default GradientBackground;
