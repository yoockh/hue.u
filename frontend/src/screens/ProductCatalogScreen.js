import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { AnalysisContext } from '../context/AnalysisContext';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import GradientBackground from '../components/GradientBackground';
import colors from '../constants/colors';
import typography from '../constants/typography';

const ProductCatalogScreen = ({ navigation }) => {
  const { analysisResult, setSelectedProduct } = useContext(AnalysisContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const season = analysisResult?.data?.classification?.season;
        const result = await getProducts(season);
        setProducts(result?.data || []);
      } catch (e) {
        console.error('Failed to fetch products', e);
        setError(e.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [analysisResult]);

  const handleProductPress = (product) => {
    setSelectedProduct(product);
    navigation.navigate('UploadFullBody');
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

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Recommended For You</Text>
        {products.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No products found for this season yet.</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <ProductCard product={item} onPress={() => handleProductPress(item)} />
            )}
          />
        )}
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  list: { paddingBottom: 24 },
  title: { ...typography.title, color: colors.text, marginBottom: 16 },
  row: { justifyContent: 'space-between' },
  errorText: { ...typography.body, color: colors.error, textAlign: 'center' },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});

export default ProductCatalogScreen;
