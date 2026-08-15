import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Bell, BellOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Header bell shown top-right on the main tab screens. Pure UI: tapping it opens
// a small glass dropdown that currently just says there are no notifications —
// there's no backend/notification logic behind it yet.
const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.trigger}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
      >
        <Bell size={22} color={colors.primaryStrong} strokeWidth={2.2} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        {/* Tap-anywhere backdrop to dismiss. */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {/* Anchored under the header, top-right. Stop propagation so taps on the
              card don't dismiss. */}
          <Pressable
            style={[styles.dropdown, { top: insets.top + 52 }]}
            onPress={() => {}}
          >
            <View style={styles.clip}>
              <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
              <View style={[StyleSheet.absoluteFill, styles.tint]} />
              <View style={styles.content}>
                <Text style={styles.title}>Notifications</Text>
                <View style={styles.emptyRow}>
                  <BellOff size={30} color={colors.textSecondary} strokeWidth={1.8} />
                  <Text style={styles.emptyText}>No notifications yet</Text>
                  <Text style={styles.emptySub}>We'll let you know when something's here.</Text>
                </View>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  backdrop: { flex: 1 },
  dropdown: {
    position: 'absolute',
    right: 12,
    width: 260,
    borderRadius: 20,
    shadowColor: colors.shadowPink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 10,
  },
  clip: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  tint: { backgroundColor: colors.glassFillStrong },
  content: { padding: 16 },
  title: { ...typography.sectionTitle, color: colors.text, marginBottom: 12 },
  emptyRow: { alignItems: 'center', paddingVertical: 12 },
  emptyText: { ...typography.body, fontWeight: '700', color: colors.text, marginTop: 8 },
  emptySub: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
});

export default NotificationBell;
