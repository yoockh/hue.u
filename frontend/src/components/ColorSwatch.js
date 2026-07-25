import React from 'react';
import { View, StyleSheet } from 'react-native';

const ColorSwatch = ({ color, size = 30 }) => (
  <View style={[styles.swatch, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]} />
);

const styles = StyleSheet.create({
  swatch: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 8,
  },
});

export default ColorSwatch;
