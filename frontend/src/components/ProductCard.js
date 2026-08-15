import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MatchBadge from './MatchBadge';
import GlassCard from './GlassCard';
import CapsuleButton from './CapsuleButton';
import colors from '../constants/colors';
import typography from '../constants/typography';

// `matchRating` (optional) overlays a compatibility badge on the image — set by
// the Product tab's "From My Skin Tone" filter. `onTryProduct` (optional) adds a
// capsule "Try This Product" button that starts the season-check + try-on flow.
// Blur intensity is kept low here because these render in 2-column grids
// (perf on Android).
const ProductCard = ({ product, onPress, matchRating, onTryProduct }) => {
  const [imgError, setImgError] = useState(false);
  const showImage = product.image_url && !imgError;

  return (
    <Pressable onPress={onPress} style={styles.outer}>
      <GlassCard padding={0} intensity={26} glow="pink" style={styles.card}>
        <View>
          {showImage ? (
            <Image
              source={{ uri: product.image_url }}
              style={styles.image}
              onError={() => setImgError(true)}
            />
          ) : (
            <View style={[styles.image, styles.imageFallback]}>
              <Ionicons name="image-outline" size={30} color={colors.textSecondary} />
            </View>
          )}
          {matchRating ? (
            <MatchBadge rating={matchRating} compact style={styles.badge} />
          ) : null}
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          {product.color_name ? (
            <View style={styles.colorRow}>
              {product.color_hex ? (
                <View style={[styles.colorDot, { backgroundColor: product.color_hex }]} />
              ) : null}
              <Text style={styles.colorName} numberOfLines={1}>{product.color_name}</Text>
            </View>
          ) : null}
          {product.price ? <Text style={styles.price}>${product.price}</Text> : null}

          {onTryProduct ? (
            <CapsuleButton
              title="Try This Product"
              size="sm"
              icon="shirt-outline"
              onPress={onTryProduct}
              style={styles.tryButton}
            />
          ) : null}
        </View>
      </GlassCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  outer: { width: '48%', marginBottom: 16 },
  card: { width: '100%' },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: colors.surfaceMuted,
  },
  imageFallback: { justifyContent: 'center', alignItems: 'center' },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  info: { padding: 10 },
  name: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 },
  colorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorName: { fontSize: 12, color: colors.textSecondary, flexShrink: 1 },
  price: { fontSize: 15, fontWeight: '800', color: colors.primaryStrong },
  tryButton: { marginTop: 8 },
});

export default ProductCard;
