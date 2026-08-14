import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TextInput, TouchableOpacity, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getProducts, getProductMatches, getLatestHistory, getProductMatch } from '../services/api';
import { AnalysisContext } from '../context/AnalysisContext';
import { useAlert } from '../context/AlertContext';
import ProductCard from '../components/ProductCard';
import MatchResultModal from '../components/MatchResultModal';
import GradientBackground from '../components/GradientBackground';
import colors from '../constants/colors';
import typography from '../constants/typography';

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// full_set -> "Full Set", activewear_set -> "Activewear Set"
const categoryLabel = (c) =>
  c.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const TONE_FILTER = 'tone';
const ALL_FILTER = 'all';

// Product tab — full catalog plus name search, category filters, and a
// season-aware "From My Skin Tone" filter that ranks products by match_rating.
const ProductScreen = ({ navigation }) => {
  const { analysisResult, matchIntent, setMatchIntent, setSelectedProduct } = useContext(AnalysisContext);
  const { showAlert } = useAlert();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER); // 'all' | 'tone' | 'cat:<category>'

  // "From My Skin Tone" state.
  const [toneSeason, setToneSeason] = useState(null);
  const [toneProducts, setToneProducts] = useState([]);
  const [toneLoading, setToneLoading] = useState(false);

  // "Try This Product" match-result modal (shown for fair/poor picks).
  const [matchModal, setMatchModal] = useState(null); // { product, matchRating, season, recommendations } | null

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

  const categories = useMemo(() => {
    const seen = [];
    for (const p of products) {
      if (p.garment_category && !seen.includes(p.garment_category)) seen.push(p.garment_category);
    }
    return seen;
  }, [products]);

  // Fetch the season-ranked catalog and switch into tone view.
  const activateToneFilter = useCallback(async (season) => {
    setActiveFilter(TONE_FILTER);
    setToneSeason(season);
    setToneLoading(true);
    try {
      const res = await getProductMatches(season);
      setToneProducts(res?.data || []);
    } catch (e) {
      showAlert({ type: 'error', title: 'Could not match products', message: e.message || 'Please try again.' });
      setActiveFilter(ALL_FILTER);
    } finally {
      setToneLoading(false);
    }
  }, [showAlert]);

  // Start the virtual try-on for a product.
  const goToTryOn = useCallback((product) => {
    setSelectedProduct(product);
    navigation.navigate('UploadFullBody');
  }, [setSelectedProduct, navigation]);

  // Check one product against the season: a 'good' match goes straight to the
  // try-on; 'fair'/'poor' opens the match-result modal (rating + alternatives +
  // a "Try Anyway" option).
  const startTryFlow = useCallback(async (productId, season) => {
    try {
      const res = await getProductMatch(productId, season);
      const { product, match_rating: rating, recommendations } = res;
      if (rating === 'good') {
        goToTryOn(product);
      } else {
        setMatchModal({ product, matchRating: rating, season, recommendations: recommendations || [] });
      }
    } catch (e) {
      showAlert({ type: 'error', title: 'Could not check this product', message: e.message || 'Please try again.' });
    }
  }, [goToTryOn, showAlert]);

  // Once a season is known (from history or a fresh scan), carry out the parked
  // intent.
  const runIntent = useCallback((mode, productId, season) => {
    if (mode === 'filter') {
      activateToneFilter(season);
    } else if (mode === 'tryOn') {
      startTryFlow(productId, season);
    }
  }, [activateToneFilter, startTryFlow]);

  // Resolve the user's season, then run `mode`. If a saved scan exists, ask
  // whether to reuse it or analyze again; otherwise go straight to analysis and
  // park the intent so we resume here on return.
  const resolveSeason = useCallback(async (mode, productId) => {
    let latest = null;
    try {
      const res = await getLatestHistory();
      latest = res?.status === 'success' ? res.data : null;
    } catch (e) {
      latest = null; // Treat a history failure as "no history" and analyze fresh.
    }

    if (latest?.season) {
      showAlert({
        type: 'info',
        title: 'Use your last scan?',
        message: `We found a saved analysis (Season: ${capitalize(latest.season)}). Use it, or analyze again?`,
        buttons: [
          { text: 'Use Last Scan', onPress: () => runIntent(mode, productId, latest.season) },
          {
            text: 'Analyze Again',
            variant: 'secondary',
            onPress: () => {
              setMatchIntent({ mode, productId });
              navigation.navigate('SkinAnalysis');
            },
          },
        ],
      });
    } else {
      setMatchIntent({ mode, productId });
      navigation.navigate('SkinAnalysis');
    }
  }, [showAlert, runIntent, setMatchIntent, navigation]);

  // Consume a parked intent when the tab regains focus. `season` on the intent
  // means "resolve now" (source already known); otherwise use the fresh scan.
  useFocusEffect(
    useCallback(() => {
      if (!matchIntent) return;
      const season = matchIntent.season || analysisResult?.data?.classification?.season;
      if (!season) return; // still waiting on an analysis
      const { mode, productId } = matchIntent;
      setMatchIntent(null);
      runIntent(mode, productId, season);
    }, [matchIntent, analysisResult, setMatchIntent, runIntent])
  );

  const handleSelectFilter = (filter) => {
    if (filter === TONE_FILTER) {
      resolveSeason('filter');
      return;
    }
    setActiveFilter(filter);
  };

  const handleTryProduct = (product) => resolveSeason('tryOn', product.id);

  // The list to render for the active filter, then narrowed by the search query.
  const visibleProducts = useMemo(() => {
    let base;
    if (activeFilter === TONE_FILTER) {
      base = toneProducts;
    } else if (activeFilter.startsWith('cat:')) {
      const cat = activeFilter.slice(4);
      base = products.filter((p) => p.garment_category === cat);
    } else {
      base = products;
    }
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((p) => (p.name || '').toLowerCase().includes(q));
  }, [activeFilter, toneProducts, products, query]);

  const renderChip = (key, label, icon) => {
    const selected = activeFilter === key || (key === TONE_FILTER && activeFilter === TONE_FILTER);
    return (
      <TouchableOpacity
        key={key}
        onPress={() => handleSelectFilter(key)}
        activeOpacity={0.85}
        style={[styles.chip, selected && styles.chipSelected]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={14}
            color={selected ? colors.onPrimary : colors.secondaryStrong}
            style={styles.chipIcon}
          />
        ) : null}
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const listHeader = (
    <View>
      <Text style={styles.title}>Products</Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products by name"
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 ? (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {renderChip(ALL_FILTER, 'All')}
        {renderChip(TONE_FILTER, 'From My Skin Tone', 'color-palette-outline')}
        {categories.map((c) => renderChip(`cat:${c}`, categoryLabel(c)))}
      </ScrollView>

      {activeFilter === TONE_FILTER && toneSeason ? (
        <Text style={styles.toneNote}>
          Ranked for your <Text style={styles.toneSeason}>{capitalize(toneSeason)}</Text> palette — best matches first.
        </Text>
      ) : null}
    </View>
  );

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
      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          toneLoading ? (
            <View style={styles.centeredPad}><ActivityIndicator size="large" color={colors.primary} /></View>
          ) : (
            <View style={styles.centeredPad}>
              <Ionicons name="pricetags-outline" size={30} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                {activeFilter === TONE_FILTER
                  ? 'No matching products for this season yet.'
                  : query
                    ? `No products match "${query}".`
                    : 'No products available yet.'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            matchRating={item.match_rating}
            onTryProduct={() => handleTryProduct(item)}
          />
        )}
      />

      <MatchResultModal
        visible={!!matchModal}
        product={matchModal?.product}
        matchRating={matchModal?.matchRating}
        season={matchModal?.season}
        recommendations={matchModal?.recommendations}
        onTryAnyway={() => {
          const p = matchModal.product;
          setMatchModal(null);
          goToTryOn(p);
        }}
        onPickRecommendation={(rec) => {
          setMatchModal(null);
          goToTryOn(rec);
        }}
        onClose={() => setMatchModal(null)}
      />
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  centeredPad: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  list: { padding: 16, paddingBottom: 110 },
  row: { justifyContent: 'space-between' },
  title: { ...typography.title, color: colors.text, marginBottom: 14 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.glassFillStrong,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.text, padding: 0 },
  chipRow: { gap: 8, paddingRight: 4, paddingBottom: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassFillStrong,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelected: { backgroundColor: colors.primaryStrong, borderColor: colors.primaryStrong },
  chipIcon: { marginRight: 5 },
  chipText: { ...typography.label, color: colors.secondaryStrong },
  chipTextSelected: { color: colors.onPrimary },
  toneNote: { ...typography.caption, fontSize: 13, color: colors.textSecondary, marginTop: 12, marginBottom: 2 },
  toneSeason: { color: colors.primaryStrong, fontWeight: '800' },
  errorText: { ...typography.body, color: colors.error, textAlign: 'center' },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});

export default ProductScreen;
