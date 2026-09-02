/**
 * ============================================================================
 * THEME.JS - JavaScript Color & Style Tokens
 * ============================================================================
 *
 * This file provides a JavaScript mirror of CSS variables defined in
 * src/styles/theme.css. Used for:
 *
 * 1. Recharts and other charting libraries (can't read CSS variables)
 * 2. Inline SVG and dynamic color generation
 * 3. JavaScript-based styling and conditionals
 *
 * CRITICAL: When updating colors in theme.css, update the corresponding
 * values here to maintain consistency across the application.
 * ============================================================================
 */

export const colors = {
  /* Primary Brand (Emerald) */
  primary: {
    DEFAULT: "#10B981", // hsl(160 84% 39%)
    dark: "#059669", // hsl(160 94% 30%)
    light: "#6EE7B7", // hsl(160 84% 60%)
    rgb: "rgb(16 185 129)",
    hsl: "hsl(160 84% 39%)",
  },

  /* Backgrounds & Surfaces */
  background: {
    DEFAULT: "#F3F5F7",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    dashboard: "#F0FDF9",
  },

  /* Text & Foreground */
  foreground: "#0F172A",
  muted: "#8BA3B4",

  /* Semantic Colors */
  secondary: "#FAFBF9",
  accent: "#F0FDF9",
  destructive: "#DC2626",

  /* Status Palette (Attendance)
     Brightened to match --status-* tokens in theme.css — the whole
     point of the Today's Attendance Status tiles is instant color
     recognition, so every status needs equal visual punch. */
  status: {
    present: "#16A34A", // hsl(142 71% 45%) - green
    late: "#F59E0B", // hsl(38 92% 50%) - amber
    absent: "#EF4444", // hsl(0 84% 60%) - vivid red (was #C46464, too dull)
    leave: "#8B5CF6", // hsl(258 90% 66%) - purple
    holiday: "#0EA5E9", // hsl(199 89% 48%) - blue
    pending: "#64748B", // hsl(215 16% 47%) - slate (intentionally muted)
    halfDay: "#60A5FA", // blue-400 - matches the "Half Day" dot used in RecentActivityCard
  },

  /* Borders & Rings */
  border: "#D9F5E9",
  input: "#DFE5EB",
  ring: "#10B981",
};

export const colorScale = {
  50: "#F0FDF9",
  100: "#D9F5E9",
  200: "#A7F3D0",
  300: "#6EE7B7",
  400: "#34D399",
  500: "#10B981",
  600: "#059669",
  700: "#047857",
  800: "#065F46",
  900: "#064E3B",
  950: "#022C22",
};

export const glass = {
  bgOpacity: 0.4,
  borderOpacity: 0.6,
  blur: "12px",
  innerOpacity: 0.5,
  style: {
    backdropFilter: "blur(12px)",
    backgroundColor: `rgba(255, 255, 255, ${0.4})`,
    borderColor: `rgba(255, 255, 255, ${0.6})`,
    border: `1px solid rgba(255, 255, 255, ${0.6})`,
  },
};

export const shadows = {
  soft: "0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06)",
  raised: "0 10px 30px -12px rgba(16, 185, 129, 0.28)",
  glow: `0 0 0 1px rgba(16, 185, 129, 0.18), 0 12px 32px -12px rgba(16, 185, 129, 0.45)`,
  lg: "0 20px 48px rgba(0, 0, 0, 0.12)",
};

export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary.DEFAULT}, ${colors.primary.dark})`,
  surface: "linear-gradient(160deg, rgb(255, 255, 255), hsl(165 74% 98%))",
  accent: `linear-gradient(135deg, ${colors.accent}, rgba(16, 185, 129, 0.8))`,
};

export const radius = {
  DEFAULT: "0.75rem",
  lg: "1rem",
  md: "0.5rem",
  sm: "0.375rem",
};

export const easing = {
  smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
};

export const chartTooltipStyle = {
  backgroundColor: colors.background.surface,
  borderRadius: radius.DEFAULT,
  border: `1px solid ${colors.border}`,
  boxShadow: shadows.raised,
  padding: "8px 12px",
  backdropFilter: "blur(12px)",
};

export const chartColors = [
  colors.primary.DEFAULT,
  colors.status.present,
  colors.status.late,
  colors.status.absent,
  colors.status.leave,
  colors.status.holiday,
  colors.accent,
];

export const statusColors = {
  present: colors.status.present,
  late: colors.status.late,
  absent: colors.status.absent,
  leave: colors.status.leave,
  holiday: colors.status.holiday,
  pending: colors.status.pending,
  halfDay: colors.status.halfDay,
};

export const hslToRgb = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const r = Math.round(f(0) * 255);
  const g = Math.round(f(8) * 255);
  const b = Math.round(f(4) * 255);
  return `rgb(${r} ${g} ${b})`;
};

export const getStatusColor = (status) => {
  return statusColors[status] || colors.muted;
};

export const hexToRgba = (hex, opacity) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default {
  colors,
  colorScale,
  glass,
  shadows,
  gradients,
  radius,
  easing,
  chartTooltipStyle,
  chartColors,
  statusColors,
  hslToRgb,
  getStatusColor,
  hexToRgba,
};