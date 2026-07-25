import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import colors from '../constants/colors';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 10,
  },
  message: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 16,
  },
});

export default LoadingSpinner;
