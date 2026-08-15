import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppButton from './AppButton';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Design-system alert dialog that replaces React Native's default Alert.alert.
// Presentational only — visibility/content are driven by props (see the
// AlertProvider + useAlert hook that mount a single instance app-wide).
//
// `type` picks the accent color + icon:
//   error   → red    (alert-circle)
//   success → teal   (checkmark-circle)
//   info    → pink   (information-circle)   [also used for warnings]
const TYPES = {
  error: { color: colors.error, soft: colors.errorSoft, icon: 'alert-circle' },
  success: { color: colors.secondaryStrong, soft: colors.secondarySoft, icon: 'checkmark-circle' },
  info: { color: colors.primaryStrong, soft: colors.primarySoft, icon: 'information-circle' },
};

const CustomAlert = ({ visible, type = 'info', title, message, buttons, onClose }) => {
  const t = TYPES[type] || TYPES.info;
  // Default to a single confirming action when no buttons are supplied.
  const actions = buttons && buttons.length ? buttons : [{ text: 'OK' }];

  const handlePress = (button) => {
    // Fire the caller's handler first, then dismiss, so navigation/state in the
    // handler runs before the alert unmounts.
    if (button.onPress) button.onPress();
    if (onClose) onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Tap the dim backdrop to dismiss. Inner card swallows the press. */}
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          {/* Clear close (X) — applied here so EVERY alert app-wide can be
              dismissed without choosing an action. */}
          <TouchableOpacity
            style={styles.close}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.iconWrap, { backgroundColor: t.soft }]}>
            <Ionicons name={t.icon} size={32} color={t.color} />
          </View>

          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            {actions.map((button, index) => (
              <AppButton
                key={index}
                title={button.text}
                variant={button.variant || (type === 'error' ? 'danger' : 'primary')}
                onPress={() => handlePress(button)}
                style={styles.actionButton}
              />
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.scrim,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  close: { position: 'absolute', top: 12, right: 12, zIndex: 1, padding: 4 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { ...typography.sectionTitle, color: colors.text, textAlign: 'center', marginBottom: 8 },
  message: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  actions: { width: '100%', gap: 10 },
  actionButton: { width: '100%' },
});

export default CustomAlert;
