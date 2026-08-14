import React, { useState } from 'react';
import {
  Modal, View, Text, Image, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MatchBadge from './MatchBadge';
import AppButton from './AppButton';
import colors from '../constants/colors';
import typography from '../constants/typography';

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// A single recommended-alternative tile (always a 'good' match for the season).
const RecommendationTile = ({ product, onPress }) => {
  const [imgError, setImgError] = useState(false);
  const showImage = product.image_url && !imgError;
  return (
    <TouchableOpacity style={styles.recTile} onPress={onPress} activeOpacity={0.85}>
      {showImage ? (
        <Image source={{ uri: product.image_url }} style={styles.recImage} onError={() => setImgError(true)} />
      ) : (
        <View style={[styles.recImage, styles.recImageFallback]}>
          <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
        </View>
      )}
      <Text style={styles.recName} numberOfLines={2}>{product.name}</Text>
      <MatchBadge rating="good" compact />
    </TouchableOpacity>
  );
};

// Shown from the "Try This Product" flow when the chosen product is only a fair
// or poor match. Presents the rating, better alternatives (tap to try one), and
// a "Try Anyway" escape hatch that proceeds to the try-on with the original pick.
//
// Props: visible, product, matchRating, season, recommendations,
//        onTryAnyway, onPickRecommendation(product), onClose
const MatchResultModal = ({
  visible, product, matchRating, season, recommendations = [],
  onTryAnyway, onPickRecommendation, onClose,
}) => {
  if (!product) return null;

  const isPoor = matchRating === 'poor';
  const headline = isPoor ? "Not your best color" : 'A decent match';
  const body = isPoor
    ? `This piece sits outside your ${capitalize(season)} palette, so the color may not flatter you as much.`
    : `This piece works with your ${capitalize(season)} palette, though it isn't a perfect match.`;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.close}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <MatchBadge rating={matchRating} style={styles.headBadge} />
            <Text style={styles.title}>{headline}</Text>
            <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.body}>{body}</Text>

            {recommendations.length > 0 ? (
              <>
                <Text style={styles.recTitle}>Better matches for you</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recRow}
                >
                  {recommendations.map((rec) => (
                    <RecommendationTile
                      key={rec.id}
                      product={rec}
                      onPress={() => onPickRecommendation && onPickRecommendation(rec)}
                    />
                  ))}
                </ScrollView>
              </>
            ) : (
              <Text style={styles.noRecs}>No better alternatives in the catalog yet.</Text>
            )}

            <View style={styles.actions}>
              <AppButton title="Try Anyway" onPress={onTryAnyway} />
              <View style={styles.actionGap} />
              <AppButton title="Keep Browsing" variant="secondary" onPress={onClose} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.scrim, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 22,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  close: { position: 'absolute', top: 12, right: 12, zIndex: 1, padding: 4 },
  scroll: { paddingBottom: 4 },
  headBadge: { marginBottom: 14 },
  title: { ...typography.title, color: colors.text, marginBottom: 4 },
  productName: { ...typography.label, color: colors.primaryStrong, marginBottom: 10 },
  body: { ...typography.body, color: colors.textSecondary, marginBottom: 22 },
  recTitle: { ...typography.sectionTitle, color: colors.text, marginBottom: 12 },
  recRow: { gap: 12, paddingRight: 4, paddingBottom: 4 },
  recTile: {
    width: 128,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    gap: 6,
  },
  recImage: { width: '100%', height: 96, borderRadius: 10, backgroundColor: colors.surfaceMuted },
  recImageFallback: { justifyContent: 'center', alignItems: 'center' },
  recName: { ...typography.caption, fontSize: 12, color: colors.text, minHeight: 32 },
  noRecs: { ...typography.body, fontSize: 14, color: colors.textSecondary, marginBottom: 22 },
  actions: { marginTop: 24 },
  actionGap: { height: 10 },
});

export default MatchResultModal;
