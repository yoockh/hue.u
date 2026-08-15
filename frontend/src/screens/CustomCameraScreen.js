import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import CameraGuideOverlay from '../components/CameraGuideOverlay';
import CapsuleButton from '../components/CapsuleButton';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Client-side face detection via Google ML Kit — requires a custom dev client
// build with @infinitered/react-native-mlkit-face-detection. In Expo Go / when
// the native module is missing, this stays null and the live indicator falls
// back to a neutral (idle) ring — the shutter still works, it just can't turn
// green.
let FaceDetection = null;
try {
  FaceDetection = require('@infinitered/react-native-mlkit-face-detection');
} catch (_) {
  // Native module not available — the live color indicator is disabled.
}

// How often we sample the preview for a face. expo-camera (SDK 54) exposes no
// live frame-processor callback and the ML Kit binding only accepts a still
// image URI, so we drive the indicator by repeatedly grabbing a tiny throwaway
// still and running the detector on it. ~600ms keeps it responsive without
// pegging the CPU.
const POLL_MS = 600;

// Normalised framing thresholds (fractions of the captured frame). A face is
// considered "well framed" (green) when its centre sits in the middle band and
// it fills a sensible portion of the height — mirrors the on-screen oval, which
// is centred and sized to a typical head.
const CENTER_X = [0.30, 0.70];
const CENTER_Y = [0.24, 0.76];
const FACE_H = [0.26, 0.82];

// Full-screen custom camera for the guided selfie flow. Manual shutter only —
// the live face-detection indicator NEVER gates the shutter, it just tints the
// oval red (searching) / green (framed) so the user knows when their position
// is good. The captured photo is returned to SkinAnalysisScreen via navigation
// params (capturedPhotoUri).
const CustomCameraScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('front');
  const [isReady, setIsReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  // 'idle' (no detector) | 'searching' (no/unframed face) | 'good' (framed).
  const [detectStatus, setDetectStatus] = useState('idle');
  const [detectorReady, setDetectorReady] = useState(false);

  const cameraRef = useRef(null);
  const detectorRef = useRef(null);
  const pollTimer = useRef(null);
  const mountedRef = useRef(true);
  const isReadyRef = useRef(false);
  const capturingRef = useRef(false);
  const focusedRef = useRef(true);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  // Keep refs in sync so the async poll loop reads fresh values without
  // re-subscribing.
  useEffect(() => { isReadyRef.current = isReady; }, [isReady]);
  useEffect(() => { capturingRef.current = capturing; }, [capturing]);
  useEffect(() => { focusedRef.current = isFocused; }, [isFocused]);

  // Spin up the ML Kit detector once (if the native module is present).
  useEffect(() => {
    mountedRef.current = true;
    if (!FaceDetection) {
      console.log('[hue.u face-detect] native module unavailable — live indicator disabled (neutral ring).');
      return;
    }
    (async () => {
      try {
        const detector = new FaceDetection.RNMLKitFaceDetector({
          performanceMode: 'fast',
          landmarkMode: false,
          contourMode: false,
          classificationMode: false,
          minFaceSize: 0.15,
          isTrackingEnabled: false,
        });
        await detector.initialize();
        if (!mountedRef.current) return;
        detectorRef.current = detector;
        setDetectStatus('searching');
        setDetectorReady(true);
        console.log('[hue.u face-detect] detector initialised — starting live polling.');
      } catch (e) {
        console.warn('[hue.u face-detect] detector init failed:', e?.message);
      }
    })();
    return () => {
      mountedRef.current = false;
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

  // The polling loop. One detection at a time, rescheduled after each pass.
  const runPoll = useCallback(async () => {
    if (!mountedRef.current) return;
    const canSample =
      cameraRef.current && isReadyRef.current && !capturingRef.current &&
      detectorRef.current && focusedRef.current;

    if (canSample) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.2,
          skipProcessing: true,
          shutterSound: false,
          base64: false,
        });
        const result = await detectorRef.current.detectFaces(photo.uri);
        const faces = result?.faces || [];

        if (faces.length === 0) {
          if (mountedRef.current) setDetectStatus('searching');
          console.log('[hue.u face-detect] faces=0 -> searching');
        } else {
          // Judge the largest face against the framing thresholds.
          const face = faces.reduce((a, b) => (b.frame.size.y > a.frame.size.y ? b : a));
          const iw = photo.width || 1;
          const ih = photo.height || 1;
          const cx = (face.frame.origin.x + face.frame.size.x / 2) / iw;
          const cy = (face.frame.origin.y + face.frame.size.y / 2) / ih;
          const fh = face.frame.size.y / ih;
          const centered =
            cx >= CENTER_X[0] && cx <= CENTER_X[1] && cy >= CENTER_Y[0] && cy <= CENTER_Y[1];
          const sized = fh >= FACE_H[0] && fh <= FACE_H[1];
          const good = centered && sized;
          if (mountedRef.current) setDetectStatus(good ? 'good' : 'searching');
          console.log(
            `[hue.u face-detect] faces=${faces.length} cx=${cx.toFixed(2)} cy=${cy.toFixed(2)} fh=${fh.toFixed(2)} centered=${centered} sized=${sized} -> ${good ? 'good' : 'searching'}`
          );
        }
      } catch (e) {
        // A transient capture/detect miss shouldn't kill the loop.
        console.warn('[hue.u face-detect] poll error:', e?.message);
      }
    }

    // Only keep the chain alive while mounted AND focused; the focus effect
    // owns (re)starting it otherwise.
    if (mountedRef.current && focusedRef.current) {
      pollTimer.current = setTimeout(runPoll, POLL_MS);
    }
  }, []);

  // Start/stop polling with readiness + screen focus. Pausing when the screen
  // is blurred stops us grabbing stills for a camera the user has navigated away
  // from.
  useEffect(() => {
    if (!detectorReady || !isReady || !isFocused) return;
    if (pollTimer.current) clearTimeout(pollTimer.current);
    pollTimer.current = setTimeout(runPoll, POLL_MS);
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [detectorReady, isReady, isFocused, runPoll]);

  // Take the real still and hand it back to the analysis screen. Guarded so it
  // can't fire before the camera is ready or while a capture is already in
  // flight. NOTE: never gated on detectStatus — the user shoots whenever.
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
        animateShutter={false}
        onCameraReady={() => setIsReady(true)}
      />

      {/* Live framing guide drawn over the preview — the oval color reacts to the
          detection status in real time. Transparent center so the face stays
          fully visible while lining up. */}
      <CameraGuideOverlay status={detectStatus} />

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
          style={({ pressed }) => [
            styles.shutterOuter,
            detectStatus === 'good' && styles.shutterGood,
            pressed && styles.shutterPressed,
          ]}
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
  // Subtle green cue on the shutter ring when framing is good (still tappable
  // at any time regardless).
  shutterGood: { borderColor: '#37D67A' },
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
