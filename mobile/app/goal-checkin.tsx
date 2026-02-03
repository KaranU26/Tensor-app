import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { colors, typography, spacing, borderRadius, gradients, shadows } from '@/config/theme';
import { Card, Button } from '@/components/ui';
import { PremiumButton } from '@/components/PremiumButton';
import { useGoalsStore } from '@/store/goalsStore';
import { EmptyState } from '@/components/EmptyState';
import { LinearGradient } from 'expo-linear-gradient';

const AREA_LABELS: Record<string, string> = {
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  quads: 'Quads',
  calves: 'Calves',
  lower_back: 'Lower back',
  upper_back: 'Upper back',
  shoulders: 'Shoulders',
  chest: 'Chest',
  hips: 'Hips',
};

export default function GoalCheckInScreen() {
  const { goalId } = useLocalSearchParams<{ goalId?: string }>();
  const goals = useGoalsStore((state) => state.goals);
  const updateGoal = useGoalsStore((state) => state.updateGoal);
  const completeGoal = useGoalsStore((state) => state.completeGoal);

  const activeGoals = useMemo(() => goals.filter((goal) => goal.status === 'active'), [goals]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [romValue, setRomValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  useEffect(() => {
    if (goalId && activeGoals.find((goal) => goal.id === goalId)) {
      setSelectedId(goalId);
      return;
    }
    if (!selectedId && activeGoals.length > 0) {
      setSelectedId(activeGoals[0].id);
    }
  }, [goalId, activeGoals]);

  const selectedGoal = activeGoals.find((goal) => goal.id === selectedId) || null;

  useEffect(() => {
    if (selectedGoal) {
      setSelectedAreas(selectedGoal.focusAreas || []);
    }
  }, [selectedGoal?.id]);

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area]
    );
  };

  const handleSave = () => {
    if (!selectedGoal) return;
    const newRom = Number(romValue);
    if (!Number.isFinite(newRom) || newRom <= 0) {
      setError('Enter a valid ROM value.');
      return;
    }
    if (newRom <= selectedGoal.baselineRom) {
      setError('ROM should be higher than your baseline.');
      return;
    }

    const now = new Date();
    const todayLabel = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const lastCheck = selectedGoal.lastCheckInAt ? new Date(selectedGoal.lastCheckInAt) : null;
    const daysSinceLast = lastCheck ? (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24) : null;
    const nextStreak = daysSinceLast !== null && daysSinceLast <= 1.5
      ? selectedGoal.streakDays + 1
      : 1;
    const history = [...selectedGoal.history, newRom];
    const areas = selectedAreas.length > 0 ? selectedAreas : (selectedGoal.focusAreas || []);
    const checkIns = [...(selectedGoal.checkIns || []), { date: now.toISOString(), rom: newRom, areas }];
    updateGoal(selectedGoal.id, {
      currentRom: newRom,
      history,
      checkIns,
      lastCheckIn: todayLabel,
      lastCheckInAt: now.toISOString(),
      sessionsCompleted: selectedGoal.sessionsCompleted + 1,
      streakDays: nextStreak,
    });

    if (newRom >= selectedGoal.targetRom) {
      completeGoal(selectedGoal.id);
      Alert.alert('Goal achieved', 'You hit your target ROM! 🎉', [
        { text: 'View goals', onPress: () => router.replace('/goals') },
      ]);
      return;
    }

    router.replace('/goals');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Goal Check‑In</Text>
            <Text style={styles.subtitle}>Update your ROM progress</Text>
          </View>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>

        {activeGoals.length === 0 ? (
          <EmptyState
            type="flexibility"
            customTitle="No active goals"
            customMessage="Create a goal before logging a check‑in."
            customActionLabel="Create goal"
            onAction={() => router.push('/goal-create')}
          />
        ) : (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Select goal</Text>
              <View style={styles.goalList}>
                {activeGoals.map((goal) => {
                  const selected = goal.id === selectedId;
                  return (
                    <Pressable
                      key={goal.id}
                      onPress={() => setSelectedId(goal.id)}
                      style={[styles.goalOption, selected && styles.goalOptionActive]}
                    >
                      <View style={styles.goalOptionHeader}>
                        <Text style={styles.goalOptionTitle}>{goal.title}</Text>
                        {selected && (
                          <LinearGradient
                            colors={gradients.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.goalBadge}
                          >
                            <Text style={styles.goalBadgeText}>Selected</Text>
                          </LinearGradient>
                        )}
                      </View>
                      <Text style={styles.goalOptionSubtitle}>{goal.targetArea}</Text>
                      <Text style={styles.goalOptionMeta}>
                        {goal.currentRom}° → {goal.targetRom}° target
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            {selectedGoal && (
              <Card style={styles.card}>
                <Text style={styles.cardTitle}>Log ROM</Text>
                <Text style={styles.cardSubtitle}>
                  Baseline: {selectedGoal.baselineRom}° • Last: {selectedGoal.currentRom}°
                </Text>
                <TextInput
                  value={romValue}
                  onChangeText={(value) => {
                    setRomValue(value);
                    setError(null);
                  }}
                  placeholder="Enter new ROM (degrees)"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  style={styles.input}
                />
                {error && <Text style={styles.errorText}>{error}</Text>}
                <View style={styles.helper}>
                  <Text style={styles.helperText}>Method: {selectedGoal.method}</Text>
                  <Text style={styles.helperText}>Target date: {selectedGoal.targetDate}</Text>
                </View>

                <View style={styles.areaSection}>
                  <Text style={styles.areaTitle}>Tight areas today</Text>
                  <View style={styles.areaRow}>
                    {(selectedGoal.focusAreas || []).map((area) => {
                      const active = selectedAreas.includes(area);
                      return (
                        <Pressable
                          key={area}
                          onPress={() => toggleArea(area)}
                          style={[styles.areaChip, active && styles.areaChipActive]}
                        >
                          <Text style={[styles.areaChipText, active && styles.areaChipTextActive]}>
                            {AREA_LABELS[area] || area}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </Card>
            )}

            <View style={styles.footer}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => router.back()}
                style={styles.footerButton}
              />
              <PremiumButton
                title="Save Check‑In"
                onPress={handleSave}
                fullWidth
                style={styles.footerButton}
              />
            </View>
          </>
        )}
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
    paddingBottom: 140,
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
  goalList: {
    gap: spacing.sm,
  },
  goalOption: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  goalOptionActive: {
    borderColor: colors.primary,
  },
  goalOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  goalOptionTitle: {
    ...typography.headline,
    color: colors.text,
  },
  goalOptionSubtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  goalOptionMeta: {
    ...typography.caption2,
    color: colors.accent,
    marginTop: spacing.xs,
  },
  goalBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  goalBadgeText: {
    ...typography.caption2,
    color: colors.textInverse,
  },
  input: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    ...typography.headline,
    color: colors.text,
  },
  errorText: {
    ...typography.caption1,
    color: colors.error,
    marginTop: spacing.sm,
  },
  helper: {
    marginTop: spacing.sm,
  },
  helperText: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  areaSection: {
    marginTop: spacing.md,
  },
  areaTitle: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  areaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  areaChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  areaChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  areaChipText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  areaChipTextActive: {
    color: colors.textInverse,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  footerButton: {
    flex: 1,
  },
});
