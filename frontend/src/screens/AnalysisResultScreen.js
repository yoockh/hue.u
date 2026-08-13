import React, { useContext, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { AnalysisContext } from '../context/AnalysisContext';
import { useAlert } from '../context/AlertContext';
import ColorSwatch from '../components/ColorSwatch';
import ColorCard from '../components/ColorCard';
import AppButton from '../components/AppButton';
import colors from '../constants/colors';
import typography from '../constants/typography';

const AnalysisResultScreen = ({ navigation }) => {
  const { analysisResult, setMatchIntent } = useContext(AnalysisContext);
  const { showAlert } = useAlert();
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  if (!analysisResult) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>No analysis data found.</Text>
        <AppButton title="Start a New Analysis" onPress={() => navigation.navigate('SkinAnalysis')} />
      </View>
    );
  }

  const { classification, recommendations, analysis } = analysisResult.data;
  const { season, undertone } = classification;
  const palette = recommendations.palette;
  const rawColors = [
    { label: 'Skin', hex: analysis?.skin_color },
    { label: 'Hair', hex: analysis?.hair_color },
    { label: 'Eyes', hex: analysis?.eye_color },
  ].filter((c) => c.hex);

  // Jump straight to the Product tab with the tone filter pre-applied for THIS
  // result's season — the source is already known, so skip the last-scan dialog.
  const handleFindMatches = () => {
    setMatchIntent({ mode: 'filter', season });
    navigation.navigate('Tabs', { screen: 'Product' });
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const uri = await cardRef.current.capture();
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        showAlert({ type: 'info', title: 'Sharing unavailable', message: 'Sharing is not supported on this device.' });
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png' });
    } catch (e) {
      showAlert({ type: 'error', title: 'Share Failed', message: e.message || 'Could not create your color card.' });
    } finally {
      setSharing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Color Profile</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Season: <Text style={styles.value}>{season}</Text></Text>
        <Text style={styles.label}>Undertone: <Text style={styles.value}>{undertone}</Text></Text>
        {recommendations.explanation ? (
          <Text style={styles.explanation}>{recommendations.explanation}</Text>
        ) : null}
      </View>

      {rawColors.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Your Analyzed Colors</Text>
          <Text style={styles.sectionSubtitle}>
            The actual skin, hair, and eye colors detected from your photo.
          </Text>
          <View style={styles.paletteContainer}>
            {rawColors.map((c) => (
              <View key={c.label} style={styles.colorItem}>
                <ColorSwatch color={c.hex} size={50} />
                <Text style={styles.colorText}>{c.label}</Text>
                <Text style={styles.hexText}>{c.hex}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Your Perfect Palette</Text>
      <View style={styles.paletteContainer}>
        {palette && palette.map((color, index) => (
          <View key={index} style={styles.colorItem}>
            <ColorSwatch color={color.hex} size={50} />
            <Text style={styles.colorText}>{color.name}</Text>
          </View>
        ))}
      </View>

      {palette && palette.length > 0 && (
        <View style={styles.shareSection}>
          <Text style={styles.sectionTitle}>Share Your Color Card</Text>
          <ViewShot ref={cardRef} options={{ format: 'png', quality: 0.9 }}>
            <ColorCard season={season} palette={palette} />
          </ViewShot>
          <View style={styles.shareButtonSpacing}>
            <AppButton
              title={sharing ? 'Preparing...' : 'Share my color card'}
              variant="secondary"
              onPress={handleShare}
              disabled={sharing}
            />
          </View>
        </View>
      )}

      <AppButton
        title="Find Matching Products"
        onPress={handleFindMatches}
      />
      <View style={styles.secondaryCta}>
        <AppButton
          title="View Recommended Products"
          variant="secondary"
          onPress={() => navigation.navigate('ProductCatalog')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...typography.body, color: colors.textSecondary, marginBottom: 16 },
  title: { ...typography.hero, color: colors.text, marginBottom: 20 },
  card: {
    padding: 18,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  label: { ...typography.body, color: colors.textSecondary, marginBottom: 8, textTransform: 'capitalize' },
  value: { color: colors.primaryStrong, fontWeight: '800' },
  explanation: { ...typography.body, fontSize: 14, color: colors.text, marginTop: 8 },
  sectionTitle: { ...typography.sectionTitle, color: colors.text, marginBottom: 4 },
  sectionSubtitle: { ...typography.caption, fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
  paletteContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 30 },
  colorItem: { alignItems: 'center', margin: 8 },
  colorText: { marginTop: 4, ...typography.caption, color: colors.text },
  hexText: { ...typography.caption, fontSize: 11, color: colors.textSecondary },
  shareSection: { marginBottom: 30 },
  shareButtonSpacing: { marginTop: 16 },
  secondaryCta: { marginTop: 12, marginBottom: 8 }
});

export default AnalysisResultScreen;
