/**
 * Recovery Heatmap Component
 * SVG body silhouette showing muscle recovery status
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  type MuscleRecoveryStatus,
  type MuscleGroup,
  formatRecoveryTime,
} from '@/lib/recoveryEngine';
import { colors, typography, spacing, borderRadius } from '@/config/theme';

interface RecoveryHeatmapProps {
  recoveryData: MuscleRecoveryStatus[];
  onMusclePress?: (muscle: MuscleGroup) => void;
  showLegend?: boolean;
}

// SVG paths for front body muscles (simplified)
const FRONT_MUSCLE_PATHS: Record<string, string> = {
  chest: 'M35,55 Q50,50 65,55 L65,70 Q50,75 35,70 Z',
  shoulders_front: 'M25,50 L35,55 L35,65 L25,60 Z M65,55 L75,50 L75,60 L65,65 Z',
  biceps: 'M20,65 L28,65 L28,85 L20,85 Z M72,65 L80,65 L80,85 L72,85 Z',
  forearms_front: 'M18,90 L26,88 L26,110 L18,110 Z M74,88 L82,90 L82,110 L74,110 Z',
  core: 'M40,75 L60,75 L60,105 L40,105 Z',
  quads: 'M35,110 L45,110 L45,145 L35,145 Z M55,110 L65,110 L65,145 L55,145 Z',
};

// SVG paths for back body muscles (simplified)
const BACK_MUSCLE_PATHS: Record<string, string> = {
  back: 'M35,55 L65,55 L65,100 L35,100 Z',
  shoulders_back: 'M25,50 L35,55 L35,65 L25,60 Z M65,55 L75,50 L75,60 L65,65 Z',
  triceps: 'M20,65 L28,65 L28,85 L20,85 Z M72,65 L80,65 L80,85 L72,85 Z',
  forearms_back: 'M18,90 L26,88 L26,110 L18,110 Z M74,88 L82,90 L82,110 L74,110 Z',
  glutes: 'M35,105 L65,105 L65,120 L35,120 Z',
  hamstrings: 'M35,125 L45,125 L45,155 L35,155 Z M55,125 L65,125 L65,155 L55,155 Z',
  calves_back: 'M37,160 L45,160 L45,185 L37,185 Z M55,160 L63,160 L63,185 L55,185 Z',
};

// Map recovery data muscle names to SVG paths
const MUSCLE_TO_PATH_MAP: Record<MuscleGroup, { front?: string; back?: string }> = {
  chest: { front: 'chest' },
  back: { back: 'back' },
  shoulders: { front: 'shoulders_front', back: 'shoulders_back' },
  biceps: { front: 'biceps' },
  triceps: { back: 'triceps' },
  forearms: { front: 'forearms_front', back: 'forearms_back' },
  quads: { front: 'quads' },
  hamstrings: { back: 'hamstrings' },
  glutes: { back: 'glutes' },
  calves: { back: 'calves_back' },
  core: { front: 'core' },
};

export function RecoveryHeatmap({
  recoveryData,
  onMusclePress,
  showLegend = true,
}: RecoveryHeatmapProps) {
  // Build color map from recovery data
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    recoveryData.forEach((r) => {
      const paths = MUSCLE_TO_PATH_MAP[r.muscle];
      if (paths?.front) map[paths.front] = r.color;
      if (paths?.back) map[paths.back] = r.color;
    });
    return map;
  }, [recoveryData]);

  const renderMusclePaths = (paths: Record<string, string>, side: 'front' | 'back') => {
    return Object.entries(paths).map(([key, path]) => (
      <Path
        key={`${side}-${key}`}
        d={path}
        fill={colorMap[key] || colors.surface}
        stroke={colors.border}
        strokeWidth={0.5}
        opacity={0.85}
      />
    ));
  };

  // Calculate overall readiness
  const avgRecovery = recoveryData.length > 0
    ? Math.round(recoveryData.reduce((sum, r) => sum + r.recoveryPercent, 0) / recoveryData.length)
    : 100;

  const readinessColor = avgRecovery >= 80 ? colors.success : avgRecovery >= 40 ? colors.warning : colors.error;

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      {/* Readiness Score */}
      <View style={styles.readinessContainer}>
        <Text style={styles.readinessLabel}>Body Readiness</Text>
        <Text style={[styles.readinessScore, { color: readinessColor }]}>
          {avgRecovery}%
        </Text>
      </View>

      {/* Body Silhouettes */}
      <View style={styles.bodyContainer}>
        {/* Front View */}
        <View style={styles.bodyView}>
          <Text style={styles.viewLabel}>Front</Text>
          <Svg width={100} height={200} viewBox="0 0 100 200">
            {/* Body outline */}
            <Path
              d="M50,10 Q65,10 65,25 L65,45 Q75,45 75,60 L80,110 L74,110 Q70,130 65,145 L65,190 L55,190 L55,145 Q50,145 45,145 L45,190 L35,190 L35,145 Q30,130 26,110 L20,110 L25,60 Q25,45 35,45 L35,25 Q35,10 50,10 Z"
              fill={colors.surfaceElevated}
              stroke={colors.border}
              strokeWidth={1}
            />
            {/* Muscle overlays */}
            <G>{renderMusclePaths(FRONT_MUSCLE_PATHS, 'front')}</G>
          </Svg>
        </View>

        {/* Back View */}
        <View style={styles.bodyView}>
          <Text style={styles.viewLabel}>Back</Text>
          <Svg width={100} height={200} viewBox="0 0 100 200">
            {/* Body outline */}
            <Path
              d="M50,10 Q65,10 65,25 L65,45 Q75,45 75,60 L80,110 L74,110 Q70,130 65,145 L65,190 L55,190 L55,145 Q50,145 45,145 L45,190 L35,190 L35,145 Q30,130 26,110 L20,110 L25,60 Q25,45 35,45 L35,25 Q35,10 50,10 Z"
              fill={colors.surfaceElevated}
              stroke={colors.border}
              strokeWidth={1}
            />
            {/* Muscle overlays */}
            <G>{renderMusclePaths(BACK_MUSCLE_PATHS, 'back')}</G>
          </Svg>
        </View>
      </View>

      {/* Legend */}
      {showLegend && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Fatigued</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Recovering</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.legendText}>Ready</Text>
          </View>
        </View>
      )}

      {/* Muscle List */}
      <View style={styles.muscleList}>
        {recoveryData.map((r) => (
          <Pressable
            key={r.muscle}
            style={styles.muscleRow}
            onPress={() => onMusclePress?.(r.muscle)}
          >
            <View style={[styles.statusDot, { backgroundColor: r.color }]} />
            <Text style={styles.muscleName}>
              {r.muscle.charAt(0).toUpperCase() + r.muscle.slice(1)}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${r.recoveryPercent}%`, backgroundColor: r.color },
                ]}
              />
            </View>
            <Text style={styles.recoveryTime}>
              {r.hoursUntilRecovered > 0 ? formatRecoveryTime(r.hoursUntilRecovered) : '✓'}
            </Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  readinessContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  readinessLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  readinessScore: {
    fontSize: 48,
    fontWeight: '800',
  },
  bodyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  bodyView: {
    alignItems: 'center',
  },
  viewLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  muscleList: {
    gap: spacing.sm,
  },
  muscleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  muscleName: {
    width: 90,
    ...typography.footnote,
    color: colors.text,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  recoveryTime: {
    width: 50,
    ...typography.caption2,
    color: colors.textSecondary,
    textAlign: 'right',
  },
});

export default RecoveryHeatmap;
