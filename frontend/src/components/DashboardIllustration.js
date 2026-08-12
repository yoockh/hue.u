import React from 'react';
import Svg, { Circle, Rect, Line } from 'react-native-svg';
import colors from '../constants/colors';

// Temporary on-brand SVG placeholder for the dashboard hero — soft overlapping
// blobs (a "color bloom") plus a row of palette swatches and a simple face mark.
// Purely decorative; it will be replaced by a real illustration asset later.
const DashboardIllustration = () => (
  <Svg width="100%" height="100%" viewBox="0 0 300 240" preserveAspectRatio="xMidYMid slice">
    {/* backdrop */}
    <Rect x="0" y="0" width="300" height="240" fill={colors.surfaceMuted} />

    {/* color-bloom blobs */}
    <Circle cx="105" cy="120" r="78" fill={colors.primarySoft} />
    <Circle cx="205" cy="100" r="66" fill={colors.secondarySoft} />
    <Circle cx="170" cy="165" r="48" fill={colors.primarySoft} opacity={0.7} />

    {/* simple face mark */}
    <Circle cx="150" cy="108" r="40" fill={colors.surface} />
    <Circle cx="150" cy="108" r="40" fill="none" stroke={colors.primary} strokeWidth="3" />
    <Circle cx="136" cy="102" r="4" fill={colors.text} />
    <Circle cx="164" cy="102" r="4" fill={colors.text} />
    <Line x1="140" y1="124" x2="160" y2="124" stroke={colors.primaryStrong} strokeWidth="3" strokeLinecap="round" />

    {/* palette swatch row */}
    <Circle cx="120" cy="196" r="11" fill={colors.primary} />
    <Circle cx="150" cy="196" r="11" fill={colors.secondary} />
    <Circle cx="180" cy="196" r="11" fill={colors.primaryStrong} />
  </Svg>
);

export default DashboardIllustration;
