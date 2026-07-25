import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { AnalysisContext } from '../context/AnalysisContext';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const ProductCatalogScreen = ({ navigation }) => {
  const { analysisResult, setSelectedProduct } = useContext(AnalysisContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const colors = analysisResult?.palette || [];
        const result = await getProducts(colors);
        setProducts(result);
      } catch (e) {
        console.error('Failed to fetch products', e);
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
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended For You</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => handleProductPress(item)} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  row: { justifyContent: 'space-between' }
});

export default ProductCatalogScreen;
