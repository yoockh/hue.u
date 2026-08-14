import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import typography from '../constants/typography';

const H_MARGIN = 16;   // gap from the screen's left/right edges
const H_PADDING = 8;   // inner padding inside the capsule
const BAR_HEIGHT = 64;

// Floating glass capsule bottom nav. Instead of a full-width bar glued to the
// edge, it hovers with margins on all sides, blurs whatever scrolls beneath it,
// and moves a pink->blue highlight pill smoothly to the active tab (Animated,
// native driver).
const FloatingGlassTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);

  const tabCount = state.routes.length;
  const tabWidth = barWidth > 0 ? (barWidth - H_PADDING * 2) / tabCount : 0;

  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (tabWidth <= 0) return;
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      speed: 18,
      bounciness: 8,
    }).start();
  }, [state.index, tabWidth, translateX]);

  return (
    <View
      style={[styles.wrap, { left: H_MARGIN, right: H_MARGIN, bottom: insets.bottom + 10 }]}
      pointerEvents="box-none"
    >
      <View style={styles.shadow}>
        <View style={styles.clip} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
          <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, styles.tint]} />

          <View style={styles.row}>
            {/* Moving highlight pill behind the active tab. */}
            {tabWidth > 0 ? (
              <Animated.View
                style={[styles.pill, { width: tabWidth, transform: [{ translateX }] }]}
                pointerEvents="none"
              >
                <LinearGradient
                  colors={colors.gradientAccent}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.pillFill}
                />
              </Animated.View>
            ) : null}

            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const focused = state.index === index;
              const color = focused ? colors.onPrimary : colors.textSecondary;
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
  pill: {
    position: 'absolute',
    left: H_PADDING,
    top: 8,
    bottom: 8,
    borderRadius: 24,
    overflow: 'hidden',
  },
  pillFill: { flex: 1 },
  tab: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { ...typography.caption, fontSize: 11, fontWeight: '700' },
});

export default FloatingGlassTabBar;
