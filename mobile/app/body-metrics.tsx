import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, StatusBar, ActivityIndicator } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, typography, spacing, borderRadius, gradients, shadows } from '@/config/theme';
import { Card, Button } from '@/components/ui';
import { MiniLineChart } from '@/components/ui/MiniCharts';
import LogMetricModal from '@/components/LogMetricModal';
import { useAuthStore } from '@/store/authStore';
import {
  getBodyMetrics,
  getLatestBodyMetric,
  createBodyMetric,
  type BodyMetric,
} from '@/lib/api/body-metrics';
import { Skeleton } from '@/components/AnimatedComponents';

const quickLogOptions = [
  { id: 'weight' as const, title: 'Log Weight', subtitle: 'Update today\u2019s weigh\u2011in' },
  { id: 'bodyFat' as const, title: 'Log Body Fat', subtitle: 'Track composition trend' },
  { id: 'measurements' as const, title: 'Add Measurements', subtitle: 'Chest, waist, hips' },
];

export default function BodyMetricsScreen() {
  const { isAuthenticated } = useAuthStore();
  const [latest, setLatest] = useState<BodyMetric | null>(null);
  const [history, setHistory] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<'weight' | 'bodyFat' | 'measurements' | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated) loadData();
    else setLoading(false);
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [latestRes, historyRes] = await Promise.all([
        getLatestBodyMetric(),
        getBodyMetrics({ limit: 6 }),
      ]);
      setLatest(latestRes.bodyMetric);
      setHistory(historyRes.bodyMetrics);
    } catch (error) {
      console.error('Failed to load body metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLog = async (data: Record<string, number | string>) => {
    setSaving(true);
    try {
      await createBodyMetric(data as any);
      setModalType(null);
      await loadData();
    } catch (error) {
      console.error('Failed to save metric:', error);
    } finally {
      setSaving(false);
    }
  };

  // Compute chart data from history (oldest first)
  const weightData = [...history].reverse().map((m) => m.weight || 0).filter(Boolean);
  const bodyFatData = [...history].reverse().map((m) => m.bodyFatPercentage || 0).filter(Boolean);

  // Compute changes
  const weightChange = weightData.length >= 2 ? Math.round((weightData[weightData.length - 1] - weightData[0]) * 10) / 10 : 0;
  const bodyFatChange = bodyFatData.length >= 2 ? Math.round((bodyFatData[bodyFatData.length - 1] - bodyFatData[0]) * 10) / 10 : 0;

  const lastUpdated = latest ? new Date(latest.measurementDate) : null;
  const daysAgo = lastUpdated ? Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(50).duration(250)} style={styles.header}>
          <View>
            <Text style={styles.title}>Body Metrics</Text>
            <Text style={styles.subtitle}>Track weight, body fat, and measurements</Text>
          </View>
          <Button title="Log Update" size="sm" onPress={() => setModalType('weight')} />
        </Animated.View>

        {loading ? (
          <View style={{ gap: spacing.lg }}>
            {[0, 1].map((i) => (
              <View key={i} style={{ backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.borderLight }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
                  <View>
                    <Skeleton width={80} height={20} borderRadius={6} />
                    <Skeleton width={100} height={14} borderRadius={4} style={{ marginTop: spacing.xs }} />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <View>
                    <Skeleton width={60} height={36} borderRadius={8} />
                    <Skeleton width={30} height={14} borderRadius={4} style={{ marginTop: spacing.xs }} />
                  </View>
                  <Skeleton width={140} height={50} borderRadius={8} />
                </View>
              </View>
            ))}
          </View>
        ) : !isAuthenticated ? (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Sign in to track metrics</Text>
            <Text style={styles.summarySubtitle}>Log weight, body fat, and measurements.</Text>
          </Card>
        ) : (
          <>
            <Animated.View entering={FadeInUp.delay(100).duration(250)}>
              <Card style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <View>
                    <Text style={styles.summaryTitle}>Weight</Text>
                    <Text style={styles.summarySubtitle}>Last {weightData.length} entries</Text>
                  </View>
                  {weightChange !== 0 && (
                    <View style={styles.changePill}>
                      <Text style={styles.changeText}>{weightChange > 0 ? '+' : ''}{weightChange} lbs</Text>
                    </View>
                  )}
                </View>
                <View style={styles.summaryRow}>
                  <View>
                    <Text style={styles.summaryValue}>{latest?.weight ?? '—'}</Text>
                    <Text style={styles.summaryUnit}>{latest?.weightUnit || 'lbs'}</Text>
                  </View>
                  {weightData.length >= 2 && (
                    <MiniLineChart data={weightData} width={140} height={50} color={colors.primary} />
                  )}
                </View>
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(150).duration(250)}>
              <Card style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <View>
                    <Text style={styles.summaryTitle}>Body Fat</Text>
                    <Text style={styles.summarySubtitle}>Trend</Text>
                  </View>
                  {bodyFatChange !== 0 && (
                    <View style={[styles.changePill, styles.changePillAlt]}>
                      <Text style={styles.changeText}>{bodyFatChange > 0 ? '+' : ''}{bodyFatChange}%</Text>
                    </View>
                  )}
                </View>
                <View style={styles.summaryRow}>
                  <View>
                    <Text style={styles.summaryValue}>{latest?.bodyFatPercentage ?? '—'}</Text>
                    <Text style={styles.summaryUnit}>%</Text>
                  </View>
                  {bodyFatData.length >= 2 && (
                    <MiniLineChart data={bodyFatData} width={140} height={50} color={colors.accent} />
                  )}
                </View>
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).duration(250)}>
              <Card style={styles.quickLogCard}>
                <Text style={styles.quickLogTitle}>Quick Log</Text>
                <View style={styles.quickLogOptions}>
                  {quickLogOptions.map((option) => (
                    <Pressable key={option.id} style={styles.quickLogOption} onPress={() => setModalType(option.id)}>
                      <Text style={styles.quickLogOptionTitle}>{option.title}</Text>
                      <Text style={styles.quickLogOptionSubtitle}>{option.subtitle}</Text>
                    </Pressable>
                  ))}
                </View>
              </Card>
            </Animated.View>

            {latest && (latest.chest || latest.waist || latest.hips || latest.arms || latest.thighs) && (
              <Animated.View entering={FadeInUp.delay(250).duration(250)}>
                <Card style={styles.measurementsCard}>
                  <View style={styles.measurementsHeader}>
                    <Text style={styles.measurementsTitle}>Measurements</Text>
                    {daysAgo !== null && (
                      <LinearGradient colors={gradients.primary} style={styles.measurementsBadge}>
                        <Text style={styles.measurementsBadgeText}>
                          {daysAgo === 0 ? 'Today' : `${daysAgo} days ago`}
                        </Text>
                      </LinearGradient>
                    )}
                  </View>
                  <View style={styles.measurementsGrid}>
                    {[
                      { key: 'chest', value: latest.chest },
                      { key: 'waist', value: latest.waist },
                      { key: 'hips', value: latest.hips },
                      { key: 'arms', value: latest.arms },
                      { key: 'thighs', value: latest.thighs },
                    ]
                      .filter((m) => m.value)
                      .map((m) => (
                        <View key={m.key} style={styles.measurementItem}>
                          <Text style={styles.measurementLabel}>{m.key}</Text>
                          <Text style={styles.measurementValue}>{m.value} {latest.measurementUnit}</Text>
                        </View>
                      ))}
                  </View>
                </Card>
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>

      {modalType && (
        <LogMetricModal
          visible={true}
          type={modalType}
          onClose={() => setModalType(null)}
          onSubmit={handleLog}
          loading={saving}
        />
      )}
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
  summaryCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  summaryTitle: {
    ...typography.title3,
    color: colors.text,
  },
  summarySubtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  changePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success + '18',
    borderWidth: 1,
    borderColor: colors.success + '44',
    alignSelf: 'flex-start',
  },
  changePillAlt: {
    backgroundColor: colors.primary + '18',
    borderColor: colors.primary + '44',
  },
  changeText: {
    ...typography.caption1,
    color: colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  summaryValue: {
    ...typography.largeTitle,
    color: colors.text,
  },
  summaryUnit: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  quickLogCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  quickLogTitle: {
    ...typography.title3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  quickLogOptions: {
    gap: spacing.sm,
  },
  quickLogOption: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  quickLogOptionTitle: {
    ...typography.headline,
    color: colors.text,
  },
  quickLogOptionSubtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  measurementsCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  measurementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  measurementsTitle: {
    ...typography.title3,
    color: colors.text,
  },
  measurementsBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  measurementsBadgeText: {
    ...typography.caption2,
    color: colors.textInverse,
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  measurementItem: {
    flexBasis: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  measurementLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  measurementValue: {
    ...typography.headline,
    color: colors.text,
    marginTop: spacing.xs,
  },
});
