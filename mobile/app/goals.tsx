import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { colors, typography, spacing, borderRadius, gradients, shadows } from '@/config/theme';
import { Card, Button } from '@/components/ui';
import { MiniLineChart } from '@/components/ui/MiniCharts';
import { EmptyState } from '@/components/EmptyState';
import { useGoalsStore, type FlexGoal } from '@/store/goalsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { Skeleton } from '@/components/AnimatedComponents';

const DAY_MS = 1000 * 60 * 60 * 24;

const getCheckInLabel = (goal: FlexGoal) => {
  if (goal.status === 'completed') return 'Completed';
  if (!goal.lastCheckInAt) return 'No check‑in yet';
  const diffDays = Math.floor((Date.now() - new Date(goal.lastCheckInAt).getTime()) / DAY_MS);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

const getStreakDays = (goal: FlexGoal) => {
  const checkIns = goal.checkIns || [];
  if (checkIns.length === 0) return 0;
  const sorted = [...checkIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const last = sorted[sorted.length - 1];
  const daysSinceLast = (Date.now() - new Date(last.date).getTime()) / DAY_MS;
  if (daysSinceLast > 1.5) return 0;
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i -= 1) {
    const diff = (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) / DAY_MS;
    if (diff <= 1.5) streak += 1;
    else break;
  }
  return streak;
};

const checkInOptions = [
  { id: 'video', title: 'Video Check‑In', subtitle: 'Compare angles visually' },
  { id: 'manual', title: 'Manual Measurement', subtitle: 'Log ROM degrees' },
  { id: 'self', title: 'Self‑Assessment', subtitle: 'Rate your mobility' },
];

export default function GoalsScreen() {
  const [tab, setTab] = useState<'active' | 'completed'>('active');
  const { isAuthenticated } = useAuthStore();
  const userGoals = useGoalsStore((state) => state.goals);
  const loading = useGoalsStore((state) => state.loading);
  const fetchGoals = useGoalsStore((state) => state.fetchGoals);
  const notifications = useSettingsStore((state) => state.notifications);
  const goalNotificationsEnabled = notifications.notificationsEnabled && notifications.goalNotifications;

  useEffect(() => {
    if (isAuthenticated) fetchGoals();
  }, [isAuthenticated]);

  const activeGoals = useMemo(
    () => userGoals.filter((goal) => goal.status === 'active'),
    [userGoals]
  );
  const completedGoals = useMemo(
    () => userGoals.filter((goal) => goal.status === 'completed'),
    [userGoals]
  );

  const goals = useMemo(() => (tab === 'active' ? activeGoals : completedGoals), [tab, activeGoals, completedGoals]);

  const overdueGoal = useMemo(() => {
    if (!goalNotificationsEnabled) return null;
    const now = Date.now();
    return activeGoals.find((goal) => {
      const referenceDate = goal.lastCheckInAt ? new Date(goal.lastCheckInAt).getTime() : new Date(goal.createdAt).getTime();
      const daysSince = Math.floor((now - referenceDate) / DAY_MS);
      return daysSince >= 14;
    }) || null;
  }, [activeGoals, goalNotificationsEnabled]);

  const handleCreateGoal = () => {
    router.push('/goal-create');
  };

  const getProgress = (goal: FlexGoal) => {
    const range = Math.max(goal.targetRom - goal.baselineRom, 1);
    const progress = Math.round(((goal.currentRom - goal.baselineRom) / range) * 100);
    return Math.min(100, Math.max(0, progress));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInUp.delay(50).duration(250)} style={styles.header}>
          <View>
            <Text style={styles.title}>Flexibility Goals</Text>
            <Text style={styles.subtitle}>Track ROM progress and consistency</Text>
          </View>
          <Button title="New Goal" size="sm" onPress={handleCreateGoal} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(250)} style={styles.tabRow}>
          {(['active', 'completed'] as const).map((item) => {
            const isActive = tab === item;
            return (
              <Pressable
                key={item}
                onPress={() => setTab(item)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {item === 'active' ? 'Active' : 'Completed'}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>

        {loading && (
          <View style={{ gap: spacing.lg }}>
            {[0, 1].map((i) => (
              <View key={i} style={{ backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.borderLight }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <Skeleton width="60%" height={20} borderRadius={6} />
                    <Skeleton width="40%" height={14} borderRadius={4} style={{ marginTop: spacing.xs }} />
                  </View>
                  <Skeleton width={72} height={72} borderRadius={36} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
                  {[0, 1, 2].map((j) => (
                    <View key={j} style={{ alignItems: 'center' }}>
                      <Skeleton width={50} height={12} borderRadius={4} />
                      <Skeleton width={36} height={18} borderRadius={6} style={{ marginTop: spacing.xs }} />
                    </View>
                  ))}
                </View>
                <Skeleton width="100%" height={10} borderRadius={999} />
              </View>
            ))}
          </View>
        )}

        {!isAuthenticated && !loading && (
          <Card style={styles.goalCard}>
            <Text style={styles.goalTitle}>Sign in to track goals</Text>
            <Text style={styles.goalSubtitle}>Create flexibility goals and track ROM progress.</Text>
          </Card>
        )}

        {overdueGoal && (
          <Animated.View entering={FadeInUp.delay(110).duration(250)}>
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.reminderCard}
            >
              <View style={styles.reminderContent}>
                <Text style={styles.reminderBadge}>ROM CHECK‑IN DUE</Text>
                <Text style={styles.reminderTitle}>It’s been a while since your last measurement.</Text>
                <Text style={styles.reminderSubtitle}>Keep your progress accurate for better recommendations.</Text>
              </View>
              <Pressable
                style={styles.reminderButton}
                onPress={() => router.push({ pathname: '/goal-checkin', params: { goalId: overdueGoal.id } })}
              >
                <Text style={styles.reminderButtonText}>Log check‑in</Text>
              </Pressable>
            </LinearGradient>
          </Animated.View>
        )}

        {goals.length === 0 ? (
          <EmptyState
            type="flexibility"
            customTitle="No goals yet"
            customMessage="Create a flexibility goal and start tracking ROM improvements."
            customActionLabel="Create Goal"
            onAction={handleCreateGoal}
            style={{ paddingVertical: spacing.xxl }}
          />
        ) : (
          goals.map((goal, index) => {
            const progress = getProgress(goal);
            return (
              <Animated.View
                key={goal.id}
                entering={FadeInUp.delay(150 + index * 80).duration(250)}
              >
                <Card style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalTitleBlock}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalSubtitle}>{goal.targetArea}</Text>
                    </View>
                    <LinearGradient
                      colors={gradients.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.goalRing}
                    >
                      <View style={styles.goalRingInner}>
                        <Text style={styles.goalRingValue}>{progress}%</Text>
                        <Text style={styles.goalRingLabel}>Progress</Text>
                      </View>
                    </LinearGradient>
                  </View>

                  <View style={styles.goalMetaRow}>
                    <View style={styles.goalMeta}>
                      <Text style={styles.goalMetaLabel}>Baseline</Text>
                      <Text style={styles.goalMetaValue}>{goal.baselineRom}°</Text>
                    </View>
                    <View style={styles.goalMeta}>
                      <Text style={styles.goalMetaLabel}>Current</Text>
                      <Text style={styles.goalMetaValue}>{goal.currentRom}°</Text>
                    </View>
                    <View style={styles.goalMeta}>
                      <Text style={styles.goalMetaLabel}>Target</Text>
                      <Text style={styles.goalMetaValue}>{goal.targetRom}°</Text>
                    </View>
                  </View>

                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>

                  <View style={styles.goalFooter}>
                    <View>
                      <Text style={styles.goalFooterLabel}>Last check‑in</Text>
                      <Text style={styles.goalFooterValue}>{getCheckInLabel(goal)}</Text>
                    </View>
                    <View style={styles.goalFooterMeta}>
                      <Text style={styles.goalFooterLabel}>Target date</Text>
                      <Text style={styles.goalFooterValue}>{goal.targetDate}</Text>
                    </View>
                  </View>

                  <View style={styles.goalStatsRow}>
                    <View style={styles.goalStatPill}>
                      <Text style={styles.goalStatValue}>{goal.sessionsCompleted}</Text>
                      <Text style={styles.goalStatLabel}>Sessions</Text>
                    </View>
                    <View style={styles.goalStatPill}>
                      <Text style={styles.goalStatValue}>{getStreakDays(goal)}</Text>
                      <Text style={styles.goalStatLabel}>Day streak</Text>
                    </View>
                    <View style={styles.goalStatPill}>
                      <Text style={styles.goalStatValue}>{goal.method}</Text>
                      <Text style={styles.goalStatLabel}>Method</Text>
                    </View>
                  </View>

                  <View style={styles.goalChartRow}>
                    <Text style={styles.goalChartLabel}>ROM trend</Text>
                    <MiniLineChart data={goal.history} width={140} height={40} color={colors.accent} />
                  </View>

                  <View style={styles.goalActions}>
                    <Pressable
                      style={styles.goalActionButton}
                      onPress={() => router.push({ pathname: '/goal-checkin', params: { goalId: goal.id } })}
                    >
                      <Text style={styles.goalActionText}>Log check‑in</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.goalActionButton, styles.goalActionSecondary]}
                      onPress={() => router.push('/goal-create')}
                    >
                      <Text style={[styles.goalActionText, styles.goalActionSecondaryText]}>New goal</Text>
                    </Pressable>
                  </View>
                </Card>
              </Animated.View>
            );
          })
        )}

        <Animated.View entering={FadeInUp.delay(320).duration(250)}>
          <Card style={styles.checkInCard}>
            <View style={styles.checkInHeader}>
              <Text style={styles.checkInTitle}>ROM Check‑In</Text>
              <Text style={styles.checkInSubtitle}>Log progress with your preferred method</Text>
            </View>
            <View style={styles.checkInOptions}>
              {checkInOptions.map((option) => (
                <Pressable key={option.id} style={styles.checkInOption}>
                  <Text style={styles.checkInOptionTitle}>{option.title}</Text>
                  <Text style={styles.checkInOptionSubtitle}>{option.subtitle}</Text>
                </Pressable>
              ))}
            </View>
            <Button title="Log Check‑In" onPress={() => router.push('/goal-checkin')} fullWidth />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(380).duration(250)}>
          <Card style={styles.insightCard}>
            <Text style={styles.insightTitle}>Flexibility Insights</Text>
            <View style={styles.insightRow}>
              <LinearGradient colors={gradients.primary} style={styles.insightDot} />
              <Text style={styles.insightText}>Hamstrings improving +15° over 8 weeks.</Text>
            </View>
            <View style={styles.insightRow}>
              <View style={[styles.insightDot, styles.insightDotAlt]} />
              <Text style={styles.insightText}>Shoulder ROM plateaued. Try a mobility block.</Text>
            </View>
            <View style={styles.insightRow}>
              <View style={[styles.insightDot, styles.insightDotAlt2]} />
              <Text style={styles.insightText}>Best progress after 3+ sessions/week.</Text>
            </View>
          </Card>
        </Animated.View>
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
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title1,
    color: colors.text,
  },
  subtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textInverse,
  },
  goalCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  goalTitleBlock: {
    flex: 1,
  },
  goalTitle: {
    ...typography.title3,
    color: colors.text,
  },
  goalSubtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  goalRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
  },
  goalRingInner: {
    flex: 1,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  goalRingValue: {
    ...typography.headline,
    color: colors.text,
  },
  goalRingLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  goalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  goalMeta: {
    alignItems: 'center',
  },
  goalMetaLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  goalMetaValue: {
    ...typography.headline,
    color: colors.text,
    marginTop: spacing.xs,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.borderLight,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  goalFooterMeta: {
    alignItems: 'flex-end',
  },
  goalFooterLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  goalFooterValue: {
    ...typography.subhead,
    color: colors.text,
    marginTop: spacing.xs,
  },
  goalStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  goalStatPill: {
    flex: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  goalStatValue: {
    ...typography.footnote,
    color: colors.text,
    textAlign: 'center',
  },
  goalStatLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginTop: 2,
  },
  goalChartRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalChartLabel: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  goalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  goalActionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  goalActionSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  goalActionText: {
    ...typography.caption1,
    color: colors.textInverse,
  },
  goalActionSecondaryText: {
    color: colors.textSecondary,
  },
  reminderCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  reminderContent: {
    marginBottom: spacing.sm,
  },
  reminderBadge: {
    ...typography.caption2,
    color: colors.textInverse,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  reminderTitle: {
    ...typography.title3,
    color: colors.textInverse,
  },
  reminderSubtitle: {
    ...typography.subhead,
    color: colors.textInverse,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  reminderButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  reminderButtonText: {
    ...typography.caption1,
    color: colors.accentDark,
  },
  checkInCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  checkInHeader: {
    marginBottom: spacing.md,
  },
  checkInTitle: {
    ...typography.title3,
    color: colors.text,
  },
  checkInSubtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  checkInOptions: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  checkInOption: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  checkInOptionTitle: {
    ...typography.headline,
    color: colors.text,
  },
  checkInOptionSubtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  insightCard: {
    padding: spacing.lg,
  },
  insightTitle: {
    ...typography.title3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  insightDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  insightDotAlt: {
    backgroundColor: colors.accent,
  },
  insightDotAlt2: {
    backgroundColor: colors.primary,
  },
  insightText: {
    ...typography.subhead,
    color: colors.textSecondary,
    flex: 1,
  },
});
