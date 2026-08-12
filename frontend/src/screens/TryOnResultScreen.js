import React, { useContext } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { AnalysisContext } from '../context/AnalysisContext';
import AppButton from '../components/AppButton';

const TryOnResultScreen = ({ route, navigation }) => {
  const { resultImageUrl, originalPhotoUri } = route.params || {};
  const { setAnalysisResult, setSelectedProduct } = useContext(AnalysisContext);

  const handleStartOver = () => {
    setAnalysisResult(null);
    setSelectedProduct(null);
    navigation.navigate('SkinAnalysis');
  };

  return (
    <View style={styles.container}>
      {resultImageUrl ? (
        originalPhotoUri ? (
          <View style={styles.compareRow}>
            <View style={styles.compareColumn}>
              <Text style={styles.compareLabel}>Before</Text>
              <Image source={{ uri: originalPhotoUri }} style={styles.compareImage} resizeMode="cover" />
            </View>
            <View style={styles.compareColumn}>
              <Text style={styles.compareLabel}>After</Text>
              <Image source={{ uri: resultImageUrl }} style={styles.compareImage} resizeMode="cover" />
            </View>
          </View>
        ) : (
          <Image source={{ uri: resultImageUrl }} style={styles.image} resizeMode="contain" />
        )
      ) : (
        <View style={styles.placeholder}>
          <Text>No result image provided.</Text>
        </View>
      )}

      <View style={styles.controls}>
        <AppButton title="Back to Catalog" variant="secondary" onPress={() => navigation.navigate('ProductCatalog')} />
        <View style={{ height: 10 }} />
        <AppButton title="Start Over" variant="danger" onPress={handleStartOver} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { flex: 1, width: '100%' },
  compareRow: { flex: 1, flexDirection: 'row' },
  compareColumn: { flex: 1 },
  compareLabel: {
    textAlign: 'center',
    paddingVertical: 6,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#F2F2F7',
  },
  compareImage: { flex: 1, width: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  controls: { padding: 16, paddingBottom: 30 }
});

export default TryOnResultScreen;
