import React, { useState, useContext } from 'react';
import { View, Text, Button, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSkinAnalysis } from '../hooks/useSkinAnalysis';
import { AnalysisContext } from '../context/AnalysisContext';
import LoadingSpinner from '../components/LoadingSpinner';
import CameraGuideOverlay from '../components/CameraGuideOverlay';

const SkinAnalysisScreen = ({ navigation }) => {
  const [photoUri, setPhotoUri] = useState(null);
  const { performAnalysis, loading } = useSkinAnalysis();
  const { setAnalysisResult } = useContext(AnalysisContext);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
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
        <Button title="Choose Photo" onPress={pickImage} />
        <View style={{ height: 10 }} />
        <Button title="Analyze" onPress={handleAnalyze} disabled={!photoUri} />
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
});

export default SkinAnalysisScreen;
