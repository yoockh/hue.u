import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import colors from '../constants/colors';

// Frosted-glass surface used for every card/panel in the redesign. Layered:
//   1. an outer wrapper that carries the soft tinted glow (needs overflow
//      visible, so the shadow isn't clipped),
//   2. a clipping layer with the rounded corners + 1px highlight border,
//   3. a BlurView (real blur) + a white tint over it,
//   4. the children on top.
//
// Props:
//   intensity  blur strength (default 40; pass lower for long lists on Android)
//   tint       BlurView tint ('light' default; 'dark' for panels over photos)
//   fill       tint color over the blur (defaults to the light glass fill)
//   radius     corner radius (default 28)
//   glow       'pink' | 'blue' | 'none' — tinted shadow color (default 'pink')
//   padding    inner padding (default 16)
const GlassCard = ({
  children,
  style,
  contentStyle,
  intensity = 50,
  tint = 'light',
  fill,
  border,
  radius = 24,
  glow = 'pink',
  padding = 16,
}) => {
  const resolvedFill = fill || (tint === 'dark' ? colors.glassTintDark : colors.glassFill);
  const resolvedBorder = border || (tint === 'dark' ? colors.glassBorderDark : colors.glassBorder);
  const shadowColor = glow === 'blue' ? colors.shadowBlue : colors.shadowPink;
  // Spec: BlurView intensity must be >= 50. experimentalBlurMethod is REQUIRED
  // for a real blur on Android — without it expo-blur's own docs say it "falls
  // back to a semi-transparent view instead of rendering a blur effect" (i.e. a
  // flat box). See the honest caveat in the PR: over a smooth gradient the blur
  // is subtle by nature; the tint + white border + soft shadow do the lifting.
  const blurIntensity = Math.max(50, intensity);

  return (
    <View style={[styles.shadow, glow !== 'none' && { shadowColor }, { borderRadius: radius }, style]}>
      <View style={[styles.clip, { borderRadius: radius, borderColor: resolvedBorder }]}>
        <BlurView
          intensity={blurIntensity}
          tint={tint}
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: resolvedFill }]} />
        <View style={[{ padding }, contentStyle]}>{children}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Tinted glow. shadowColor is set per-instance; kept soft and wide.
  shadow: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 4,
  },
  clip: {
    overflow: 'hidden',
    borderWidth: 1,
  },
});

export default GlassCard;
