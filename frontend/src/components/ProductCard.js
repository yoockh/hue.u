import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

const ProductCard = ({ product, onPress }) => {
  const [imgError, setImgError] = useState(false);
  // Product images are known-placeholder/broken for now (fixed separately), so
  // fall back to a tidy generic icon on a neutral surface instead of a broken image.
  const showImage = product.image_url && !imgError;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
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
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: colors.primaryStrong,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    width: '48%',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: colors.surfaceMuted,
  },
  imageFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
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
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryStrong,
  },
});

export default ProductCard;
