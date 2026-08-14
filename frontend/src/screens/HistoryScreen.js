import React, { useState, useCallback, useContext } from 'react';
import { View, Text, Image, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getHistory } from '../services/api';
import { AnalysisContext } from '../context/AnalysisContext';
import ComingSoon from '../components/ComingSoon';
import ColorSwatch from '../components/ColorSwatch';
import GradientBackground from '../components/GradientBackground';
import GlassCard from '../components/GlassCard';
import colors from '../constants/colors';
import typography from '../constants/typography';

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
};

// Scan photo thumbnail with a tidy fallback for older records (no photo_url) or
// images that fail to load.
const HistoryThumb = ({ uri }) => {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return (
      <View style={[styles.thumb, styles.thumbFallback]}>
        <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
      </View>
    );
  }
  return <Image source={{ uri }} style={styles.thumb} onError={() => setFailed(true)} />;
};

const HistoryScreen = ({ navigation }) => {
  const { setAnalysisResult } = useContext(AnalysisContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHistory();
      setItems(res?.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch whenever the tab regains focus so a fresh scan shows up.
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Reuse the existing analysis result screen by reconstructing its expected
  // shape from the saved history item.
  const openDetail = (item) => {
    setAnalysisResult({
      data: {
        analysis: {
          skin_color: item.skin_color,
          hair_color: item.hair_color,
          eye_color: item.eye_color,
        },
        classification: {
          season: item.season,
          undertone: item.undertone,
          contrast: item.contrast,
        },
        recommendations: {
          palette: item.palette || [],
          explanation: item.explanation,
        },
      },
    });
    navigation.navigate('AnalysisResult');
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.primaryStrong} /></View>
      </GradientBackground>
    );
  }

  if (error) {
    return (
      <GradientBackground>
        <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>
      </GradientBackground>
    );
  }

  if (items.length === 0) {
    return (
      <GradientBackground>
        <ComingSoon
          icon="time-outline"
          title="No history yet"
          message="Your color analyses will appear here. Start your first scan to discover your season."
        />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable onPress={() => openDetail(item)} style={styles.cardPress}>
            <GlassCard padding={12} intensity={36} contentStyle={styles.cardRow}>
              <HistoryThumb uri={item.photo_url} />
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.season}>{capitalize(item.season)}</Text>
                  <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={styles.swatchRow}>
                  {(item.palette || []).slice(0, 5).map((c, i) => (
                    <ColorSwatch key={i} color={c.hex} size={22} />
                  ))}
                </View>
              </View>
            </GlassCard>
          </Pressable>
        )}
      />
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { ...typography.body, color: colors.error, textAlign: 'center' },
  list: { padding: 16, paddingBottom: 110 },
  cardPress: { marginBottom: 14 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: colors.surfaceMuted,
  },
  thumbFallback: { justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  season: { ...typography.sectionTitle, color: colors.primaryStrong },
  date: { ...typography.caption, color: colors.textSecondary, flexShrink: 1, textAlign: 'right', marginLeft: 8 },
  swatchRow: { flexDirection: 'row' },
});

export default HistoryScreen;
