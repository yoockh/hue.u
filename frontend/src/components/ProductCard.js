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
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    width: '48%',
  },
  image: {
    width: '100%',
    height: 150,
  },
  info: {
    padding: 8,
  },
  name: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default ProductCard;
