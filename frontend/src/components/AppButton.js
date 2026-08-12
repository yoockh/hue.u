import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Brand-styled replacement for React Native's default <Button>, which renders
// as flat platform-blue text/pills that don't carry any app identity.
const VARIANTS = {
  primary: { backgroundColor: colors.primary, borderColor: colors.primary, textColor: colors.onPrimary },
  secondary: { backgroundColor: colors.surface, borderColor: colors.secondary, textColor: colors.secondary },
  danger: { backgroundColor: colors.surface, borderColor: colors.error, textColor: colors.error },
};

const AppButton = ({ title, onPress, variant = 'primary', disabled = false, style }) => {
  const { backgroundColor, borderColor, textColor } = VARIANTS[variant] || VARIANTS.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[styles.base, { backgroundColor, borderColor }, disabled && styles.disabled, style]}
    >
      <Text style={[typography.button, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});

export default AppButton;
