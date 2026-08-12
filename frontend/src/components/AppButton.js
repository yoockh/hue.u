import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Brand-styled replacement for React Native's default <Button>, which renders
// as flat platform-blue text/pills that don't carry any app identity.
// The primary variant uses the deeper `primaryStrong` so white text stays
// accessible; `secondary` uses the darker teal for its label for the same reason.
const VARIANTS = {
  primary: { backgroundColor: colors.primaryStrong, borderColor: colors.primaryStrong, textColor: colors.onPrimary, elevated: true },
  secondary: { backgroundColor: colors.surface, borderColor: colors.secondary, textColor: colors.secondaryStrong, elevated: false },
  danger: { backgroundColor: colors.surface, borderColor: colors.error, textColor: colors.error, elevated: false },
};

const AppButton = ({ title, onPress, variant = 'primary', disabled = false, style }) => {
  const { backgroundColor, borderColor, textColor, elevated } = VARIANTS[variant] || VARIANTS.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.base,
        { backgroundColor, borderColor },
        elevated && styles.elevated,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[typography.button, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    borderWidth: 1.5,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Soft pink lift so the primary CTA feels tactile/premium.
  elevated: {
    shadowColor: colors.primaryStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  disabled: {
    opacity: 0.4,
  },
});

export default AppButton;
