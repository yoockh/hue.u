import React from 'react';
import { View, StyleSheet, Image, Button, Text } from 'react-native';

const TryOnResultScreen = ({ route, navigation }) => {
  const { resultImageUrl } = route.params || {};

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
        <Button title="Start Over" onPress={() => navigation.navigate('SkinAnalysis')} color="#FF3B30" />
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
