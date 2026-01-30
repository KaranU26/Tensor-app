/**
 * Recovery Screen
 * Full-page muscle recovery visualization
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecovery } from '@/hooks/useRecovery';
import { RecoveryHeatmap } from '@/components/RecoveryHeatmap';
import { colors, typography, spacing, borderRadius } from '@/config/theme';

export default function RecoveryScreen() {
  const {
    recoveryData,
    readinessScore,
    recommendation,
    isLoading,
    refresh,
  } = useRecovery();

  const getReadinessEmoji = () => {
    if (readinessScore >= 80) return '💪';
    if (readinessScore >= 60) return '👍';
    if (readinessScore >= 40) return '😐';
    return '😴';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Recovery Status</Text>
          <Text style={styles.subtitle}>Based on your recent workouts</Text>
        </View>

        {/* Recommendation Card */}
        <View style={styles.recommendationCard}>
          <Text style={styles.emoji}>{getReadinessEmoji()}</Text>
          <Text style={styles.recommendationText}>{recommendation}</Text>
        </View>

        {/* Recovery Heatmap */}
        <RecoveryHeatmap
          recoveryData={recoveryData}
          showLegend={true}
        />

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Recovery Tips</Text>
          <View style={styles.tipRow}>
            <Text style={styles.tipEmoji}>💤</Text>
            <Text style={styles.tipText}>Sleep 7-9 hours for optimal recovery</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipEmoji}>💧</Text>
            <Text style={styles.tipText}>Stay hydrated with 3L+ water daily</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipEmoji}>🥩</Text>
            <Text style={styles.tipText}>Consume 1.6-2.2g protein per kg bodyweight</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipEmoji}>🧘</Text>
            <Text style={styles.tipText}>Light stretching speeds recovery</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.largeTitle,
    color: colors.text,
  },
  subtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  emoji: {
    fontSize: 36,
  },
  recommendationText: {
    flex: 1,
    ...typography.headline,
    color: colors.text,
  },
  tipsCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  tipsTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  tipEmoji: {
    fontSize: 20,
  },
  tipText: {
    ...typography.footnote,
    color: colors.textSecondary,
    flex: 1,
  },
});
