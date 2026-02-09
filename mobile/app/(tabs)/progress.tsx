import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Pressable,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { colors, typography, spacing, borderRadius } from '@/config/theme';
import { Card } from '@/components/ui';
import { AnimatedCounter } from '@/components/AnimatedComponents';
// MiniBarChart, MiniLineChart, SleepBar will be used when HealthConnect is wired up
import { LinearGradient } from 'expo-linear-gradient';
import MuscleHeatmap from '@/components/MuscleHeatmap';
import { MuscleDistributionChart, ProgressLineChart } from '@/components/charts';
import { useGoalsStore } from '@/store/goalsStore';
import { useAuthStore } from '@/store/authStore';
import { getDashboardStats, getStrengthStats, getMuscleVolume, type DashboardStats, type StrengthStats, type MuscleVolumeData } from '@/lib/api/strength';
import { getLatestBodyMetric, getBodyMetrics } from '@/lib/api/body-metrics';
import useRecovery from '@/hooks/useRecovery';

export default function ProgressScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('7D');
  const ranges: Array<'7D' | '30D' | '90D'> = ['7D', '30D', '90D'];
  const userGoals = useGoalsStore((state) => state.goals);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Real data state
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);
  const [strengthData, setStrengthData] = useState<StrengthStats | null>(null);
  const [muscleData, setMuscleData] = useState<MuscleVolumeData | null>(null);
  const [latestMetric, setLatestMetric] = useState<any>(null);
  const [prevMetric, setPrevMetric] = useState<any>(null);
  const { readinessScore, recommendation, isLoading: recoveryLoading, refresh: refreshRecovery } = useRecovery();

  const rangeDays = range === '7D' ? 7 : range === '30D' ? 30 : 90;

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [dash, strength, muscle] = await Promise.all([
        getDashboardStats().catch(() => null),
        getStrengthStats().catch(() => null),
        getMuscleVolume(rangeDays).catch(() => null),
      ]);
      if (dash) setDashStats(dash);
      if (strength) setStrengthData(strength);
      if (muscle) setMuscleData(muscle);
    } catch {}

    try {
      const latest = await getLatestBodyMetric();
      setLatestMetric(latest);
      const metrics = await getBodyMetrics({ limit: 2 });
      if (metrics.bodyMetrics?.length >= 2) setPrevMetric(metrics.bodyMetrics[1]);
    } catch {}
  }, [isAuthenticated, rangeDays]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshRecovery();
    loadData().finally(() => setRefreshing(false));
  }, [loadData, refreshRecovery]);

  // Goal helpers
  const activeGoal = userGoals.find((goal) => goal.status === 'active');
  const formatCheckInLabel = (date?: string) => {
    if (!date) return 'No check‑in yet';
    const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };
  const getStreakDays = (goal?: typeof activeGoal) => {
    if (!goal || !goal.checkIns || goal.checkIns.length === 0) return 0;
    const sorted = [...goal.checkIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last = sorted[sorted.length - 1];
    const daysSinceLast = (Date.now() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLast > 1.5) return 0;
    let streak = 1;
    for (let i = sorted.length - 1; i > 0; i -= 1) {
      const diff = (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= 1.5) streak += 1;
      else break;
    }
    return streak;
  };
  const getWeeklyCheckIns = (goal?: typeof activeGoal) => {
    if (!goal || !goal.checkIns) return 0;
    const now = Date.now();
    return goal.checkIns.filter((checkIn) => (now - new Date(checkIn.date).getTime()) / (1000 * 60 * 60 * 24) <= 7).length;
  };

  const goalSummaryData = activeGoal
    ? {
        name: activeGoal.title,
        baseline: activeGoal.baselineRom,
        current: activeGoal.currentRom,
        target: activeGoal.targetRom,
        nextCheckIn: formatCheckInLabel(activeGoal.lastCheckInAt),
        progress: Math.min(
          100,
          Math.max(
            0,
            Math.round(
              ((activeGoal.currentRom - activeGoal.baselineRom) /
                Math.max(activeGoal.targetRom - activeGoal.baselineRom, 1)) *
                100
            )
          )
        ),
      }
    : { name: 'No active goal', baseline: 0, current: 0, target: 0, nextCheckIn: '—', progress: 0 };

  // Strength analytics from real data
  const strengthAnalytics = useMemo(() => {
    const totalVol = strengthData?.weekVolume || 0;
    const sessions = strengthData?.weekWorkouts || 0;
    const avgSession = sessions > 0 ? Math.round(totalVol / sessions) : 0;

    // Muscle distribution from real data
    const MUSCLE_COLORS: Record<string, string> = {
      chest: colors.chartOrange, back: colors.accent, shoulders: colors.chartPurple,
      'upper legs': colors.primary, 'lower legs': colors.chartGreen, waist: colors.chartBlue,
      'upper arms': colors.chartRed, 'lower arms': colors.chartPurple, cardio: colors.chartGreen,
    };
    const distribution = muscleData
      ? Object.entries(muscleData.muscleVolume)
          .filter(([, v]) => v > 0)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
          .map(([muscle, sets]) => ({
            muscle: muscle.charAt(0).toUpperCase() + muscle.slice(1),
            sets: Math.round(sets),
            color: MUSCLE_COLORS[muscle] || colors.textSecondary,
          }))
      : [];

    return { totalVolume: totalVol, sessions, avgSession, distribution };
  }, [strengthData, muscleData]);

  // Stretch focus from goals (this was partially real already)
  const stretchFocusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    userGoals.forEach((goal) => {
      if (goal.status !== 'active') return;
      const checkIns = goal.checkIns || [];
      const focusAreas = goal.focusAreas || [];
      if (checkIns.length > 0) {
        checkIns.forEach((checkIn) => {
          checkIn.areas.forEach((area) => {
            counts[area] = (counts[area] || 0) + 1;
          });
        });
      } else {
        focusAreas.forEach((area) => {
          counts[area] = (counts[area] || 0) + 1;
        });
      }
    });
    return counts;
  }, [userGoals]);

  const flexibilityAnalytics = {
    romTrend: activeGoal
      ? activeGoal.history.map((value, index) => ({ x: `W${index + 1}`, y: value }))
      : [],
    stretchFocus: stretchFocusCounts,
    consistency: {
      targetPerWeek: 4,
      completedThisWeek: activeGoal ? getWeeklyCheckIns(activeGoal) : 0,
      streakDays: activeGoal ? getStreakDays(activeGoal) : (dashStats?.currentStreak || 0),
      lastCheckIn: activeGoal ? formatCheckInLabel(activeGoal.lastCheckInAt) : '—',
    },
  };

  // Recovery from real hook data
  const recoveryAnalytics = {
    readinessAvg: readinessScore,
    focus: recommendation || 'Complete workouts to see recovery data',
  };

  // Body metrics from real API data
  const bodyMetricsSummary = useMemo(() => {
    const weight = latestMetric?.weight || 0;
    const bodyFat = latestMetric?.bodyFatPercentage || 0;
    let changePercent = 0;
    if (latestMetric?.weight && prevMetric?.weight) {
      changePercent = Math.round(((latestMetric.weight - prevMetric.weight) / prevMetric.weight) * 1000) / 10;
    }
    return { weight, bodyFat, changePercent };
  }, [latestMetric, prevMetric]);

  // Dynamic insights from real data
  const insights = useMemo(() => {
    const items: string[] = [];
    if (dashStats?.currentStreak && dashStats.currentStreak > 1) {
      items.push(`${dashStats.currentStreak}-day workout streak — keep it going!`);
    }
    if (activeGoal && activeGoal.currentRom > activeGoal.baselineRom) {
      const gain = activeGoal.currentRom - activeGoal.baselineRom;
      items.push(`ROM up ${gain}° on ${activeGoal.title}.`);
    }
    if (muscleData && Object.keys(muscleData.muscleVolume).length > 0) {
      const sorted = Object.entries(muscleData.muscleVolume).sort(([, a], [, b]) => a - b);
      if (sorted.length > 0 && sorted[0][1] < 3) {
        items.push(`Consider adding more ${sorted[0][0]} work to balance your training.`);
      }
    }
    if (items.length === 0) items.push('Complete a workout to see personalized insights.');
    return items;
  }, [dashStats, activeGoal, muscleData]);

  const rangeLabel = range === '7D' ? 'Last 7 days' : range === '30D' ? 'Last 30 days' : 'Last 90 days';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <ScrollView bounces={false} 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInUp.delay(50).duration(250)}
          style={styles.header}
        >
          <View>
            <Text style={styles.title}>Progress</Text>
            <Text style={styles.subtitle}>{rangeLabel}</Text>
          </View>
          <View style={styles.menuButton}>
            <Text style={styles.menuIcon}>•••</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(70).duration(250)} style={styles.rangeRow}>
          {ranges.map((item) => {
            const isActive = range === item;
            return (
              <Pressable
                key={item}
                onPress={() => setRange(item)}
                style={[styles.rangeChip, isActive && styles.rangeChipActive]}
              >
                <Text style={[styles.rangeText, isActive && styles.rangeTextActive]}>
                  {item === '7D' ? '7 Days' : item === '30D' ? '30 Days' : '90 Days'}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(80).duration(250)}>
          <Pressable onPress={() => router.push('/goals')}>
            <Card style={styles.goalSummaryCard}>
              <View style={styles.goalSummaryHeader}>
                <View>
                  <Text style={styles.goalSummaryTitle}>Flexibility Goal</Text>
                  <Text style={styles.goalSummaryName}>{goalSummaryData.name}</Text>
                </View>
                <LinearGradient
                  colors={[colors.accent, colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.goalSummaryRing}
                >
                  <View style={styles.goalSummaryRingInner}>
                    <Text style={styles.goalSummaryRingValue}>{goalSummaryData.progress}%</Text>
                    <Text style={styles.goalSummaryRingLabel}>ROM</Text>
                  </View>
                </LinearGradient>
              </View>
              <View style={styles.goalSummaryRow}>
                <View>
                  <Text style={styles.goalSummaryLabel}>Baseline</Text>
                  <Text style={styles.goalSummaryValue}>{goalSummaryData.baseline}°</Text>
                </View>
                <View>
                  <Text style={styles.goalSummaryLabel}>Current</Text>
                  <Text style={styles.goalSummaryValue}>{goalSummaryData.current}°</Text>
                </View>
                <View>
                  <Text style={styles.goalSummaryLabel}>Target</Text>
                  <Text style={styles.goalSummaryValue}>{goalSummaryData.target}°</Text>
                </View>
              </View>
              <View style={styles.goalSummaryTrack}>
                <View style={[styles.goalSummaryFill, { width: `${goalSummaryData.progress}%` }]} />
              </View>
              <Text style={styles.goalSummaryHint}>Last check‑in: {goalSummaryData.nextCheckIn}</Text>
            </Card>
          </Pressable>
        </Animated.View>

        <Text style={styles.sectionTitle}>Strength Analytics</Text>
        <Animated.View entering={FadeInUp.delay(110).duration(250)}>
          <Card style={styles.strengthSummaryCard}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardTitle}>Strength Volume</Text>
                <Text style={styles.cardSubtitle}>{rangeLabel}</Text>
              </View>
              {strengthAnalytics.sessions > 0 && (
                <View style={styles.changePill}>
                  <Text style={styles.changeText}>{strengthAnalytics.sessions} sessions</Text>
                </View>
              )}
            </View>
            <View style={styles.statRow}>
              <View style={styles.statBlock}>
                <AnimatedCounter value={strengthAnalytics.totalVolume} style={styles.statValue} />
                <Text style={styles.statLabel}>Total lbs</Text>
              </View>
              <View style={styles.statBlock}>
                <Text style={styles.statValue}>{strengthAnalytics.sessions}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statBlock}>
                <Text style={styles.statValue}>{strengthAnalytics.avgSession.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Avg/session</Text>
              </View>
            </View>
            <Text style={styles.cardHint}>Volume up with better exercise variety.</Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(140).duration(250)}>
          <MuscleDistributionChart
            title="Volume by muscle group"
            data={strengthAnalytics.distribution}
          />
        </Animated.View>

        <Text style={styles.sectionTitle}>Flexibility Analytics</Text>
        <Animated.View entering={FadeInUp.delay(200).duration(250)}>
          <ProgressLineChart
            title={activeGoal ? `${activeGoal.title} ROM progress` : 'Hamstring ROM progress'}
            yLabel="ROM (degrees)"
            data={flexibilityAnalytics.romTrend}
            color={colors.accent}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(230).duration(250)}>
          <Card style={styles.heatmapCard}>
            <Text style={[styles.cardTitle, styles.heatmapTitle]}>Stretch focus heatmap</Text>
            <MuscleHeatmap muscleVolume={flexibilityAnalytics.stretchFocus} showLabels={true} maxVolume={16} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(260).duration(250)}>
          <Card style={styles.flexibilityCard}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardTitle}>Stretch Consistency</Text>
                <Text style={styles.cardSubtitle}>Weekly goal</Text>
              </View>
              <View style={styles.streakPill}>
                <Text style={styles.streakText}>{flexibilityAnalytics.consistency.streakDays} day streak</Text>
              </View>
            </View>
            <View style={styles.consistencyRow}>
              <View style={styles.consistencyBlock}>
                <Text style={styles.consistencyValue}>
                  {flexibilityAnalytics.consistency.completedThisWeek}/{flexibilityAnalytics.consistency.targetPerWeek}
                </Text>
                <Text style={styles.consistencyLabel}>Sessions this week</Text>
              </View>
              <View style={styles.consistencyBlock}>
                <Text style={styles.consistencyValue}>{flexibilityAnalytics.consistency.lastCheckIn}</Text>
                <Text style={styles.consistencyLabel}>Last ROM check-in</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Text style={styles.sectionTitle}>Recovery + Body Metrics</Text>
        <Animated.View entering={FadeInUp.delay(290).duration(250)}>
          <Card style={styles.recoverySummaryCard}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardTitle}>Recovery Snapshot</Text>
                <Text style={styles.cardSubtitle}>{recoveryAnalytics.focus}</Text>
              </View>
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.recoveryRing}
              >
                <View style={styles.recoveryRingInner}>
                  <Text style={styles.recoveryRingValue}>{recoveryAnalytics.readinessAvg}</Text>
                  <Text style={styles.recoveryRingLabel}>Readiness</Text>
                </View>
              </LinearGradient>
            </View>
            <View style={styles.recoveryRow}>
              <View style={styles.recoveryItem}>
                <Text style={styles.recoveryValue}>{dashStats?.weekWorkouts || 0}</Text>
                <Text style={styles.recoveryLabel}>Workouts this week</Text>
              </View>
              <View style={styles.recoveryItem}>
                <Text style={styles.recoveryValue}>{dashStats?.currentStreak || 0}d</Text>
                <Text style={styles.recoveryLabel}>Streak</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(320).duration(250)}>
          <Pressable onPress={() => router.push('/body-metrics')}>
            <Card style={styles.bodyMetricsCard}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.cardTitle}>Body Metrics</Text>
                  <Text style={styles.cardSubtitle}>Latest check-in</Text>
                </View>
                <View style={styles.changePillAlt}>
                  <Text style={styles.changeText}>{bodyMetricsSummary.changePercent}%</Text>
                </View>
              </View>
              <View style={styles.bodyMetricsRow}>
                <View>
                  <Text style={styles.bodyMetricsValue}>{bodyMetricsSummary.weight}</Text>
                  <Text style={styles.bodyMetricsLabel}>lbs</Text>
                </View>
                <View>
                  <Text style={styles.bodyMetricsValue}>{bodyMetricsSummary.bodyFat}%</Text>
                  <Text style={styles.bodyMetricsLabel}>Body fat</Text>
                </View>
                <View style={styles.bodyMetricsHint}>
                  <Text style={styles.bodyMetricsHintText}>Tap for details →</Text>
                </View>
              </View>
            </Card>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(340).duration(250)}>
          <Pressable onPress={() => router.push('/paywall')}>
            <LinearGradient
              colors={[colors.accent, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.proUpsellCard}
            >
              <View style={styles.proUpsellContent}>
                <Text style={styles.proUpsellBadge}>TENSOR PRO</Text>
                <Text style={styles.proUpsellTitle}>Unlock AI insights + advanced analytics</Text>
                <Text style={styles.proUpsellSubtitle}>Go deeper with recovery trends, ROM tracking, and smart recommendations.</Text>
              </View>
              <View style={styles.proUpsellButton}>
                <Text style={styles.proUpsellButtonText}>Upgrade</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Text style={styles.sectionTitle}>Daily Signals</Text>

        {/* Workouts & Calories Row (real data) */}
        <View style={styles.row}>
          <Animated.View entering={FadeInUp.delay(100).duration(250)} style={{ flex: 1 }}>
            <Card style={styles.halfCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>💪</Text>
                <Text style={styles.cardTitle}>Workouts</Text>
              </View>
              <View style={[styles.caloriesCircle, { marginVertical: spacing.md }]}>
                <Text style={styles.caloriesValue}>
                  {dashStats ? dashStats.weekWorkouts + dashStats.weekStretchingSessions : '—'}
                </Text>
              </View>
              <Text style={styles.cardUnit}>This week</Text>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(150).duration(250)} style={{ flex: 1 }}>
            <Card style={styles.halfCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>⚡</Text>
                <Text style={styles.cardTitle}>Calories</Text>
              </View>
              <View style={[styles.caloriesCircle, { marginVertical: spacing.md }]}>
                <AnimatedCounter value={dashStats?.weekCalories || 0} style={styles.caloriesValue} />
              </View>
              <Text style={styles.cardUnit}>Kcal this week</Text>
            </Card>
          </Animated.View>
        </View>

        {/* Weight Card (real data from body metrics) */}
        <Animated.View entering={FadeInUp.delay(200).duration(250)}>
          <Pressable onPress={() => router.push('/body-metrics')}>
            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={styles.statIcon}>
                  <Text style={styles.iconEmoji}>⚖️</Text>
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.signalLabel}>Weight</Text>
                  <Text style={styles.statSubLabel}>
                    {latestMetric ? 'Latest check-in' : 'No data yet'}
                  </Text>
                </View>
              </View>
              <View style={styles.weightRow}>
                <View>
                  <Text style={styles.bigValue}>
                    {bodyMetricsSummary.weight || '—'}
                  </Text>
                  <Text style={styles.valueUnit}>lb</Text>
                </View>
                {bodyMetricsSummary.changePercent !== 0 && (
                  <View style={styles.trendPill}>
                    <Text style={styles.trendText}>
                      {bodyMetricsSummary.changePercent > 0 ? '+' : ''}{bodyMetricsSummary.changePercent}%
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          </Pressable>
        </Animated.View>

        {/* HealthConnect cards — placeholder until integration */}
        <View style={styles.row}>
          <Animated.View entering={FadeInUp.delay(250).duration(250)} style={{ flex: 1 }}>
            <Card style={styles.halfCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🏃</Text>
                <Text style={styles.cardTitle}>Steps</Text>
              </View>
              <View style={[styles.caloriesCircle, { marginVertical: spacing.md }]}>
                <Text style={styles.caloriesValue}>—</Text>
              </View>
              <View style={styles.healthConnectBadge}>
                <Text style={styles.healthConnectText}>Connect Health</Text>
              </View>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(250)} style={{ flex: 1 }}>
            <Card style={styles.halfCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>❤️</Text>
                <Text style={styles.cardTitle}>Heart Rate</Text>
              </View>
              <View style={[styles.caloriesCircle, { marginVertical: spacing.md }]}>
                <Text style={styles.caloriesValue}>—</Text>
              </View>
              <View style={styles.healthConnectBadge}>
                <Text style={styles.healthConnectText}>Connect Health</Text>
              </View>
            </Card>
          </Animated.View>
        </View>

        <View style={styles.row}>
          <Animated.View entering={FadeInUp.delay(350).duration(250)} style={{ flex: 1 }}>
            <Card style={styles.halfCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>💧</Text>
                <Text style={styles.cardTitle}>Water</Text>
              </View>
              <View style={[styles.caloriesCircle, { marginVertical: spacing.md }]}>
                <Text style={styles.caloriesValue}>—</Text>
              </View>
              <View style={styles.healthConnectBadge}>
                <Text style={styles.healthConnectText}>Connect Health</Text>
              </View>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(250)} style={{ flex: 1 }}>
            <Card style={styles.halfCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>😴</Text>
                <Text style={styles.cardTitle}>Sleep</Text>
              </View>
              <View style={[styles.caloriesCircle, { marginVertical: spacing.md }]}>
                <Text style={styles.caloriesValue}>—</Text>
              </View>
              <View style={styles.healthConnectBadge}>
                <Text style={styles.healthConnectText}>Connect Health</Text>
              </View>
            </Card>
          </Animated.View>
        </View>

        {/* Insights */}
        <Card style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightTitle}>Insights</Text>
            <View style={styles.insightPill}>
              <Text style={styles.insightPillText}>This week</Text>
            </View>
          </View>
          {insights.map((text, i) => (
            <View key={i} style={styles.insightRow}>
              {i === 0 ? (
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.insightDot}
                />
              ) : (
                <View style={[styles.insightDot, i % 2 === 1 ? styles.insightDotAlt : styles.insightDotAlt2]} />
              )}
              <Text style={styles.insightText}>{text}</Text>
            </View>
          ))}
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
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
  rangeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  rangeChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  rangeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rangeText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  rangeTextActive: {
    color: colors.textInverse,
  },
  sectionTitle: {
    ...typography.caption1,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  goalSummaryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  goalSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalSummaryTitle: {
    ...typography.headline,
    color: colors.text,
  },
  goalSummaryName: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  goalSummaryRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
  },
  goalSummaryRingInner: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalSummaryRingValue: {
    ...typography.headline,
    color: colors.text,
  },
  goalSummaryRingLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  goalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalSummaryLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  goalSummaryValue: {
    ...typography.headline,
    color: colors.text,
    marginTop: spacing.xs,
  },
  goalSummaryTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.borderLight,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  goalSummaryFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  goalSummaryHint: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  strengthSummaryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.headline,
    color: colors.text,
  },
  cardSubtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  changePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.success + '18',
    borderWidth: 1,
    borderColor: colors.success + '44',
  },
  changePillAlt: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.primary + '18',
    borderWidth: 1,
    borderColor: colors.primary + '44',
  },
  changeText: {
    ...typography.caption2,
    color: colors.text,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statBlock: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.title3,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cardHint: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  heatmapCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  heatmapTitle: {
    marginBottom: spacing.sm,
  },
  flexibilityCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  streakPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.accent + '18',
    borderWidth: 1,
    borderColor: colors.accent + '44',
  },
  streakText: {
    ...typography.caption2,
    color: colors.accent,
  },
  consistencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  consistencyBlock: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  consistencyValue: {
    ...typography.headline,
    color: colors.text,
  },
  consistencyLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  recoverySummaryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  recoveryRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
  },
  recoveryRingInner: {
    flex: 1,
    borderRadius: 34,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryRingValue: {
    ...typography.headline,
    color: colors.text,
  },
  recoveryRingLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  recoveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  recoveryItem: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  recoveryValue: {
    ...typography.headline,
    color: colors.text,
  },
  recoveryLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bodyMetricsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  bodyMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bodyMetricsValue: {
    ...typography.title2,
    color: colors.text,
  },
  bodyMetricsLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bodyMetricsHint: {
    justifyContent: 'center',
  },
  bodyMetricsHintText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  proUpsellCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  proUpsellContent: {
    marginBottom: spacing.md,
  },
  proUpsellBadge: {
    ...typography.caption2,
    color: colors.textInverse,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  proUpsellTitle: {
    ...typography.title3,
    color: colors.textInverse,
  },
  proUpsellSubtitle: {
    ...typography.subhead,
    color: colors.textInverse,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  proUpsellButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  proUpsellButtonText: {
    ...typography.caption1,
    color: colors.accentDark,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 18,
    color: colors.text,
  },
  statCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '14',
    borderWidth: 1,
    borderColor: colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconEmoji: {
    fontSize: 20,
  },
  statInfo: {
    flex: 1,
  },
  signalLabel: {
    ...typography.headline,
    color: colors.text,
  },
  statSubLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.md,
  },
  bigValue: {
    ...typography.largeTitle,
    color: colors.text,
  },
  trendPill: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.success + '14',
    borderWidth: 1,
    borderColor: colors.success + '33',
  },
  trendText: {
    ...typography.caption2,
    color: colors.success,
  },
  valueUnit: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  dayLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
    width: 12,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  halfCard: {
    flex: 1,
    padding: spacing.lg,
  },
  halfCardSpacer: {
    flex: 1,
  },
  healthConnectBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.textTertiary + '18',
    borderWidth: 1,
    borderColor: colors.textTertiary + '33',
    alignSelf: 'center',
  },
  healthConnectText: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  cardValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardValue: {
    ...typography.title1,
    color: colors.text,
  },
  cardUnit: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  caloriesCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesValue: {
    ...typography.title2,
    color: colors.chartOrange,
  },
  waterCircle: {
    marginVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    width: 60,
    height: 60,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  waterValue: {
    ...typography.title1,
    color: colors.chartBlue,
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.lg,
  },
  bottomSpacer: {
    height: 100,
  },
  insightCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  insightTitle: {
    ...typography.headline,
    color: colors.text,
  },
  insightPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.accent + '12',
    borderWidth: 1,
    borderColor: colors.accent + '33',
  },
  insightPillText: {
    ...typography.caption2,
    color: colors.accent,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  insightDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  insightDotAlt: {
    backgroundColor: colors.primary,
  },
  insightDotAlt2: {
    backgroundColor: colors.accent,
  },
  insightText: {
    ...typography.subhead,
    color: colors.textSecondary,
    flex: 1,
  },
});
