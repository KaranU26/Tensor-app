import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, StatusBar } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, typography, spacing, borderRadius, gradients, shadows } from '@/config/theme';
import { Card, Button } from '@/components/ui';
import { MiniLineChart } from '@/components/ui/MiniCharts';

const metrics = {
  weight: {
    current: 185,
    change: -5,
    percent: -2.6,
    data: [192, 190, 189, 188, 186, 185],
  },
  bodyFat: {
    current: 18,
    change: -1,
    data: [21, 20, 19.5, 19, 18.5, 18],
  },
  measurements: {
    chest: 38.5,
    waist: 32,
    hips: 38,
    arms: 14,
    thighs: 23,
  },
};

const quickLogOptions = [
  { id: 'weight', title: 'Log Weight', subtitle: 'Update today’s weigh‑in' },
  { id: 'bodyfat', title: 'Log Body Fat', subtitle: 'Track composition trend' },
  { id: 'measurements', title: 'Add Measurements', subtitle: 'Chest, waist, hips' },
];

export default function BodyMetricsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(50).duration(250)} style={styles.header}>
          <View>
            <Text style={styles.title}>Body Metrics</Text>
            <Text style={styles.subtitle}>Track weight, body fat, and measurements</Text>
          </View>
          <Button title="Log Update" size="sm" onPress={() => {}} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(250)}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.summaryTitle}>Weight</Text>
                <Text style={styles.summarySubtitle}>Last 6 weeks</Text>
              </View>
              <View style={styles.changePill}>
                <Text style={styles.changeText}>{metrics.weight.change} lbs</Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryValue}>{metrics.weight.current}</Text>
                <Text style={styles.summaryUnit}>lbs</Text>
              </View>
              <MiniLineChart data={metrics.weight.data} width={140} height={50} color={colors.primary} />
            </View>
            <Text style={styles.summaryHint}>{metrics.weight.percent}% this month</Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150).duration(250)}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.summaryTitle}>Body Fat</Text>
                <Text style={styles.summarySubtitle}>3‑month trend</Text>
              </View>
              <View style={[styles.changePill, styles.changePillAlt]}>
                <Text style={styles.changeText}>{metrics.bodyFat.change}%</Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryValue}>{metrics.bodyFat.current}</Text>
                <Text style={styles.summaryUnit}>%</Text>
              </View>
              <MiniLineChart data={metrics.bodyFat.data} width={140} height={50} color={colors.accent} />
            </View>
            <Text style={styles.summaryHint}>Leaning out while maintaining strength</Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(250)}>
          <Card style={styles.quickLogCard}>
            <Text style={styles.quickLogTitle}>Quick Log</Text>
            <View style={styles.quickLogOptions}>
              {quickLogOptions.map((option) => (
                <Pressable key={option.id} style={styles.quickLogOption}>
                  <Text style={styles.quickLogOptionTitle}>{option.title}</Text>
                  <Text style={styles.quickLogOptionSubtitle}>{option.subtitle}</Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(250).duration(250)}>
          <Card style={styles.measurementsCard}>
            <View style={styles.measurementsHeader}>
              <Text style={styles.measurementsTitle}>Measurements</Text>
              <LinearGradient colors={gradients.primary} style={styles.measurementsBadge}>
                <Text style={styles.measurementsBadgeText}>Updated 5 days ago</Text>
              </LinearGradient>
            </View>
            <View style={styles.measurementsGrid}>
              {Object.entries(metrics.measurements).map(([key, value]) => (
                <View key={key} style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>{key}</Text>
                  <Text style={styles.measurementValue}>{value} in</Text>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(250)}>
          <Card style={styles.insightCard}>
            <Text style={styles.insightTitle}>Body Composition Insight</Text>
            <Text style={styles.insightText}>
              Weight is down 2.6% while strength volume is holding steady — great lean‑mass retention.
            </Text>
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
  summaryHint: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.sm,
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
  insightCard: {
    padding: spacing.lg,
  },
  insightTitle: {
    ...typography.title3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  insightText: {
    ...typography.subhead,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
