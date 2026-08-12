import React from 'react';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import colors from '../constants/colors';

// SVG "Hue.U" wordmark — no image asset exists yet, so brand identity is drawn
// as vector text: pink "Hue" + teal ".U", bold and playful per the lollipop
// theme. Rendering it as SVG (instead of RN <Text>) means it scales crisply and
// can double as a temporary app icon.
//
// The two tones are drawn as two separate <Text> elements that meet exactly at
// the horizontal centre — "Hue" anchored at its end, ".U" anchored at its start,
// both at x = centre. This joins them seamlessly into "Hue.U" without measuring
// glyph widths (a single multi-<TSpan> text mis-anchored the second span, which
// left an odd gap and clipped the "U"). The canvas is kept generously wide so no
// glyph is ever cut off.
//
// variant:
//   "plain" (default) — transparent, for the navigation header.
//   "badge"           — sits on a rounded pink-tint square, for app-icon use.
const Wordmark = ({ height = 26, variant = 'plain' }) => {
  const isBadge = variant === 'badge';
  const pad = isBadge ? height * 0.55 : 0;
  const fontSize = height;
  const width = fontSize * 4.2 + pad * 2; // wide enough that nothing clips
  const totalHeight = height + pad * 2;
  const centerX = width / 2;
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
        x={centerX}
        y={baselineY}
        fontSize={fontSize}
        fontWeight="bold"
        textAnchor="end"
        fill={colors.primaryStrong}
      >
        Hue
      </SvgText>
      <SvgText
        x={centerX}
        y={baselineY}
        fontSize={fontSize}
        fontWeight="bold"
        textAnchor="start"
        fill={colors.secondaryStrong}
      >
        .U
      </SvgText>
    </Svg>
  );
};

export default Wordmark;
