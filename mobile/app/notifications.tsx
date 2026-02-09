import React, { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Switch, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { colors, typography, spacing, borderRadius, gradients, shadows } from '@/config/theme';
import { Card } from '@/components/ui';
import { useSettingsStore } from '@/store/settingsStore';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '@/store/authStore';

const reminderDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeOptions = [
  { id: '07:30', label: '7:30 AM' },
  { id: '12:00', label: '12:00 PM' },
  { id: '17:00', label: '5:00 PM' },
  { id: '18:30', label: '6:30 PM' },
  { id: '21:00', label: '9:00 PM' },
];
const maxPerDayOptions = [1, 2, 3, 4];

export default function NotificationsScreen() {
  const { isAuthenticated } = useAuthStore();
  const notifications = useSettingsStore((state) => state.notifications);
  const updateNotifications = useSettingsStore((state) => state.updateNotifications);
  const toggleReminderDay = useSettingsStore((state) => state.toggleReminderDay);
  const fetchNotificationSettings = useSettingsStore((state) => state.fetchNotificationSettings);
  const syncNotificationSettings = useSettingsStore((state) => state.syncNotificationSettings);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isAuthenticated) fetchNotificationSettings();
  }, [isAuthenticated]);

  // Debounced sync after any change
  const scheduleSync = useCallback(() => {
    if (!isAuthenticated) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      syncNotificationSettings();
    }, 500);
  }, [isAuthenticated]);

  const handleUpdateNotifications = (updates: Parameters<typeof updateNotifications>[0]) => {
    updateNotifications(updates);
    scheduleSync();
  };

  const toggleDay = (day: string) => {
    toggleReminderDay(day);
    scheduleSync();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInUp.delay(50).duration(250)}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Notifications</Text>
              <Text style={styles.subtitle}>Control reminders and nudges</Text>
            </View>
            <Pressable onPress={() => router.back()} style={styles.closeButton}>
              <Text style={styles.closeText}>Done</Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(250)}>
          <Card style={styles.card}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Enable notifications</Text>
                <Text style={styles.toggleSubtitle}>Master switch for all alerts</Text>
              </View>
              <Switch
                value={notifications.notificationsEnabled}
                onValueChange={(value) => handleUpdateNotifications({ notificationsEnabled: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(250)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Reminder timing</Text>
            <Text style={styles.cardSubtitle}>Pick when to be notified</Text>

            <Text style={styles.label}>Workout reminder</Text>
            <View style={styles.row}>
              {timeOptions.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleUpdateNotifications({ workoutReminderTime: item.id })}
                  style={[styles.chip, notifications.workoutReminderTime === item.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, notifications.workoutReminderTime === item.id && styles.chipTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: spacing.md }]}>Stretch reminder</Text>
            <View style={styles.row}>
              {timeOptions.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleUpdateNotifications({ stretchReminderTime: item.id })}
                  style={[styles.chip, notifications.stretchReminderTime === item.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, notifications.stretchReminderTime === item.id && styles.chipTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(250)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Reminder days</Text>
            <Text style={styles.cardSubtitle}>Choose training days</Text>
            <View style={styles.row}>
              {reminderDays.map((day) => (
                <Pressable
                  key={day}
                  onPress={() => toggleDay(day)}
                  style={[styles.chip, notifications.reminderDays.includes(day) && styles.chipActive]}
                >
                  <Text style={[styles.chipText, notifications.reminderDays.includes(day) && styles.chipTextActive]}>
                    {day}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(250)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Notification types</Text>
            <Text style={styles.cardSubtitle}>Control specific alerts</Text>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Stretch reminders</Text>
                <Text style={styles.toggleSubtitle}>Daily mobility prompts</Text>
              </View>
              <Switch
                value={notifications.stretchReminders}
                onValueChange={(value) => handleUpdateNotifications({ stretchReminders: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Workout reminders</Text>
                <Text style={styles.toggleSubtitle}>Scheduled workout days</Text>
              </View>
              <Switch
                value={notifications.workoutReminders}
                onValueChange={(value) => handleUpdateNotifications({ workoutReminders: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Streak alerts</Text>
                <Text style={styles.toggleSubtitle}>At‑risk and milestones</Text>
              </View>
              <Switch
                value={notifications.streakNotifications}
                onValueChange={(value) => handleUpdateNotifications({ streakNotifications: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Goal progress</Text>
                <Text style={styles.toggleSubtitle}>ROM check‑ins & milestones</Text>
              </View>
              <Switch
                value={notifications.goalNotifications}
                onValueChange={(value) => handleUpdateNotifications({ goalNotifications: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Recovery suggestions</Text>
                <Text style={styles.toggleSubtitle}>Post‑workout prompts</Text>
              </View>
              <Switch
                value={notifications.recoverySuggestions}
                onValueChange={(value) => handleUpdateNotifications({ recoverySuggestions: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Social activity</Text>
                <Text style={styles.toggleSubtitle}>Friend PRs and comments</Text>
              </View>
              <Switch
                value={notifications.socialNotifications}
                onValueChange={(value) => handleUpdateNotifications({ socialNotifications: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Inactivity nudges</Text>
                <Text style={styles.toggleSubtitle}>Gentle check‑ins when inactive</Text>
              </View>
              <Switch
                value={notifications.inactivityNudges}
                onValueChange={(value) => handleUpdateNotifications({ inactivityNudges: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(250)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Quiet hours</Text>
            <Text style={styles.cardSubtitle}>Disable notifications overnight</Text>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Quiet hours</Text>
                <Text style={styles.toggleSubtitle}>No alerts during rest</Text>
              </View>
              <Switch
                value={notifications.quietHoursEnabled}
                onValueChange={(value) => handleUpdateNotifications({ quietHoursEnabled: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.row}>
              {timeOptions.slice(0, 4).map((item) => (
                <Pressable
                  key={`start-${item.id}`}
                  onPress={() => handleUpdateNotifications({ quietHoursStart: item.id })}
                  style={[styles.chip, notifications.quietHoursStart === item.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, notifications.quietHoursStart === item.id && styles.chipTextActive]}>
                    Start {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.row, { marginTop: spacing.sm }]}>
              {timeOptions.slice(0, 4).map((item) => (
                <Pressable
                  key={`end-${item.id}`}
                  onPress={() => handleUpdateNotifications({ quietHoursEnd: item.id })}
                  style={[styles.chip, notifications.quietHoursEnd === item.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, notifications.quietHoursEnd === item.id && styles.chipTextActive]}>
                    End {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).duration(250)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Limits</Text>
            <Text style={styles.cardSubtitle}>Avoid too many alerts</Text>
            <View style={styles.row}>
              {maxPerDayOptions.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => handleUpdateNotifications({ maxDailyNotifications: item })}
                  style={[styles.chip, notifications.maxDailyNotifications === item && styles.chipActive]}
                >
                  <Text style={[styles.chipText, notifications.maxDailyNotifications === item && styles.chipTextActive]}>
                    {item} / day
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700).duration(250)}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tipCard}
          >
            <Text style={styles.tipTitle}>Smart timing</Text>
            <Text style={styles.tipText}>
              Enable notifications to receive reminders based on when you normally train.
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
