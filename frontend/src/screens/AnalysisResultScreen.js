import React, { useContext } from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { AnalysisContext } from '../context/AnalysisContext';
import ColorSwatch from '../components/ColorSwatch';
import colors from '../constants/colors';

const AnalysisResultScreen = ({ navigation }) => {
  const { analysisResult } = useContext(AnalysisContext);

  if (!analysisResult) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>No analysis data found.</Text>
        <Button title="Start a New Analysis" onPress={() => navigation.navigate('SkinAnalysis')} />
      </View>
    );
  }

  const { classification, recommendations, analysis } = analysisResult.data;
  const { season, undertone } = classification;
  const palette = recommendations.palette;

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

      <Text style={styles.sectionTitle}>Your Perfect Palette</Text>
      <View style={styles.paletteContainer}>
        {palette && palette.map((color, index) => (
          <View key={index} style={styles.colorItem}>
            <ColorSwatch color={color.hex} size={50} />
            <Text style={styles.colorText}>{color.name}</Text>
          </View>
        ))}
      </View>

      <Button 
        title="View Recommended Products" 
        onPress={() => navigation.navigate('ProductCatalog')}
        color={colors.primary}
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
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  paletteContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 30 },
  colorItem: { alignItems: 'center', margin: 8 },
  colorText: { marginTop: 4, fontSize: 12, color: '#333' }
});

export default AnalysisResultScreen;
