import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Product tab — the full catalog from GET /api/products as a 2-column grid.
// (Distinct from ProductCatalog in the try-on flow, which filters by season.)
const ProductScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getProducts();
        if (active) setProducts(res?.data || []);
      } catch (e) {
        if (active) setError(e.message || 'Failed to load products.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.title}>Products</Text>}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No products available yet.</Text>
          </View>
        }
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.background },
  list: { padding: 16 },
  row: { justifyContent: 'space-between' },
  title: { ...typography.title, color: colors.text, marginBottom: 16 },
  errorText: { ...typography.body, color: colors.error, textAlign: 'center' },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});

export default ProductScreen;
