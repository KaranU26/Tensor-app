/**
 * Recovery Screen
 * Full-page muscle recovery visualization
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecovery } from '@/hooks/useRecovery';
import { RecoveryHeatmap } from '@/components/RecoveryHeatmap';
import { colors, typography, spacing, gradients } from '@/config/theme';
import { Card } from '@/components/ui';

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
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}
        >
          <Text style={styles.title}>Recovery Status</Text>
          <Text style={styles.subtitle}>Based on your recent workouts</Text>
        </View>

        {/* Recommendation Card */}
        <Card style={styles.recommendationCard}>
          <View style={styles.readinessRow}>
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.readinessRing}
            >
              <View style={styles.readinessInner}>
                <Text style={styles.readinessScore}>{readinessScore}</Text>
                <Text style={styles.readinessLabel}>Score</Text>
              </View>
            </LinearGradient>
            <View style={styles.recommendationCopy}>
              <Text style={styles.emoji}>{getReadinessEmoji()}</Text>
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          </View>
        </Card>

        {/* Recovery Heatmap */}
        <RecoveryHeatmap
          recoveryData={recoveryData}
          showLegend={true}
        />

        {/* Tips Section */}
        <Card style={styles.tipsCard}>
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
        </Card>
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
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  readinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  readinessRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    padding: 3,
  },
  readinessInner: {
    flex: 1,
    borderRadius: 42,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  readinessScore: {
    ...typography.title2,
    color: colors.text,
  },
  readinessLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  recommendationCopy: {
    flex: 1,
  },
  emoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  recommendationText: {
    ...typography.headline,
    color: colors.text,
  },
  tipsCard: {
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
