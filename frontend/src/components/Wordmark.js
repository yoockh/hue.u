import React from 'react';
import Svg, { Rect, Text as SvgText, TSpan } from 'react-native-svg';
import colors from '../constants/colors';

// SVG "Hue.U" wordmark — no image asset exists yet, so brand identity is drawn
// as vector text: pink "Hue" + teal ".U", bold and playful per the lollipop
// theme. Rendering it as SVG (instead of RN <Text>) means it scales crisply and
// can double as a temporary app icon.
//
// variant:
//   "plain" (default) — transparent, for the navigation header.
//   "badge"           — sits on a rounded pink-tint square, for app-icon use.
const Wordmark = ({ height = 26, variant = 'plain' }) => {
  const isBadge = variant === 'badge';
  const pad = isBadge ? height * 0.55 : 0;
  const fontSize = height;
  // "Hue.U" is ~5 glyphs; this width comfortably fits it at textAnchor="middle".
  const textWidth = fontSize * 3.1;
  const width = textWidth + pad * 2;
  const totalHeight = height + pad * 2;
  const baselineY = totalHeight / 2 + fontSize * 0.35;

  return (
    <Svg
      width={width}
      height={totalHeight}
      viewBox={`0 0 ${width} ${totalHeight}`}
      accessibilityRole="header"
      accessibilityLabel="Hue.U"
    >
      {isBadge && (
        <Rect
          x={0}
          y={0}
          width={width}
          height={totalHeight}
          rx={totalHeight * 0.28}
          fill={colors.primarySoft}
        />
      )}
      <SvgText
        x={width / 2}
        y={baselineY}
        fontSize={fontSize}
        fontWeight="bold"
        textAnchor="middle"
      >
        <TSpan fill={colors.primaryStrong}>Hue</TSpan>
        <TSpan fill={colors.secondaryStrong}>.U</TSpan>
      </SvgText>
    </Svg>
  );
};

export default Wordmark;
