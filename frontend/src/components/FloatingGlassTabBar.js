import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import typography from '../constants/typography';

const H_MARGIN = 16;   // gap from the screen's left/right edges
const H_PADDING = 8;   // inner padding inside the capsule
const BAR_HEIGHT = 64;
const FAB_SIZE = 62;

// The middle route is a non-navigable placeholder; pressing it starts the skin-
// analysis flow instead of switching tabs.
const CENTER_ROUTE = 'Camera';

// Floating glass capsule bottom nav with 5 items:
//   Dashboard · Product · [Camera FAB] · History · Account
// The center Camera item is a raised pink->blue gradient FAB that floats above
// the bar and opens the analysis flow (SkinAnalysis). The other four are neutral
// glass tabs — gray when inactive, brand pink when active.
const FloatingGlassTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);

  const openCamera = () => {
    // Bubbles up to the parent stack. Starts the analysis flow from the nav bar.
    navigation.navigate('SkinAnalysis');
  };

  return (
    <View
      style={[styles.wrap, { left: H_MARGIN, right: H_MARGIN, bottom: insets.bottom + 10 }]}
      pointerEvents="box-none"
    >
      {/* Raised center FAB, floating above the capsule. */}
      <Pressable
        onPress={openCamera}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        accessibilityRole="button"
        accessibilityLabel="Open camera to analyze your skin"
      >
        <LinearGradient
          colors={colors.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabFill}
        >
          <Ionicons name="camera" size={28} color={colors.onPrimary} />
        </LinearGradient>
      </Pressable>

      <View style={styles.shadow}>
        <View style={styles.clip} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
          <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, styles.tint]} />

          <View style={styles.row}>
            {state.routes.map((route, index) => {
              // The center slot is just a spacer + label under the floating FAB.
              if (route.name === CENTER_ROUTE) {
                return (
                  <View key={route.key} style={styles.centerSlot} pointerEvents="none">
                    <Text style={[styles.label, styles.centerLabel]} numberOfLines={1}>
                      Camera
                    </Text>
                  </View>
                );
              }

              const { options } = descriptors[route.key];
              const focused = state.index === index;
              const color = focused ? colors.primaryStrong : colors.textSecondary;
              const label = options.title || route.name;

              const onPress = () => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  style={styles.tab}
                  accessibilityRole="button"
                  accessibilityState={focused ? { selected: true } : {}}
                  accessibilityLabel={label}
                >
                  {options.tabBarIcon
                    ? options.tabBarIcon({ focused, color, size: 22 })
                    : null}
                  <Text style={[styles.label, { color }]} numberOfLines={1}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  shadow: {
    borderRadius: 32,
    shadowColor: colors.shadowPink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
  },
  clip: {
    height: BAR_HEIGHT,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  tint: { backgroundColor: colors.glassFillStrong },
  row: { flex: 1, flexDirection: 'row', paddingHorizontal: H_PADDING, alignItems: 'center' },
  tab: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', gap: 2 },
  centerSlot: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 },
  centerLabel: { color: colors.primaryStrong },
  label: { ...typography.caption, fontSize: 11, fontWeight: '700' },

  // Raised FAB, horizontally centered and straddling the capsule's top edge.
  // Sits ~22px above the bar (was ~40px, which read as too tall) so it still
  // stands out as a floating action button but keeps a natural proportion next
  // to the four flat nav items.
  fab: {
    position: 'absolute',
    left: '50%',
    marginLeft: -FAB_SIZE / 2,
    bottom: BAR_HEIGHT - 40,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    shadowColor: colors.shadowPink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 12,
    zIndex: 10,
  },
  fabPressed: { transform: [{ scale: 0.94 }] },
  fabFill: {
    flex: 1,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
  },
});

export default FloatingGlassTabBar;
