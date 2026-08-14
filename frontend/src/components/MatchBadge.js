import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Compatibility badge for a product's match_rating against the user's season.
// Three states, colored per the match-rating tokens in the design system
// (green good / amber fair / mauve-gray poor). Ionicons only, no emoji.
//
// Props:
//   rating  'good' | 'fair' | 'poor'
//   compact  true  -> tight pill for product cards
//            false -> larger pill for the match-result screen (default)
const RATINGS = {
  good: { label: 'Good Match', color: colors.goodMatch, soft: colors.goodMatchSoft, icon: 'checkmark-circle' },
  fair: { label: 'Fair Match', color: colors.fairMatch, soft: colors.fairMatchSoft, icon: 'alert-circle' },
  poor: { label: 'Poor Match', color: colors.poorMatch, soft: colors.poorMatchSoft, icon: 'remove-circle' },
};

const MatchBadge = ({ rating, compact = false, style }) => {
  const r = RATINGS[rating];
  if (!r) return null;

  const iconSize = compact ? 13 : 16;

  return (
    <View
      style={[
        styles.badge,
        compact ? styles.badgeCompact : styles.badgeRegular,
        { backgroundColor: r.soft, borderColor: r.color },
        style,
      ]}
    >
      <Ionicons name={r.icon} size={iconSize} color={r.color} />
      <Text
        style={[compact ? styles.labelCompact : styles.labelRegular, { color: r.color }]}
        numberOfLines={1}
      >
        {r.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeCompact: { paddingVertical: 3, paddingHorizontal: 7, gap: 3 },
  badgeRegular: { paddingVertical: 6, paddingHorizontal: 12, gap: 6 },
  labelCompact: { ...typography.caption, fontSize: 11, fontWeight: '700' },
  labelRegular: { ...typography.label, fontWeight: '700' },
});

export default MatchBadge;
