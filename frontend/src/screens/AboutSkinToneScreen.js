import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Education screen opened from the dashboard "?" button. Presented as a modal in
// the root stack, so it deliberately has no bottom tabs.
// Content is fixed/provided — do not add claims beyond what's written here.

const UNDERTONES = [
  {
    name: 'Warm Undertone',
    hex: '#E8A854',
    description: 'Leans toward golden, peach, or yellow.',
    match: 'Earthy tones, coral, mustard, and other warm colors.',
  },
  {
    name: 'Cool Undertone',
    hex: '#D88EA8',
    description: 'Leans toward pink, red, or blue.',
    match: 'Cool pastels, jewel tones, and bold black-and-white combinations.',
  },
  {
    name: 'Neutral Undertone',
    hex: '#C9A98C',
    description: 'A balanced mix of warm and cool characteristics.',
    match: 'Flexible across many colors, depending on whether you lean slightly warm or cool.',
  },
];

const SEASONS = [
  { name: 'Spring', hex: '#FF7F50', description: 'Warm + high contrast — bright, warm colors.' },
  { name: 'Autumn', hex: '#B5651D', description: 'Warm + low contrast — deeper, earthy warm colors.' },
  { name: 'Winter', hex: '#4169E1', description: 'Cool + high contrast — sharp, clear colors.' },
  { name: 'Summer', hex: '#A0C4D4', description: 'Cool + low contrast — soft, cool colors.' },
];

const UndertoneCard = ({ name, hex, description, match }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={[styles.circle, { backgroundColor: hex }]} />
      <View style={styles.cardHeaderText}>
        <Text style={styles.cardTitle}>{name}</Text>
        <Text style={styles.hex}>{hex}</Text>
      </View>
    </View>
    <Text style={styles.cardDesc}>{description}</Text>
    <Text style={styles.matchLabel}>
      Flatters: <Text style={styles.matchValue}>{match}</Text>
    </Text>
  </View>
);

const SeasonRow = ({ name, hex, description }) => (
  <View style={styles.seasonRow}>
    <View style={[styles.seasonCircle, { backgroundColor: hex }]} />
    <View style={styles.seasonText}>
      <Text style={styles.seasonName}>{name}</Text>
      <Text style={styles.seasonDesc}>{description}</Text>
    </View>
  </View>
);

const AboutSkinToneScreen = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <Text style={styles.title}>Understanding Your Skin Tone</Text>

    <Text style={styles.heading}>What is skin undertone?</Text>
    <Text style={styles.paragraph}>
      Your undertone is the base color beneath the surface of your skin. It comes
      from your natural pigments — melanin, hemoglobin, and carotene. Unlike your
      surface skin color, which can change with sun exposure or the seasons, your
      undertone stays the same throughout your life.
    </Text>

    <Text style={styles.heading}>The three undertone categories</Text>
    {UNDERTONES.map((u) => (
      <UndertoneCard key={u.name} {...u} />
    ))}

    <Text style={styles.heading}>The four seasons</Text>
    <Text style={styles.paragraph}>
      Hue.U classifies you into one of four seasons based on your undertone
      (warm / cool / neutral) and the contrast (high or low) between your skin,
      hair, and eyes.
    </Text>
    <View style={styles.seasonList}>
      {SEASONS.map((s) => (
        <SeasonRow key={s.name} {...s} />
      ))}
    </View>

    <Text style={styles.footnote}>
      Educational content adapted from general principles of seasonal color
      analysis, a method used in personal styling and color consulting.
    </Text>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { ...typography.hero, color: colors.text, marginBottom: 20 },
  heading: { ...typography.sectionTitle, color: colors.text, marginTop: 12, marginBottom: 10 },
  paragraph: { ...typography.body, color: colors.textSecondary, marginBottom: 12 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
  },
  cardHeaderText: { flex: 1 },
  cardTitle: { ...typography.sectionTitle, color: colors.text },
  hex: { ...typography.caption, color: colors.textSecondary },
  cardDesc: { ...typography.body, color: colors.text, marginBottom: 6 },
  matchLabel: { ...typography.label, color: colors.textSecondary },
  matchValue: { color: colors.text, fontWeight: '400' },

  seasonList: { marginTop: 4, marginBottom: 8 },
  seasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  seasonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
  },
  seasonText: { flex: 1 },
  seasonName: { ...typography.sectionTitle, color: colors.text },
  seasonDesc: { ...typography.label, color: colors.textSecondary },

  footnote: { ...typography.caption, color: colors.textSecondary, marginTop: 16, fontStyle: 'italic' },
});

export default AboutSkinToneScreen;
