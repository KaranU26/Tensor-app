import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { colors, typography, spacing, borderRadius, gradients, shadows } from '@/config/theme';
import { PremiumButton } from '@/components/PremiumButton';
import { Card } from '@/components/ui';

type PlanId = 'monthly' | 'yearly' | 'lifetime';

const plans = [
  {
    id: 'monthly' as PlanId,
    title: 'Monthly',
    price: '$3.99',
    suffix: '/mo',
    subline: 'Cancel anytime',
  },
  {
    id: 'yearly' as PlanId,
    title: 'Yearly',
    price: '$23.99',
    suffix: '/yr',
    subline: 'Save 50%',
    badge: 'Best value',
  },
  {
    id: 'lifetime' as PlanId,
    title: 'Lifetime',
    price: '$74.99',
    suffix: '',
    subline: 'One‑time payment',
    badge: 'Limited',
  },
];

const featureList = [
  'Unlimited stretching routines',
  'Advanced analytics & trends',
  'Flexibility goal tracking (ROM)',
  'Recovery insights + readiness',
  'AI routine recommendations',
  'Priority support',
];

export default function PaywallScreen() {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('yearly');

  const selectedCopy = useMemo(() => {
    const plan = plans.find((item) => item.id === selectedPlan);
    return plan ? `${plan.price}${plan.suffix}` : '';
  }, [selectedPlan]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>

        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroInner}>
            <Text style={styles.heroBadge}>TENSOR PRO</Text>
            <Text style={styles.heroTitle}>Stretch further. Train smarter.</Text>
            <Text style={styles.heroSubtitle}>
              Unlock advanced analytics, ROM tracking, and unlimited routines tailored to your goals.
            </Text>
          </View>
        </LinearGradient>

        <Card style={styles.featuresCard}>
          <Text style={styles.sectionTitle}>Everything in Pro</Text>
          <View style={styles.featureList}>
            {featureList.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Choose your plan</Text>
        <View style={styles.planList}>
          {plans.map((plan) => {
            const active = plan.id === selectedPlan;
            return (
              <Pressable
                key={plan.id}
                onPress={() => setSelectedPlan(plan.id)}
                style={[styles.planCard, active && styles.planCardActive]}
              >
                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <Text style={styles.planSubline}>{plan.subline}</Text>
                  </View>
                  <View style={styles.planPriceBlock}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    {plan.suffix ? <Text style={styles.planSuffix}>{plan.suffix}</Text> : null}
                  </View>
                </View>
                {plan.badge && (
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{plan.badge}</Text>
                  </View>
                )}
                <View style={[styles.planCheck, active && styles.planCheckActive]}>
                  <Text style={[styles.planCheckText, active && styles.planCheckTextActive]}>
                    {active ? 'Selected' : 'Select'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <PremiumButton
          title={`Unlock Pro • ${selectedCopy}`}
          onPress={() => {}}
          fullWidth
          style={styles.cta}
        />
        <PremiumButton
          title="Restore Purchase"
          variant="ghost"
          onPress={() => {}}
          fullWidth
          style={styles.restore}
        />

        <Text style={styles.disclaimer}>
          Subscription auto‑renews unless canceled at least 24 hours before renewal. You can manage your
          plan in Settings.
        </Text>
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
  closeButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  closeText: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  heroInner: {
    gap: spacing.sm,
  },
  heroBadge: {
    ...typography.caption1,
    color: colors.textInverse,
    letterSpacing: 1.2,
  },
  heroTitle: {
    ...typography.title1,
    color: colors.textInverse,
  },
  heroSubtitle: {
    ...typography.subhead,
    color: colors.textInverse,
    opacity: 0.9,
  },
  featuresCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.md,
  },
  featureList: {
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  featureText: {
    ...typography.subhead,
    color: colors.textSecondary,
    flex: 1,
  },
  planList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  planCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  planCardActive: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    ...typography.title3,
    color: colors.text,
  },
  planSubline: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  planPriceBlock: {
    alignItems: 'flex-end',
  },
  planPrice: {
    ...typography.title2,
    color: colors.text,
  },
  planSuffix: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  planBadge: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '18',
    borderWidth: 1,
    borderColor: colors.primary + '44',
  },
  planBadgeText: {
    ...typography.caption2,
    color: colors.primary,
  },
  planCheck: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  planCheckActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  planCheckText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  planCheckTextActive: {
    color: colors.textInverse,
  },
  cta: {
    marginTop: spacing.md,
  },
  restore: {
    marginTop: spacing.sm,
  },
  disclaimer: {
    ...typography.caption2,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
