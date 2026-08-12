import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../constants/colors';

const ProductCard = ({ product, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={{ uri: product.image_url || 'https://via.placeholder.com/150' }} style={styles.image} />
    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
      {product.price ? <Text style={styles.price}>${product.price}</Text> : null}
    </View>
  </TouchableOpacity>
);

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
  info: {
    padding: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryStrong,
  },
});

export default ProductCard;
