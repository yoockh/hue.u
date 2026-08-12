import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Reusable placeholder for tabs/screens that aren't built yet (History, Product).
// Styled to the design system so the empty states still feel on-brand.
const ComingSoon = ({ icon = 'sparkles-outline', title, message = 'Coming soon' }) => (
  <View style={styles.container}>
    <View style={styles.badge}>
      <Ionicons name={icon} size={44} color={colors.primaryStrong} />
    </View>
    {title ? <Text style={styles.title}>{title}</Text> : null}
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { ...typography.title, color: colors.text, marginBottom: 6 },
  message: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});

export default ComingSoon;
