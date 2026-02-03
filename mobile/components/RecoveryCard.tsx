/**
 * Recovery Dashboard Card
 * Summary card for home screen with quick recovery status
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRecovery } from '@/hooks/useRecovery';
import { colors, typography, spacing, borderRadius, shadows, gradients } from '@/config/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface RecoveryCardProps {
  onPress?: () => void;
}

export function RecoveryCard({ onPress }: RecoveryCardProps) {
  const router = useRouter();
  const { readinessScore, recommendation, readyMuscles, avoidMuscles, isLoading } = useRecovery();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to full recovery screen
      router.push('/recovery');
    }
  };

  const getReadinessEmoji = () => {
    if (readinessScore >= 80) return '💪';
    if (readinessScore >= 60) return '👍';
    if (readinessScore >= 40) return '😐';
    return '😴';
  };

  const getReadinessColor = () => {
    if (readinessScore >= 80) return colors.success;
    if (readinessScore >= 40) return colors.warning;
    return colors.error;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingPlaceholder} />
      </View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.delay(200)}>
      <Pressable style={styles.container} onPress={handlePress}>
        <View style={styles.header}>
          <Text style={styles.title}>Recovery Status</Text>
          <Text style={styles.emoji}>{getReadinessEmoji()}</Text>
        </View>

        {/* Readiness Ring */}
        <View style={styles.readinessSection}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ring}
          >
            <View style={styles.ringInner}>
              <Text style={[styles.score, { color: getReadinessColor() }]}>
                {readinessScore}%
              </Text>
              <Text style={styles.scoreLabel}>Ready</Text>
            </View>
          </LinearGradient>

          <View style={styles.details}>
            <Text style={styles.recommendation}>{recommendation}</Text>
            
            {readyMuscles.length > 0 && (
              <View style={styles.muscleSection}>
                <Text style={styles.muscleLabel}>Ready to train:</Text>
                <View style={styles.muscleTags}>
                  {readyMuscles.slice(0, 4).map((m) => (
                    <View key={m} style={[styles.muscleTag, styles.readyTag]}>
                      <Text style={styles.muscleTagText}>{m}</Text>
                    </View>
                  ))}
                  {readyMuscles.length > 4 && (
                    <Text style={styles.moreText}>+{readyMuscles.length - 4}</Text>
                  )}
                </View>
              </View>
            )}

            {avoidMuscles.length > 0 && (
              <View style={styles.muscleSection}>
                <Text style={styles.muscleLabel}>Avoid:</Text>
                <View style={styles.muscleTags}>
                  {avoidMuscles.slice(0, 3).map((m) => (
                    <View key={m} style={[styles.muscleTag, styles.avoidTag]}>
                      <Text style={styles.muscleTagText}>{m}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.tapHint}>Tap for details →</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  loadingPlaceholder: {
    height: 120,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headline,
    color: colors.text,
  },
  emoji: {
    fontSize: 24,
  },
  readinessSection: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  ring: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    flex: 1,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  score: {
    ...typography.title2,
    fontWeight: '800',
  },
  scoreLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  recommendation: {
    ...typography.footnote,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  muscleSection: {
    marginTop: spacing.xs,
  },
  muscleLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  muscleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  muscleTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  readyTag: {
    backgroundColor: `${colors.success}20`,
  },
  avoidTag: {
    backgroundColor: `${colors.error}20`,
  },
  muscleTagText: {
    ...typography.caption2,
    color: colors.text,
    textTransform: 'capitalize',
  },
  moreText: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  tapHint: {
    ...typography.caption2,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.md,
  },
});

export default RecoveryCard;
