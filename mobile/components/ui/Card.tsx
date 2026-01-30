import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '@/config/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'flat' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ 
  children, 
  style, 
  variant = 'elevated',
  padding = 'md' 
}: CardProps) {
  return (
    <View style={[
      styles.base,
      variant === 'elevated' && styles.elevated,
      variant === 'flat' && styles.flat,
      variant === 'outlined' && styles.outlined,
      padding === 'sm' && styles.paddingSm,
      padding === 'md' && styles.paddingMd,
      padding === 'lg' && styles.paddingLg,
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  elevated: {
    ...shadows.md,
  },
  flat: {
    backgroundColor: colors.surface,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  paddingSm: {
    padding: spacing.sm,
  },
  paddingMd: {
    padding: spacing.lg,
  },
  paddingLg: {
    padding: spacing.xl,
  },
});

export default Card;
