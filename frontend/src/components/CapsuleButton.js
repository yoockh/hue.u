import React, { useRef } from 'react';
import { Animated, Pressable, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Full-pill button used everywhere in the redesign (replaces AppButton). Press
// gives a soft scale-down + a deeper shadow via the built-in Animated API on a
// Pressable — no TouchableOpacity, no reanimated dependency.
//
// Variants:
//   primary   pink->blue gradient fill, white label, glass shine on top
//   secondary translucent white glass, teal label + border
//   danger    translucent white glass, red label + border
// Sizes: 'md' (default) and 'sm' (compact, e.g. "Try This Product").
const VARIANTS = {
  primary: { text: colors.onPrimary, glow: colors.shadowPink, gradient: true },
  secondary: { text: colors.secondaryStrong, glow: colors.shadowBlue, border: colors.secondary },
  danger: { text: colors.error, glow: colors.error, border: colors.error },
};

const SIZES = {
  md: { paddingVertical: 15, paddingHorizontal: 22, fontSize: 16, iconSize: 18, radius: 999 },
  sm: { paddingVertical: 9, paddingHorizontal: 14, fontSize: 12, iconSize: 15, radius: 999 },
};

const CapsuleButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const scale = useRef(new Animated.Value(1)).current;
  const pressed = useRef(new Animated.Value(0)).current;

  const animateTo = (toScale, toPressed) => {
    Animated.parallel([
      Animated.spring(scale, { toValue: toScale, useNativeDriver: true, speed: 40, bounciness: 6 }),
      Animated.timing(pressed, { toValue: toPressed, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const isDisabled = disabled || loading;

  // Shadow deepens on press for a tactile lift.
  const shadowOpacity = pressed.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.15] });

  const label = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator size="small" color={v.text} style={styles.icon} />
      ) : icon ? (
        <Ionicons name={icon} size={s.iconSize} color={v.text} style={styles.icon} />
      ) : null}
      <Text style={[typography.button, { color: v.text, fontSize: s.fontSize }, textStyle]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );

  const innerPad = { paddingVertical: s.paddingVertical, paddingHorizontal: s.paddingHorizontal };

  return (
    <Animated.View
      style={[
        styles.shadow,
        { shadowColor: v.glow, shadowOpacity, borderRadius: s.radius },
        isDisabled && styles.disabled,
        { transform: [{ scale }] },
        style,
      ]}
    >
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        onPressIn={() => !isDisabled && animateTo(0.96, 1)}
        onPressOut={() => !isDisabled && animateTo(1, 0)}
        disabled={isDisabled}
        style={[styles.clip, { borderRadius: s.radius }]}
        accessibilityRole="button"
      >
        {v.gradient ? (
          <LinearGradient
            colors={colors.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.fill, innerPad]}
          >
            {/* Glass shine on the top half. */}
            <LinearGradient
              colors={[colors.shine, 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.shine}
              pointerEvents="none"
            />
            {label}
          </LinearGradient>
        ) : (
          <View style={[styles.fill, styles.glass, innerPad, { borderColor: v.border }]}>
            {label}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
    alignSelf: 'stretch',
  },
  disabled: { opacity: 0.45 },
  clip: { overflow: 'hidden' },
  fill: { alignItems: 'center', justifyContent: 'center' },
  glass: {
    backgroundColor: colors.glassFillStrong,
    borderWidth: 1.5,
  },
  // Top-half highlight; sits above the gradient, below the label.
  shine: { position: 'absolute', top: 0, left: 0, right: 0, height: '55%' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: 7 },
});

export default CapsuleButton;
