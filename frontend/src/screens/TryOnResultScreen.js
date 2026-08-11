import React, { useContext } from 'react';
import { View, StyleSheet, Image, Button, Text } from 'react-native';
import { AnalysisContext } from '../context/AnalysisContext';
import colors from '../constants/colors';

const TryOnResultScreen = ({ route, navigation }) => {
  const { resultImageUrl } = route.params || {};
  const { setAnalysisResult, setSelectedProduct } = useContext(AnalysisContext);

  const handleStartOver = () => {
    setAnalysisResult(null);
    setSelectedProduct(null);
    navigation.navigate('SkinAnalysis');
  };

  return (
    <View style={styles.container}>
      {resultImageUrl ? (
        <Image source={{ uri: resultImageUrl }} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={styles.placeholder}>
          <Text>No result image provided.</Text>
        </View>
      )}

      <View style={styles.controls}>
        <Button title="Back to Catalog" onPress={() => navigation.navigate('ProductCatalog')} />
        <View style={{ height: 10 }} />
        <Button title="Start Over" onPress={handleStartOver} color={colors.error} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { flex: 1, width: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  controls: { padding: 16, paddingBottom: 30 }
});

export default TryOnResultScreen;
