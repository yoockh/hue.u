import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CameraGuideOverlay from '../components/CameraGuideOverlay';
import CapsuleButton from '../components/CapsuleButton';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Full-screen custom camera for the guided selfie flow. Unlike expo-image-picker
// (which only hands back a finished photo), a live CameraView lets us draw the
// face-framing guide ON the live preview so the user can line up their face
// BEFORE the shutter fires.
//
// TAHAP 1: manual shutter only. The captured photo is returned to
// SkinAnalysisScreen via navigation params (capturedPhotoUri) and shown clean
// there. Auto-capture / live face detection is added in a later stage on top of
// this same screen (the capture path below is written to be reused by it).
const CustomCameraScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('front');
  const [isReady, setIsReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef(null);
  const insets = useSafeAreaInsets();

  // Take a still and hand it back to the analysis screen. Guarded so it can't
  // fire before the camera is ready or while a capture is already in flight.
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !isReady || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      navigation.navigate('SkinAnalysis', {
        capturedPhotoUri: photo.uri,
        capturedWidth: photo.width,
        capturedHeight: photo.height,
      });
    } catch (e) {
      // Leave the user on the camera so they can retry; reset the busy flag.
      console.warn('Capture failed:', e?.message);
    } finally {
      setCapturing(false);
    }
  }, [isReady, capturing, navigation]);

  // Permission still resolving on first mount.
  if (!permission) {
    return <View style={styles.blackFill} />;
  }

  // Permission not yet granted — ask for it with an on-theme prompt.
  if (!permission.granted) {
    return (
      <View style={[styles.permissionWrap, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.circleBtn, styles.closeBtn, { top: insets.top + 12 }]}
          accessibilityRole="button"
          accessibilityLabel="Close camera"
          hitSlop={10}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
        <View style={styles.permissionCard}>
          <Ionicons name="camera-outline" size={44} color={colors.primaryStrong} />
          <Text style={styles.permissionTitle}>Camera access needed</Text>
          <Text style={styles.permissionText}>
            Hue.U uses your camera to guide a well-framed selfie for accurate skin-tone analysis.
          </Text>
          <View style={{ height: 18 }} />
          <CapsuleButton title="Allow Camera" onPress={requestPermission} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.blackFill}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        onCameraReady={() => setIsReady(true)}
      />

      {/* Live framing guide drawn over the preview. Transparent in the center so
          the face stays fully visible while lining up. */}
      <CameraGuideOverlay />

      {/* Top bar: close */}
      <Pressable
        onPress={() => navigation.goBack()}
        style={[styles.circleBtn, styles.closeBtn, { top: insets.top + 12 }]}
        accessibilityRole="button"
        accessibilityLabel="Close camera"
        hitSlop={10}
      >
        <Ionicons name="close" size={24} color="#fff" />
      </Pressable>

      {/* Bottom controls: flip + shutter */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.controlSide} />

        <Pressable
          onPress={handleCapture}
          disabled={!isReady || capturing}
          style={({ pressed }) => [styles.shutterOuter, pressed && styles.shutterPressed]}
          accessibilityRole="button"
          accessibilityLabel="Take photo"
        >
          <View style={styles.shutterInner}>
            {capturing ? <ActivityIndicator color={colors.primaryStrong} /> : null}
          </View>
        </Pressable>

        <View style={styles.controlSide}>
          <Pressable
            onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
            style={[styles.circleBtn, styles.flipBtn]}
            accessibilityRole="button"
            accessibilityLabel="Flip camera"
            hitSlop={10}
          >
            <Ionicons name="camera-reverse-outline" size={26} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  blackFill: { flex: 1, backgroundColor: '#000' },
  permissionWrap: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionCard: { alignItems: 'center', maxWidth: 320 },
  permissionTitle: { ...typography.sectionTitle, color: colors.text, marginTop: 14, marginBottom: 6, textAlign: 'center' },
  permissionText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },

  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  closeBtn: { position: 'absolute', left: 16 },
  flipBtn: {},

  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  controlSide: { width: 44, alignItems: 'center', justifyContent: 'center' },
  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  shutterPressed: { transform: [{ scale: 0.94 }] },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CustomCameraScreen;
