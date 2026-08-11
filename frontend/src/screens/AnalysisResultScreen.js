import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AnalysisContext } from '../context/AnalysisContext';
import ColorSwatch from '../components/ColorSwatch';
import AppButton from '../components/AppButton';

const AnalysisResultScreen = ({ navigation }) => {
  const { analysisResult } = useContext(AnalysisContext);

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

      <AppButton
        title="View Recommended Products"
        onPress={() => navigation.navigate('ProductCatalog')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 16, backgroundColor: '#f8f8f8', borderRadius: 8, marginBottom: 20 },
  label: { fontSize: 16, color: '#666', marginBottom: 8 },
  value: { color: '#000', fontWeight: 'bold' },
  explanation: { fontSize: 14, color: '#444', marginTop: 8, lineHeight: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#666', marginBottom: 12 },
  paletteContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 30 },
  colorItem: { alignItems: 'center', margin: 8 },
  colorText: { marginTop: 4, fontSize: 12, color: '#333' },
  hexText: { fontSize: 11, color: '#888' }
});

export default AnalysisResultScreen;
