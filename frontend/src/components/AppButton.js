import React from 'react';
import CapsuleButton from './CapsuleButton';

// Backward-compatible alias: AppButton keeps its original API (title, onPress,
// variant, disabled, style) but now renders the redesigned CapsuleButton, so
// every existing screen picks up the glass-lollipop button without changes.
// New code can import CapsuleButton directly for the extra props (size, icon,
// loading).
const AppButton = ({ title, onPress, variant = 'primary', disabled = false, style }) => (
  <CapsuleButton
    title={title}
    onPress={onPress}
    variant={variant}
    disabled={disabled}
    style={style}
  />
);

export default AppButton;
