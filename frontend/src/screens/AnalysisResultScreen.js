import React, { useContext } from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { AnalysisContext } from '../context/AnalysisContext';
import ColorSwatch from '../components/ColorSwatch';

const AnalysisResultScreen = ({ navigation }) => {
  const { analysisResult } = useContext(AnalysisContext);

  if (!analysisResult) {
    return <View style={styles.container}><Text>No analysis data found.</Text></View>;
  }

  const { skin_color, eye_color, hair_color, undertone, season, palette } = analysisResult;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Color Profile</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Season: <Text style={styles.value}>{season}</Text></Text>
        <Text style={styles.label}>Undertone: <Text style={styles.value}>{undertone}</Text></Text>
      </View>

      <Text style={styles.sectionTitle}>Your Perfect Palette</Text>
      <View style={styles.paletteContainer}>
        {palette && palette.map((color, index) => (
          <View key={index} style={styles.colorItem}>
            <ColorSwatch color={color} size={50} />
            <Text style={styles.colorText}>{color}</Text>
          </View>
        ))}
      </View>

      <Button 
        title="View Recommended Products" 
        onPress={() => navigation.navigate('ProductCatalog')}
        color="#007AFF"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 16, backgroundColor: '#f8f8f8', borderRadius: 8, marginBottom: 20 },
  label: { fontSize: 16, color: '#666', marginBottom: 8 },
  value: { color: '#000', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  paletteContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 30 },
  colorItem: { alignItems: 'center', margin: 8 },
  colorText: { marginTop: 4, fontSize: 12, color: '#333' }
});

export default AnalysisResultScreen;
