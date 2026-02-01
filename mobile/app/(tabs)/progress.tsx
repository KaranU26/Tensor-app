import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  StatusBar,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { API_URL } from '@/config/api';
import { colors, typography, spacing, borderRadius, shadows } from '@/config/theme';
import { Card } from '@/components/ui';
import { MiniBarChart, MiniLineChart, SleepBar } from '@/components/ui/MiniCharts';

export default function ProgressScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated, accessToken } = useAuthStore();
  
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

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <ScrollView 
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
          entering={FadeInUp.delay(50).springify()}
          style={styles.header}
        >
          <Text style={styles.title}>Statistic</Text>
          <View style={styles.menuButton}>
            <Text style={styles.menuIcon}>•••</Text>
          </View>
        </Animated.View>

        {/* Steps Card */}
        <Animated.View entering={FadeInUp.delay(100).springify()}>
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
              <Text style={styles.bigValue}>{stats.steps.total.toLocaleString()}</Text>
              <Text style={styles.valueUnit}>Steps</Text>
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
          <Animated.View entering={FadeInUp.delay(150).springify()} style={{ flex: 1 }}>
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
                <Text style={styles.cardValue}>{stats.heartRate.current}</Text>
                <Text style={styles.cardUnit}>Bpm</Text>
              </View>
            </Card>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(200).springify()} style={{ flex: 1 }}>
            <Card style={styles.halfCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>⚡</Text>
                <Text style={styles.cardTitle}>Calories</Text>
              </View>
              <View style={[styles.caloriesCircle, { marginVertical: spacing.md }]}>
                <Text style={styles.caloriesValue}>{stats.calories}</Text>
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
          
          <View style={styles.halfCard} />
        </View>

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
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    ...shadows.md,
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
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesValue: {
    ...typography.title2,
    color: colors.chartOrange,
  },
  waterCircle: {
    marginVertical: spacing.md,
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
});
