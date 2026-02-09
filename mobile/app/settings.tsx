import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Switch, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import RevenueCatUI from 'react-native-purchases-ui';

import { colors, typography, spacing, borderRadius, gradients, shadows } from '@/config/theme';
import { Card } from '@/components/ui';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSettingsStore } from '@/store/settingsStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';

type UnitSystem = 'imperial' | 'metric';
type WeekStart = 'Sun' | 'Mon';

const workoutTimes = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
];

const restTimers = [60, 90, 120];

export default function SettingsScreen() {
  const preferences = useSettingsStore((state) => state.preferences);
  const updatePreferences = useSettingsStore((state) => state.updatePreferences);
  const { isPro, planType } = useSubscriptionStore();

  const handleManageSubscription = async () => {
    if (isPro) {
      // Show RevenueCat Customer Center for active subscribers
      try {
        await RevenueCatUI.presentCustomerCenter();
      } catch (e) {
        console.warn('Customer Center failed:', e);
        Alert.alert('Error', 'Could not open subscription management. Please try again.');
      }
    } else {
      // Show paywall for non-subscribers
      router.push('/paywall' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInUp.delay(50).duration(250)}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Settings</Text>
              <Text style={styles.subtitle}>Personalize your training experience</Text>
            </View>
            <Pressable onPress={() => router.back()} style={styles.closeButton}>
              <Text style={styles.closeText}>Done</Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(250)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Preferences</Text>
            <Text style={styles.cardSubtitle}>Units and scheduling</Text>

            <View style={styles.section}>
              <Text style={styles.label}>Units</Text>
              <View style={styles.row}>
                {(['imperial', 'metric'] as UnitSystem[]).map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => updatePreferences({ unitSystem: item })}
                    style={[styles.chip, preferences.unitSystem === item && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, preferences.unitSystem === item && styles.chipTextActive]}>
                      {item === 'imperial' ? 'Imperial (lb)' : 'Metric (kg)'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Week starts on</Text>
              <View style={styles.row}>
                {(['Mon', 'Sun'] as WeekStart[]).map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => updatePreferences({ weekStart: item })}
                    style={[styles.chip, preferences.weekStart === item && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, preferences.weekStart === item && styles.chipTextActive]}>
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Preferred workout time</Text>
              <View style={styles.row}>
                {workoutTimes.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => updatePreferences({ preferredWorkoutTime: item.id as 'morning' | 'afternoon' | 'evening' })}
                    style={[styles.chip, preferences.preferredWorkoutTime === item.id && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, preferences.preferredWorkoutTime === item.id && styles.chipTextActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(250)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Training</Text>
            <Text style={styles.cardSubtitle}>Rest timers and flow</Text>

            <View style={styles.section}>
              <Text style={styles.label}>Default rest timer</Text>
              <View style={styles.row}>
                {restTimers.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => updatePreferences({ restTimerSeconds: item })}
                    style={[styles.chip, preferences.restTimerSeconds === item && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, preferences.restTimerSeconds === item && styles.chipTextActive]}>
                      {item}s
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Auto‑start rest timer</Text>
                <Text style={styles.toggleSubtitle}>Start timer after each set</Text>
              </View>
              <Switch
                value={preferences.autoRestTimer}
                onValueChange={(value) => updatePreferences({ autoRestTimer: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Suggest post‑workout stretch</Text>
                <Text style={styles.toggleSubtitle}>Recovery routine after logging</Text>
              </View>
              <Switch
                value={preferences.autoStretchPrompt}
                onValueChange={(value) => updatePreferences({ autoStretchPrompt: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(250)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Experience</Text>
            <Text style={styles.cardSubtitle}>Haptics, audio, and theme</Text>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Haptic feedback</Text>
                <Text style={styles.toggleSubtitle}>Tactile cues during logging</Text>
              </View>
              <Switch
                value={preferences.hapticsEnabled}
                onValueChange={(value) => updatePreferences({ hapticsEnabled: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Sounds</Text>
                <Text style={styles.toggleSubtitle}>Timer beeps & session cues</Text>
              </View>
              <Switch
                value={preferences.soundsEnabled}
                onValueChange={(value) => updatePreferences({ soundsEnabled: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <Pressable style={styles.linkRow} onPress={() => {}}>
              <Text style={styles.linkText}>Theme settings</Text>
              <Text style={styles.linkArrow}>›</Text>
            </Pressable>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(250)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Notifications</Text>
            <Text style={styles.cardSubtitle}>Reminders and smart nudges</Text>
            <Pressable style={styles.linkRow} onPress={() => router.push('/notifications')}>
              <Text style={styles.linkText}>Manage notification preferences</Text>
              <Text style={styles.linkArrow}>›</Text>
            </Pressable>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(250)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Privacy & Data</Text>
            <Text style={styles.cardSubtitle}>Sync and offline settings</Text>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Offline mode</Text>
                <Text style={styles.toggleSubtitle}>Cache routines and history</Text>
              </View>
              <Switch
                value={preferences.offlineMode}
                onValueChange={(value) => updatePreferences({ offlineMode: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Sync over cellular</Text>
                <Text style={styles.toggleSubtitle}>Use mobile data to sync</Text>
              </View>
              <Switch
                value={preferences.syncOverCellular}
                onValueChange={(value) => updatePreferences({ syncOverCellular: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <Pressable style={styles.linkRow} onPress={handleManageSubscription}>
              <View>
                <Text style={styles.linkText}>Manage subscription</Text>
                <Text style={styles.toggleSubtitle}>
                  {isPro
                    ? `TensorFit Pro (${planType})`
                    : 'Free plan'}
                </Text>
              </View>
              <Text style={styles.linkArrow}>›</Text>
            </Pressable>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).duration(250)}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tipCard}
          >
            <Text style={styles.tipTitle}>Pro tip</Text>
            <Text style={styles.tipText}>
              Set a fixed workout time to get smarter reminders and better recovery guidance.
            </Text>
          </LinearGradient>
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
  closeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  closeText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.title3,
    color: colors.text,
  },
  cardSubtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  toggleTitle: {
    ...typography.headline,
    color: colors.text,
  },
  toggleSubtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  linkText: {
    ...typography.headline,
    color: colors.text,
  },
  linkArrow: {
    ...typography.title2,
    color: colors.textTertiary,
  },
  tipCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.glow,
  },
  tipTitle: {
    ...typography.caption1,
    color: colors.textInverse,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  tipText: {
    ...typography.subhead,
    color: colors.textInverse,
  },
});
