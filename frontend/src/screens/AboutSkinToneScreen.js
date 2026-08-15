import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import GlassCard from '../components/GlassCard';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Education screen opened from the dashboard "?" button. Presented as a modal in
// the root stack, so it deliberately has no bottom tabs.
//
// Content is written as GENERAL educational background on seasonal color
// analysis (its history, how undertone is commonly assessed) plus a list of
// general references — NOT verbatim quotes or specific claims attributed to a
// source. Kept mobile-friendly: clear headings, short paragraphs.
//
// Visuals: sits on the shared pastel GradientBackground and uses GlassCard for
// every card, consistent with the rest of the app (previously a solid pink
// screen with solid white cards).

// General educational references (not direct quotations).
const REFERENCES = [
  'Carole Jackson, "Color Me Beautiful" (1980s) — popularized the 4-season approach.',
  'Johannes Itten — color theory and seasonal color contrast studies.',
  'Modern personal-styling & image-consulting practice — 12- and 16-season systems.',
];

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
  <GlassCard style={styles.card} padding={16} radius={16} intensity={36}>
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
  </GlassCard>
);

const SeasonRow = ({ name, hex, description }) => (
  <GlassCard
    style={styles.seasonRow}
    contentStyle={styles.seasonRowContent}
    padding={12}
    radius={14}
    intensity={32}
  >
    <View style={[styles.seasonCircle, { backgroundColor: hex }]} />
    <View style={styles.seasonText}>
      <Text style={styles.seasonName}>{name}</Text>
      <Text style={styles.seasonDesc}>{description}</Text>
    </View>
  </GlassCard>
);

const AboutSkinToneScreen = () => (
  <GradientBackground>
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

      <Text style={styles.heading}>How undertone is commonly assessed</Text>
      <Text style={styles.paragraph}>
        Beyond a lab measurement, stylists often use quick visual cues as a rough
        guide. These are informal rules of thumb, not exact science:
      </Text>
      <Text style={styles.bullet}>
        • <Text style={styles.bulletLead}>Wrist veins.</Text> Veins that look more
        green tend to suggest a warm undertone; veins that look more blue or purple
        tend to suggest a cool undertone. A mix can point to neutral.
      </Text>
      <Text style={styles.bullet}>
        • <Text style={styles.bulletLead}>Gold vs. silver jewelry.</Text> If gold
        tends to flatter your skin more, that often leans warm; if silver looks
        cleaner against your skin, that often leans cool. Feeling good in both can
        indicate neutral.
      </Text>
      <Text style={styles.paragraph}>
        Hue.U doesn't rely on these cues — it measures your actual skin, hair, and
        eye colors from your photo — but they're a helpful way to sanity-check your
        result.
      </Text>

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

      <Text style={styles.heading}>Where seasonal color analysis comes from</Text>
      <Text style={styles.paragraph}>
        The idea of grouping flattering colors traces back to early color theory —
        notably the work of <Text style={styles.emph}>Johannes Itten</Text>, who
        linked palettes of warm and cool colors to the feel of the seasons.
      </Text>
      <Text style={styles.paragraph}>
        In the 1980s, <Text style={styles.emph}>Carole Jackson</Text> popularized
        this for a wide audience with the book{' '}
        <Text style={styles.emph}>"Color Me Beautiful,"</Text> which framed the
        familiar four-season system (Spring, Summer, Autumn, Winter).
      </Text>
      <Text style={styles.paragraph}>
        Modern personal styling has since expanded it into more granular
        12-season and 16-season systems, adding sub-categories for depth,
        chroma, and contrast. Hue.U keeps the approachable four-season model.
      </Text>

      <Text style={styles.heading}>References</Text>
      <Text style={styles.paragraph}>
        General educational background — provided for further reading, not as
        direct quotations:
      </Text>
      <View style={styles.refList}>
        {REFERENCES.map((r, i) => (
          <Text key={i} style={styles.refItem}>• {r}</Text>
        ))}
      </View>

      <Text style={styles.footnote}>
        Educational content adapted from general principles of seasonal color
        analysis, a method used in personal styling and color consulting.
      </Text>
    </ScrollView>
  </GradientBackground>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 20, paddingBottom: 40 },
  title: { ...typography.hero, color: colors.text, marginBottom: 20 },
  heading: { ...typography.sectionTitle, color: colors.text, marginTop: 12, marginBottom: 10 },
  paragraph: { ...typography.body, color: colors.textSecondary, marginBottom: 12 },
  bullet: { ...typography.body, color: colors.textSecondary, marginBottom: 10, paddingLeft: 2 },
  bulletLead: { color: colors.text, fontWeight: '700' },
  emph: { color: colors.primaryStrong, fontWeight: '700' },
  refList: { marginBottom: 8 },
  refItem: { ...typography.body, fontSize: 14, color: colors.textSecondary, marginBottom: 8 },

  card: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginRight: 12,
  },
  cardHeaderText: { flex: 1 },
  cardTitle: { ...typography.sectionTitle, color: colors.text },
  hex: { ...typography.caption, color: colors.textSecondary },
  cardDesc: { ...typography.body, color: colors.text, marginBottom: 6 },
  matchLabel: { ...typography.label, color: colors.textSecondary },
  matchValue: { color: colors.text, fontWeight: '400' },

  seasonList: { marginTop: 4, marginBottom: 8 },
  seasonRow: { marginBottom: 10 },
  seasonRowContent: { flexDirection: 'row', alignItems: 'center' },
  seasonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginRight: 12,
  },
  seasonText: { flex: 1 },
  seasonName: { ...typography.sectionTitle, color: colors.text },
  seasonDesc: { ...typography.label, color: colors.textSecondary },

  footnote: { ...typography.caption, color: colors.textSecondary, marginTop: 16, fontStyle: 'italic' },
});

export default AboutSkinToneScreen;
