import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { AnalysisContext } from '../context/AnalysisContext';
import { useAlert } from '../context/AlertContext';
import { useTryOn } from '../hooks/useTryOn';
import LoadingSpinner from '../components/LoadingSpinner';
import AppButton from '../components/AppButton';
import colors from '../constants/colors';
import typography from '../constants/typography';

const UploadFullBodyScreen = ({ navigation }) => {
  const [photoUri, setPhotoUri] = useState(null);
  const { selectedProduct } = useContext(AnalysisContext);
  const { performTryOn, loading } = useTryOn();
  const { showAlert } = useAlert();

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
    if (!photoUri) {
      showAlert({ type: 'info', title: 'Select a photo', message: 'Please select a full body photo.' });
      return;
    }
    if (!selectedProduct) {
      showAlert({ type: 'info', title: 'No product selected', message: 'Please pick a product to try on first.' });
      return;
    }

    try {
      const result = await performTryOn(photoUri, selectedProduct.image_url, selectedProduct.garment_category);
      navigation.navigate('TryOnResult', { resultImageUrl: result.data.url, originalPhotoUri: photoUri });
    } catch (e) {
      showAlert({ type: 'error', title: 'Try-On Failed', message: e.message });
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
            <View style={styles.illustrationBadge}>
              <Ionicons name="body-outline" size={44} color={colors.primaryStrong} />
            </View>
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
  illustrationBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  placeholderText: { ...typography.body, color: colors.textSecondary },
  controls: { paddingBottom: 20 }
});

export default UploadFullBodyScreen;
