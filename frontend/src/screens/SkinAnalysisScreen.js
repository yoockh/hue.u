import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { useSkinAnalysis } from '../hooks/useSkinAnalysis';
import { AnalysisContext } from '../context/AnalysisContext';
import { useAlert } from '../context/AlertContext';
import ScanningOverlay from '../components/ScanningOverlay';
import GradientBackground from '../components/GradientBackground';
import AppButton from '../components/AppButton';
import colors from '../constants/colors';
import typography from '../constants/typography';

const SkinAnalysisScreen = ({ navigation }) => {
  const [photoUri, setPhotoUri] = useState(null);
  const { performAnalysis, loading } = useSkinAnalysis();
  const { setAnalysisResult, matchIntent } = useContext(AnalysisContext);
  const { showAlert } = useAlert();

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
      showAlert({
        type: 'info',
        title: 'Photo access needed',
        message: 'Hue.U needs permission to open your photo library. You can enable it in Settings.',
      });
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
      showAlert({
        type: 'info',
        title: 'Camera access needed',
        message: 'Hue.U needs permission to use your camera. You can enable it in Settings.',
      });
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
    if (!photoUri) {
      showAlert({ type: 'info', title: 'Select a photo', message: 'Please choose or take a photo first.' });
      return;
    }
    try {
      const result = await performAnalysis(photoUri);
      setAnalysisResult(result);
      // When the analysis was launched to feed the Product tab's tone features
      // (a parked matchIntent), return there so it can resume with the fresh
      // season instead of showing the standalone result screen.
      if (matchIntent) {
        navigation.navigate('Tabs', { screen: 'Product' });
      } else {
        navigation.navigate('AnalysisResult');
      }
    } catch (e) {
      showAlert({ type: 'error', title: 'Analysis Failed', message: e.message });
    }
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
      {loading && <ScanningOverlay message="Analyzing your colors..." />}

      <View style={styles.intro}>
        <Text style={styles.eyebrow}>SKIN TONE ANALYSIS</Text>
        <Text style={styles.heroTitle}>Discover your season</Text>
        <Text style={styles.heroSubtitle}>
          Take or upload a clear, well-lit selfie and we'll reveal the color palette that flatters you most.
        </Text>
      </View>

      <View style={[styles.imageContainer, photoUri ? styles.imageContainerFilled : null]}>
        {photoUri ? (
          // Clean photo preview — no overlay. The photo is a finished file
          // from expo-image-picker, NOT a live camera feed — there is nothing
          // to "detect" in real-time. User can retake/replace via the buttons
          // below.
          <Image source={{ uri: photoUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            {/* Face-framing oval — purely a STATIC visual guide to help
                users understand what kind of photo to take. This is NOT
                face detection. */}
            <View style={styles.faceGuide}>
              <Ionicons name="person-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.placeholderTitle}>Add your photo</Text>
            <Text style={styles.placeholderText}>
              Face the camera straight on with your face and shoulders visible, in good lighting.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <View style={styles.sourceRow}>
          <AppButton title="Take Photo" variant="secondary" onPress={takePhoto} disabled={loading} style={styles.sourceButton} />
          <AppButton title="From Gallery" variant="secondary" onPress={pickImage} disabled={loading} style={styles.sourceButton} />
        </View>
        <View style={{ height: 12 }} />
        <AppButton title="Analyze My Colors" onPress={handleAnalyze} disabled={!photoUri || loading} />
      </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'transparent' },
  intro: { marginBottom: 16 },
  eyebrow: { ...typography.caption, color: colors.secondaryStrong, marginBottom: 6 },
  heroTitle: { ...typography.hero, color: colors.text, marginBottom: 6 },
  heroSubtitle: { ...typography.body, color: colors.textSecondary },
  imageContainer: {
    flex: 1,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.glassFillSoft,
    borderWidth: 2,
    borderColor: colors.glassBorder,
    borderStyle: 'dashed',
  },
  // Once a photo is chosen the frame becomes a solid, photo-forward card.
  imageContainerFilled: {
    borderStyle: 'solid',
    borderColor: colors.primary,
    backgroundColor: colors.text,
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  faceGuide: {
    width: 110,
    height: 143,
    borderRadius: 71,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    opacity: 0.55,
  },
  placeholderTitle: { ...typography.sectionTitle, color: colors.text, marginBottom: 6 },
  placeholderText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  controls: { paddingBottom: 20 },
  sourceRow: { flexDirection: 'row', gap: 12 },
  sourceButton: { flex: 1 },
});

export default SkinAnalysisScreen;
