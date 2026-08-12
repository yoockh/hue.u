import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useSkinAnalysis } from '../hooks/useSkinAnalysis';
import { AnalysisContext } from '../context/AnalysisContext';
import LoadingSpinner from '../components/LoadingSpinner';
import CameraGuideOverlay from '../components/CameraGuideOverlay';
import AppButton from '../components/AppButton';

const SkinAnalysisScreen = ({ navigation }) => {
  const [photoUri, setPhotoUri] = useState(null);
  const { performAnalysis, loading } = useSkinAnalysis();
  const { setAnalysisResult } = useContext(AnalysisContext);

  // Downscale/compress before upload so both sources produce a consistent,
  // reasonably sized image for the backend.
  const processAndSet = async (uri) => {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    setPhotoUri(manipResult.uri);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        'Photo access needed',
        'Hue.U needs permission to open your photo library. You can enable it in Settings.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      await processAndSet(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        'Camera access needed',
        'Hue.U needs permission to use your camera. You can enable it in Settings.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      await processAndSet(result.assets[0].uri);
    }
  };

  const handleAnalyze = async () => {
    if (!photoUri) return Alert.alert('Error', 'Please select a photo first');
    try {
      const result = await performAnalysis(photoUri);
      setAnalysisResult(result);
      navigation.navigate('AnalysisResult');
    } catch (e) {
      Alert.alert('Analysis Failed', e.message);
    }
  };

  return (
    <View style={styles.container}>
      {loading && <LoadingSpinner message="Analyzing skin tone and palette..." />}
      
      <View style={styles.imageContainer}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No photo selected</Text>
          </View>
        )}
        <CameraGuideOverlay instructions="Align your face and shoulders within the frame in good lighting." />
      </View>

      <View style={styles.controls}>
        <View style={styles.sourceRow}>
          <AppButton title="Take Photo" variant="secondary" onPress={takePhoto} disabled={loading} style={styles.sourceButton} />
          <AppButton title="Choose from Gallery" variant="secondary" onPress={pickImage} disabled={loading} style={styles.sourceButton} />
        </View>
        <View style={{ height: 12 }} />
        <AppButton title="Analyze My Colors" onPress={handleAnalyze} disabled={!photoUri || loading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  imageContainer: { flex: 1, marginBottom: 20, borderRadius: 12, overflow: 'hidden', backgroundColor: '#e1e1e1' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#666' },
  controls: { paddingBottom: 20 },
  sourceRow: { flexDirection: 'row', gap: 12 },
  sourceButton: { flex: 1 },
});

export default SkinAnalysisScreen;
