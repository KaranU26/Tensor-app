/**
 * Bento Grid Component
 * Modular dashboard layout inspired by widget ecosystems
 * 
 * Research: "Bento Box grid organizes complex information into distinct modules"
 */

import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows, gradients, typography } from '@/config/theme';

// Bento cell sizes
type BentoSize = 'small' | 'medium' | 'large' | 'wide' | 'tall';

interface BentoCellProps {
  size?: BentoSize;
  children: React.ReactNode;
  gradient?: readonly [string, string];
  style?: ViewStyle;
  delay?: number;
}

/**
 * Individual Bento Cell
 */
export function BentoCell({
  size = 'small',
  children,
  gradient,
  style,
  delay = 0,
}: BentoCellProps) {
  const sizeStyle = SIZE_STYLES[size];

  const content = (
    <View style={[styles.cellContent, sizeStyle]}>
      {children}
    </View>
  );

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(300)}
      style={[styles.cell, sizeStyle, style]}
    >
      {gradient ? (
        <LinearGradient
          colors={gradient}
          style={[StyleSheet.absoluteFill, styles.gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      ) : null}
      {content}
    </Animated.View>
  );
}

/**
 * Stat Cell - Pre-styled for statistics display
 */
interface StatCellProps {
  icon: string;
  value: string | number;
  label: string;
  trend?: { value: number; positive: boolean };
  size?: BentoSize;
  gradient?: readonly [string, string];
  delay?: number;
}

export function StatCell({
  icon,
  value,
  label,
  trend,
  size = 'small',
  gradient,
  delay = 0,
}: StatCellProps) {
  return (
    <BentoCell size={size} gradient={gradient} delay={delay}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {trend && (
        <View style={[styles.trend, trend.positive ? styles.trendUp : styles.trendDown]}>
          <Text style={styles.trendText}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </Text>
        </View>
      )}
    </BentoCell>
  );
}

/**
 * Bento Grid Container
 */
interface BentoGridProps {
  children: React.ReactNode;
  columns?: 2 | 3;
  style?: ViewStyle;
}

export function BentoGrid({ children, columns = 2, style }: BentoGridProps) {
  return (
    <View style={[styles.grid, { gap: spacing.md }, style]}>
      {children}
    </View>
  );
}

/**
 * Bento Row - For horizontal arrangement
 */
interface BentoRowProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function BentoRow({ children, style }: BentoRowProps) {
  return (
    <View style={[styles.row, style]}>
      {children}
    </View>
  );
}

// Size configurations
const SIZE_STYLES: Record<BentoSize, ViewStyle> = {
  small: {
    flex: 1,
    minHeight: 100,
  },
  medium: {
    flex: 1,
    minHeight: 140,
  },
  large: {
    flex: 2,
    minHeight: 180,
  },
  wide: {
    flex: 2,
    minHeight: 100,
  },
  tall: {
    flex: 1,
    minHeight: 200,
  },
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'column',
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cell: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cellContent: {
    padding: spacing.lg,
    justifyContent: 'center',
  },
  gradient: {
    borderRadius: borderRadius.xl,
  },
  // Stat cell styles
  statIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.title1,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  trend: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  trendUp: {
    backgroundColor: `${colors.success}20`,
  },
  trendDown: {
    backgroundColor: `${colors.error}20`,
  },
  trendText: {
    ...typography.caption2,
    fontWeight: '600',
  },
});

export default {
  BentoGrid,
  BentoRow,
  BentoCell,
  StatCell,
};
