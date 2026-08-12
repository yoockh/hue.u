import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScanningAvatar from '../components/ScanningAvatar';
import AppButton from '../components/AppButton';
import colors from '../constants/colors';
import typography from '../constants/typography';

const avatarImage = require('../../assets/images/avatar.png');
const ILLUSTRATION_HEIGHT = 280;

// Home tab. Opens the app: hero illustration (with a help shortcut to the
// education screen) and the primary CTA into the existing analysis flow.
const DashboardScreen = ({ navigation }) => (
  <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.illustrationCard}>
        <ScanningAvatar source={avatarImage} height={ILLUSTRATION_HEIGHT} />
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => navigation.navigate('AboutSkinTone')}
          accessibilityRole="button"
          accessibilityLabel="Learn about skin tone"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="help" size={20} color={colors.primaryStrong} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Discover your season</Text>
      <Text style={styles.subtitle}>
        Analyze your skin tone to reveal the color palette that flatters you most.
      </Text>

      <AppButton
        title="Start Analyze Your Skin"
        onPress={() => navigation.navigate('SkinAnalysis')}
      />
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  illustrationCard: {
    height: ILLUSTRATION_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 28,
    position: 'relative',
  },
  helpButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  title: { ...typography.hero, color: colors.text, marginBottom: 8, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: 28 },
});

export default DashboardScreen;
