import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AnalysisContext } from '../context/AnalysisContext';
import { useTryOn } from '../hooks/useTryOn';
import LoadingSpinner from '../components/LoadingSpinner';
import AppButton from '../components/AppButton';
import colors from '../constants/colors';
import typography from '../constants/typography';

const UploadFullBodyScreen = ({ navigation }) => {
  const [photoUri, setPhotoUri] = useState(null);
  const { selectedProduct } = useContext(AnalysisContext);
  const { performTryOn, loading } = useTryOn();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleTryOn = async () => {
    if (!photoUri) return Alert.alert('Error', 'Please select a full body photo');
    if (!selectedProduct) return Alert.alert('Error', 'No product selected');

    try {
      const result = await performTryOn(photoUri, selectedProduct.image_url, selectedProduct.garment_category);
      navigation.navigate('TryOnResult', { resultImageUrl: result.data.url, originalPhotoUri: photoUri });
    } catch (e) {
      Alert.alert('Try-On Failed', e.message);
    }
  };

  return (
    <View style={styles.container}>
      {loading && <LoadingSpinner message="Generating virtual try-on..." />}
      
      <Text style={styles.title}>Upload Full Body Photo</Text>
      <Text style={styles.subtitle}>To try on: {selectedProduct?.name}</Text>

      <View style={styles.imageContainer}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>🧍</Text>
            <Text style={styles.placeholderText}>No photo selected</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <AppButton title="Choose Photo" variant="secondary" onPress={pickImage} disabled={loading} />
        <View style={{ height: 10 }} />
        <AppButton title="See Try-On" onPress={handleTryOn} disabled={!photoUri || loading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.label, color: colors.textSecondary, marginBottom: 20 },
  imageContainer: {
    flex: 1,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderIcon: { fontSize: 44, marginBottom: 8 },
  placeholderText: { ...typography.body, color: colors.textSecondary },
  controls: { paddingBottom: 20 }
});

export default UploadFullBodyScreen;
