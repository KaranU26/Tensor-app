import React, { useMemo, useState } from 'react';
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
import { MiniBarChart, MiniLineChart, SleepBar } from '@/components/ui/MiniCharts';
import { LinearGradient } from 'expo-linear-gradient';
import MuscleHeatmap from '@/components/MuscleHeatmap';
import { ComparisonChart, MuscleDistributionChart, ProgressLineChart } from '@/components/charts';
import { useGoalsStore } from '@/store/goalsStore';

export default function ProgressScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('7D');
  const ranges: Array<'7D' | '30D' | '90D'> = ['7D', '30D', '90D'];
  const userGoals = useGoalsStore((state) => state.goals);
  
  // Mock data for statistics
  const stats = {
    steps: {
      total: 10728,
      weekData: [8500, 12000, 9500, 7800, 11200, 10728, 0],
    },
    heartRate: {
      current: 120,
      data: [72, 85, 78, 95, 110, 120, 115, 108, 120],
    },
    calories: 148,
    water: 1.8,
    weight: {
      current: 172.5,
      data: [175, 174.5, 174, 173.2, 173, 172.8, 172.5],
    },
    sleep: {
      bedtime: '10:00 pm',
      wakeup: '05:30 am',
      hours: 7.5,
    },
  };
  const goalSummary = {
    name: 'Front Splits',
    progress: 45,
    baseline: 60,
    current: 75,
    target: 180,
    nextCheckIn: '3 days',
  };
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
    : goalSummary;
  const strengthAnalytics = {
    totalVolume: 487500,
    changePercent: 12,
    sessions: 5,
    avgSession: 97500,
    distribution: [
      { muscle: 'Legs', sets: 30, color: colors.primary },
      { muscle: 'Back', sets: 22, color: colors.accent },
      { muscle: 'Chest', sets: 18, color: colors.chartOrange },
      { muscle: 'Shoulders', sets: 15, color: colors.chartPurple },
      { muscle: 'Arms', sets: 12, color: colors.chartBlue },
      { muscle: 'Core', sets: 6, color: colors.chartGreen },
    ],
    weeklyLoad: {
      current: [
        { x: 'Mon', y: 72 },
        { x: 'Tue', y: 48 },
        { x: 'Wed', y: 0 },
        { x: 'Thu', y: 64 },
        { x: 'Fri', y: 58 },
        { x: 'Sat', y: 0 },
        { x: 'Sun', y: 42 },
      ],
      previous: [
        { x: 'Mon', y: 60 },
        { x: 'Tue', y: 36 },
        { x: 'Wed', y: 30 },
        { x: 'Thu', y: 54 },
        { x: 'Fri', y: 40 },
        { x: 'Sat', y: 22 },
        { x: 'Sun', y: 35 },
      ],
    },
  };
  const stretchFocusCounts = useMemo(() => {
    if (userGoals.length === 0) {
      return {
        hamstrings: 14,
        hips: 12,
        glutes: 10,
        quads: 8,
        calves: 6,
        shoulders: 6,
        upper_back: 5,
      };
    }
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
    return Object.keys(counts).length > 0 ? counts : {
      hamstrings: 14,
      hips: 12,
      glutes: 10,
      quads: 8,
      calves: 6,
      shoulders: 6,
      upper_back: 5,
    };
  }, [userGoals]);
  const flexibilityAnalytics = {
    romTrend: activeGoal
      ? activeGoal.history.map((value, index) => ({
          x: `W${index + 1}`,
          y: value,
        }))
      : [
          { x: 'Jan', y: 60 },
          { x: 'Feb', y: 64 },
          { x: 'Mar', y: 70 },
          { x: 'Apr', y: 75 },
          { x: 'May', y: 78 },
          { x: 'Jun', y: 82 },
        ],
    stretchFocus: stretchFocusCounts,
    consistency: {
      targetPerWeek: 4,
      completedThisWeek: activeGoal ? getWeeklyCheckIns(activeGoal) : 3,
      streakDays: activeGoal ? getStreakDays(activeGoal) : 12,
      lastCheckIn: activeGoal ? formatCheckInLabel(activeGoal.lastCheckInAt) : '8 days ago',
    },
  };
  const recoveryAnalytics = {
    readinessAvg: 72,
    sleepAvg: 7.4,
    sorenessLevel: 'Moderate',
    focus: 'Lower body recovery',
  };
  const bodyMetricsSummary = {
    weight: 172.5,
    bodyFat: 18,
    changePercent: -2.6,
  };
  const rangeLabel = range === '7D' ? 'Last 7 days' : range === '30D' ? 'Last 30 days' : 'Last 90 days';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
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
                <Text style={styles.cardSubtitle}>Last 30 days</Text>
              </View>
              <View style={styles.changePill}>
                <Text style={styles.changeText}>+{strengthAnalytics.changePercent}%</Text>
              </View>
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

        <Animated.View entering={FadeInUp.delay(170).duration(250)}>
          <ComparisonChart
            title="Training load vs last week"
            currentData={strengthAnalytics.weeklyLoad.current}
            previousData={strengthAnalytics.weeklyLoad.previous}
            labels={['This Week', 'Last Week']}
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
                <Text style={styles.recoveryValue}>{recoveryAnalytics.sleepAvg}h</Text>
                <Text style={styles.recoveryLabel}>Avg sleep</Text>
              </View>
              <View style={styles.recoveryItem}>
                <Text style={styles.recoveryValue}>{recoveryAnalytics.sorenessLevel}</Text>
                <Text style={styles.recoveryLabel}>Soreness</Text>
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
        {/* Steps Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(250)}>
          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={styles.statIcon}>
                <Text style={styles.iconEmoji}>🏃</Text>
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Steps</Text>
                <Text style={styles.statSubLabel}>Last 7 days</Text>
              </View>
              <MiniBarChart 
                data={stats.steps.weekData} 
                color={colors.primary}
              />
            </View>
            <View style={styles.statValueRow}>
              <AnimatedCounter value={stats.steps.total} style={styles.bigValue} />
              <Text style={styles.valueUnit}>Steps</Text>
              <View style={styles.trendPill}>
                <Text style={styles.trendText}>+8%</Text>
              </View>
            </View>
            <View style={styles.weekDays}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <Text key={i} style={styles.dayLabel}>{day}</Text>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Heart Rate & Calories Row */}
        <View style={styles.row}>
          <Animated.View entering={FadeInUp.delay(150).duration(250)} style={{ flex: 1 }}>
            <Card style={styles.halfCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>❤️</Text>
                <Text style={styles.cardTitle}>Heart Rate</Text>
              </View>
              <MiniLineChart 
                data={stats.heartRate.data}
                color={colors.primary}
                width={100}
                height={40}
              />
              <View style={styles.cardValueRow}>
                <AnimatedCounter value={stats.heartRate.current} style={styles.cardValue} />
                <Text style={styles.cardUnit}>Bpm</Text>
              </View>
            </Card>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(200).duration(250)} style={{ flex: 1 }}>
            <Card style={styles.halfCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>⚡</Text>
                <Text style={styles.cardTitle}>Calories</Text>
              </View>
              <View style={[styles.caloriesCircle, { marginVertical: spacing.md }]}>
                <AnimatedCounter value={stats.calories} style={styles.caloriesValue} />
              </View>
              <Text style={styles.cardUnit}>Kcal</Text>
            </Card>
          </Animated.View>
        </View>

        {/* Water Card */}
        <View style={styles.row}>
          <Card style={styles.halfCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>💧</Text>
              <Text style={styles.cardTitle}>Water</Text>
            </View>
            <View style={styles.waterCircle}>
              <Text style={styles.waterValue}>{stats.water}</Text>
            </View>
            <Text style={styles.cardUnit}>Liters</Text>
          </Card>
          
          <View style={styles.halfCardSpacer} />
        </View>

        {/* Insights */}
        <Card style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightTitle}>Insights</Text>
            <View style={styles.insightPill}>
              <Text style={styles.insightPillText}>This week</Text>
            </View>
          </View>
          <View style={styles.insightRow}>
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.insightDot}
            />
            <Text style={styles.insightText}>Consistency up 12% — keep your 4‑day streak.</Text>
          </View>
          <View style={styles.insightRow}>
            <View style={[styles.insightDot, styles.insightDotAlt]} />
            <Text style={styles.insightText}>Recovery score trending good after leg days.</Text>
          </View>
          <View style={styles.insightRow}>
            <View style={[styles.insightDot, styles.insightDotAlt2]} />
            <Text style={styles.insightText}>Try a 10‑min hip routine to boost mobility.</Text>
          </View>
        </Card>

        {/* Weight Card */}
        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={styles.statIcon}>
              <Text style={styles.iconEmoji}>⚖️</Text>
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Weight</Text>
              <Text style={styles.statSubLabel}>Feb 4 - Apr 8</Text>
            </View>
          </View>
          <View style={styles.weightRow}>
            <View>
              <Text style={styles.bigValue}>{stats.weight.current}</Text>
              <Text style={styles.valueUnit}>lb</Text>
            </View>
            <MiniLineChart 
              data={stats.weight.data}
              color={colors.primary}
              width={140}
              height={50}
            />
          </View>
        </Card>

        {/* Sleep Card */}
        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={styles.statIcon}>
              <Text style={styles.iconEmoji}>😴</Text>
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Sleep</Text>
              <Text style={styles.statSubLabel}>
                {stats.sleep.bedtime} - {stats.sleep.wakeup}
              </Text>
            </View>
            <SleepBar sleepHours={stats.sleep.hours} />
          </View>
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
  statLabel: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  cardTitle: {
    ...typography.headline,
    color: colors.text,
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
