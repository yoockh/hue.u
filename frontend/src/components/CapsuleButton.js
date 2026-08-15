import React, { useRef } from 'react';
import { Animated, Pressable, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Full-pill button used everywhere (replaces AppButton). Press gives a soft
// scale-down via the built-in Animated API on a Pressable — no reanimated dep.
//
// Variants (all SOLID fills — never a bordered inner View, which clips into
// broken "bracket" fragments inside the rounded pill):
//   primary   — #FF4D8D -> #5AC8FA horizontal gradient, white label.
//   secondary — SOLID #2DBEBE block, white label, NO border, soft teal shadow.
//   danger    — SOLID red block, white label, NO border (same pattern).
//
// IMPORTANT: there is intentionally NO borderWidth anywhere in this component.
// A previous version put a 1px border on a non-rounded inner View that the
// rounded parent clipped, so the border only showed on part of the edge. Solid
// fills clip cleanly into the capsule, so no border is used at all.
const VARIANTS = {
  primary: { text: '#FFFFFF', glow: colors.shadowPink, gradient: true },
  secondary: { text: '#FFFFFF', fill: colors.buttonSecondary, glow: colors.buttonSecondary },
  danger: { text: '#FFFFFF', fill: colors.error, glow: colors.error },
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

  const animateTo = (toScale) => {
    Animated.spring(scale, { toValue: toScale, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  const isDisabled = disabled || loading;

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
        // Soft tinted glow for depth — on a solid same-color fill this reads as
        // depth, never as a border.
        { shadowColor: v.glow, borderRadius: s.radius },
        isDisabled && styles.disabled,
        { transform: [{ scale }] },
        style,
      ]}
    >
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        onPressIn={() => !isDisabled && animateTo(0.96)}
        onPressOut={() => !isDisabled && animateTo(1)}
        disabled={isDisabled}
        style={[styles.clip, { borderRadius: s.radius }]}
        accessibilityRole="button"
      >
        {v.gradient ? (
          <LinearGradient
            colors={colors.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
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
          // SOLID block fill — one flat color, no border, no gradient.
          <View style={[styles.fill, innerPad, { backgroundColor: v.fill }]}>
            {label}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
    alignSelf: 'stretch',
  },
  disabled: { opacity: 0.45 },
  clip: { overflow: 'hidden' },
  fill: { alignItems: 'center', justifyContent: 'center' },
  // Top-half highlight; sits above the gradient, below the label.
  shine: { position: 'absolute', top: 0, left: 0, right: 0, height: '55%' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: 7 },
});

export default CapsuleButton;
