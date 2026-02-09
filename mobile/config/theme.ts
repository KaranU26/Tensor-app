/**
 * Design System - Theme Tokens
 * Tensor brand palette: warm surfaces + plum/flame accents
 */

const fonts = {
  headingBold: 'Sora_700Bold',
  headingSemi: 'Sora_600SemiBold',
  bodyRegular: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
};

// Light mode colors (primary experience)
export const lightColors = {
  // Brand
  primary: '#FF8A3D',       // Flame
  primaryLight: '#FFB071',
  primaryDark: '#E56E21',
  accent: '#7B3FA1',        // Plum
  accentDark: '#4B2D72',

  // Backgrounds
  background: '#F6F3F1',    // Warm base
  surface: '#FFFFFF',       // Cards
  surfaceElevated: '#FFFFFF',

  // Text
  text: '#1A1226',          // Ink
  textSecondary: '#5B5364',
  textTertiary: '#8C8296',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#E9E1DB',
  borderLight: '#F3EEE9',

  // Status
  success: '#2FB67C',
  warning: '#F2B33D',
  error: '#F45B5B',
  info: '#7B3FA1',

  // Chart colors
  chartBlue: '#4E8CFF',
  chartOrange: '#FF8A3D',
  chartRed: '#F45B5B',
  chartGreen: '#2FB67C',
  chartPurple: '#7B3FA1',
};

// Dark mode colors (primary experience)
export const darkColors = {
  primary: '#FF9A54',
  primaryLight: '#FFB879',
  primaryDark: '#E37229',
  accent: '#9B5AC2',
  accentLight: '#B77DDB',
  accentDark: '#6B3A93',

  background: '#0F0B16',
  surface: '#171321',
  surfaceElevated: '#1E182B',
  surfaceGlow: '#1E182B',

  text: '#F5F2F7',
  textSecondary: '#B7AFC2',
  textTertiary: '#8B8296',
  textInverse: '#FFFFFF',

  border: '#2A2336',
  borderLight: '#1E182B',
  borderGlow: 'rgba(123, 63, 161, 0.25)',
  glowFlame: 'rgba(255, 138, 61, 0.15)',

  success: '#3DD598',
  warning: '#F4C24D',
  error: '#F9797A',
  info: '#9B5AC2',

  chartBlue: '#6EA1FF',
  chartOrange: '#FF9A54',
  chartRed: '#F9797A',
  chartGreen: '#3DD598',
  chartPurple: '#9B5AC2',
};

// Default to dark mode
export const colors = darkColors;

// Premium gradients
export const gradients = {
  // Primary CTA gradient (plum -> flame)
  primary: ['#7B3FA1', '#FF8A3D'] as const,
  primaryReverse: ['#FF8A3D', '#7B3FA1'] as const,

  // Dark background wash
  background: ['#0F0B16', '#171321'] as const,

  // Accent glow
  glow: ['rgba(123, 63, 161, 0.25)', 'rgba(255, 138, 61, 0.08)'] as const,

  // Plum accent
  glowPlum: ['#7B3FA1', '#5A2D7A'] as const,

  // Flame CTA
  glowFlame: ['#FF8A3D', '#E6642E'] as const,

  // Plum → Flame hero elements
  glowMixed: ['#7B3FA1', '#FF8A3D'] as const,

  // Subtle card surface
  cardSurface: ['#1E182B', '#171321'] as const,

  // Deep background
  nightSky: ['#0F0B16', '#1A1228', '#0F0B16'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,   // Buttons
  xxl: 32,
  full: 9999,
};

export const typography = {
  // Headings
  largeTitle: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 0.2,
    fontFamily: fonts.headingBold,
  },
  title1: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: 0.2,
    fontFamily: fonts.headingBold,
  },
  title2: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0.2,
    fontFamily: fonts.headingSemi,
  },
  title3: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.2,
    fontFamily: fonts.headingSemi,
  },

  // Body
  headline: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 0.1,
    fontFamily: fonts.bodyMedium,
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.1,
    fontFamily: fonts.bodyRegular,
  },
  callout: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
    fontFamily: fonts.bodyMedium,
  },
  subhead: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontFamily: fonts.bodyRegular,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
    fontFamily: fonts.bodyRegular,
  },
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.bodyRegular,
  },
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    fontFamily: fonts.bodyRegular,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  // Colored glow shadow for CTAs
  glow: {
    shadowColor: '#7B3FA1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  // Plum glow (small)
  glowSm: {
    shadowColor: '#7B3FA1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  // Plum glow (medium)
  glowMd: {
    shadowColor: '#7B3FA1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  // Flame glow
  glowFlame: {
    shadowColor: '#FF8A3D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Animation timing constants
export const timing = {
  fast: 150,
  normal: 300,
  slow: 500,
};

export const theme = {
  colors,
  lightColors,
  darkColors,
  gradients,
  spacing,
  borderRadius,
  typography,
  shadows,
  timing,
};

export default theme;
