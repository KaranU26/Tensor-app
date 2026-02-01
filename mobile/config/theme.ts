/**
 * Design System - Theme Tokens
 * Premium aesthetic with 60-30-10 color rule
 * 
 * Research: "Avoid pure black (#000000) - use soft darks like #0A0A0F"
 */

// Light mode colors
export const lightColors = {
  // Primary
  primary: '#FF6B6B',       // Coral/salmon accent
  primaryLight: '#FF8A8A',
  primaryDark: '#E55555',
  
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceElevated: '#FFFFFF',
  
  // Text
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Borders & Dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Chart colors
  chartBlue: '#3B82F6',
  chartOrange: '#F59E0B',
  chartRed: '#EF4444',
  chartGreen: '#10B981',
};

// Dark mode colors - Premium aesthetic
// Following 60-30-10 rule:
// 60% - Dark neutrals (#0A0A0F, #14141A)
// 30% - Surface neutral (#1E1E26)
// 10% - Accent gradient (coral)
export const darkColors = {
  // Primary - slightly warmer for dark mode
  primary: '#FF7B7B',
  primaryLight: '#FF9A9A',
  primaryDark: '#E56565',
  
  // Backgrounds - soft blacks, never pure #000
  background: '#0A0A0F',     // Deep charcoal, not pure black
  surface: '#14141A',        // Elevated surface
  surfaceElevated: '#1E1E26', // Cards, modals
  
  // Text
  text: '#F5F5F7',           // Soft white
  textSecondary: '#A1A1AA',
  textTertiary: '#6B6B76',
  textInverse: '#0A0A0F',
  
  // Borders & Dividers
  border: '#2A2A35',
  borderLight: '#1E1E26',
  
  // Status - slightly muted for dark mode
  success: '#22C55E',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  // Chart colors
  chartBlue: '#60A5FA',
  chartOrange: '#FBBF24',
  chartRed: '#F87171',
  chartGreen: '#22C55E',
};

// Default to light mode (can be switched based on system preference)
export const colors = lightColors;

// Premium gradients
export const gradients = {
  // Primary CTA gradient
  primary: ['#FF6B6B', '#FF8E53'] as const,
  primaryReverse: ['#FF8E53', '#FF6B6B'] as const,
  
  // Success gradient
  success: ['#10B981', '#34D399'] as const,
  
  // Premium dark gradient for cards
  darkCard: ['#1E1E26', '#14141A'] as const,
  
  // Subtle glow effect
  glow: ['rgba(255, 107, 107, 0.2)', 'rgba(255, 107, 107, 0)'] as const,
  
  // Background gradient
  backgroundDark: ['#0A0A0F', '#14141A'] as const,
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
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const typography = {
  // Headings
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
    letterSpacing: 0.37,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
    letterSpacing: 0.38,
  },
  
  // Body
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
    letterSpacing: -0.32,
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  // Colored glow shadow for CTAs
  glow: {
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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

