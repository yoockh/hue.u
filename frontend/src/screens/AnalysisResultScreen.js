import React, { useContext, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { AnalysisContext } from '../context/AnalysisContext';
import { useAlert } from '../context/AlertContext';
import ColorReportCard from '../components/ColorReportCard';
import AppButton from '../components/AppButton';
import GradientBackground from '../components/GradientBackground';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Result screen. The report itself is a SINGLE component (ColorReportCard) that
// is both shown here AND captured for sharing — no more separate "profile" vs
// "share card" designs.
const AnalysisResultScreen = ({ navigation }) => {
  const { analysisResult, analyzedPhotoUri, setMatchIntent } = useContext(AnalysisContext);
  const { showAlert } = useAlert();
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  if (!analysisResult) {
    return (
      <GradientBackground>
        <View style={[styles.content, styles.centered]}>
          <Text style={styles.emptyText}>No analysis data found.</Text>
          <AppButton title="Start a New Analysis" onPress={() => navigation.navigate('SkinAnalysis')} />
        </View>
      </GradientBackground>
    );
  }

  const { season } = analysisResult.data.classification;

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
    <GradientBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* The report is captured exactly as shown. */}
        <ViewShot ref={cardRef} options={{ format: 'png', quality: 0.95 }}>
          <ColorReportCard data={analysisResult.data} photoUri={analyzedPhotoUri} />
        </ViewShot>

        <View style={styles.actions}>
          <AppButton
            title={sharing ? 'Preparing...' : 'Share my color card'}
            variant="secondary"
            onPress={handleShare}
            disabled={sharing}
          />
          <View style={styles.gap} />
          <AppButton title="Find Matching Products" onPress={handleFindMatches} />
          <View style={styles.gap} />
          <AppButton
            title="View Recommended Products"
            variant="secondary"
            onPress={() => navigation.navigate('ProductCatalog')}
          />
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...typography.body, color: colors.textSecondary, marginBottom: 16 },
  actions: { marginTop: 20 },
  gap: { height: 12 },
});

export default AnalysisResultScreen;
