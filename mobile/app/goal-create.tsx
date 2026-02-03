import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { colors, typography, spacing, borderRadius, gradients, shadows } from '@/config/theme';
import { Card, Button } from '@/components/ui';
import { PremiumButton } from '@/components/PremiumButton';
import { useGoalsStore } from '@/store/goalsStore';

const steps = ['Goal', 'ROM', 'Method', 'Summary'];

const goalTypes = [
  { id: 'splits', title: 'Front Splits', description: 'Deep hip + hamstring mobility', targetArea: 'Hips • Hamstrings', focusAreas: ['hamstrings', 'glutes', 'quads', 'lower_back'] },
  { id: 'middle_splits', title: 'Middle Splits', description: 'Adductors + hips', targetArea: 'Hips • Groin', focusAreas: ['hamstrings', 'glutes', 'quads'] },
  { id: 'touch_toes', title: 'Touch Toes', description: 'Posterior chain flexibility', targetArea: 'Hamstrings • Back', focusAreas: ['hamstrings', 'lower_back', 'calves'] },
  { id: 'hip_mobility', title: 'Hip Mobility', description: 'Improve squat depth and stride', targetArea: 'Hips • Glutes', focusAreas: ['glutes', 'hamstrings', 'quads'] },
  { id: 'shoulder_mobility', title: 'Shoulder Mobility', description: 'Overhead range and comfort', targetArea: 'Shoulders • Upper Back', focusAreas: ['shoulders', 'upper_back', 'chest'] },
  { id: 'ankle_mobility', title: 'Ankle Mobility', description: 'Better ankle dorsiflexion', targetArea: 'Ankles • Calves', focusAreas: ['calves'] },
  { id: 'general', title: 'General Flexibility', description: 'Balanced mobility routine', targetArea: 'Full Body', focusAreas: ['hamstrings', 'glutes', 'shoulders', 'upper_back'] },
];

const methods = [
  { id: 'video', title: 'Video comparison', subtitle: 'Side‑by‑side angle review' },
  { id: 'manual', title: 'Manual measurement', subtitle: 'Log ROM degrees manually' },
  { id: 'self', title: 'Self‑assessment', subtitle: 'Weekly confidence rating' },
];

const timelineOptions = [
  { id: 4, label: '4 weeks' },
  { id: 8, label: '8 weeks' },
  { id: 12, label: '12 weeks' },
  { id: 16, label: '16 weeks' },
];

export default function GoalCreateScreen() {
  const addGoal = useGoalsStore((state) => state.addGoal);
  const [step, setStep] = useState(0);
  const [goalType, setGoalType] = useState(goalTypes[0]);
  const [baselineRom, setBaselineRom] = useState('60');
  const [targetRom, setTargetRom] = useState('180');
  const [method, setMethod] = useState(methods[0]);
  const [timelineWeeks, setTimelineWeeks] = useState(12);
  const [notes, setNotes] = useState('');

  const targetDateLabel = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + timelineWeeks * 7);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [timelineWeeks]);

  const baselineValue = Number(baselineRom);
  const targetValue = Number(targetRom);

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(goalType);
    if (step === 1) return baselineValue > 0 && targetValue > baselineValue;
    if (step === 2) return Boolean(method);
    return true;
  }, [step, goalType, baselineValue, targetValue, method]);

  const goNext = () => {
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    }
  };

  const goBack = () => {
    if (step === 0) {
      router.back();
      return;
    }
    setStep((prev) => prev - 1);
  };

  const handleCreate = () => {
    const id = `goal_${Date.now()}`;
    const now = new Date();
    addGoal({
      id,
      title: goalType.title,
      targetDate: targetDateLabel,
      targetArea: goalType.targetArea,
      focusAreas: goalType.focusAreas,
      baselineRom: baselineValue,
      currentRom: baselineValue,
      targetRom: targetValue,
      sessionsCompleted: 1,
      streakDays: 1,
      lastCheckIn: 'Today',
      lastCheckInAt: now.toISOString(),
      method: method.title,
      history: [baselineValue],
      checkIns: [
        {
          date: now.toISOString(),
          rom: baselineValue,
          areas: goalType.focusAreas,
        },
      ],
      status: 'active',
      createdAt: now.toISOString(),
    });
    router.replace('/goals');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Create Goal</Text>
              <Text style={styles.subtitle}>Set a flexibility target in minutes</Text>
            </View>
            <Pressable onPress={goBack} style={styles.closeButton}>
              <Text style={styles.closeText}>{step === 0 ? 'Close' : 'Back'}</Text>
            </Pressable>
          </View>

          <View style={styles.stepRow}>
            {steps.map((label, index) => {
              const active = index === step;
              const completed = index < step;
              return (
                <View key={label} style={[styles.stepChip, (active || completed) && styles.stepChipActive]}>
                  <Text style={[styles.stepText, (active || completed) && styles.stepTextActive]}>
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>

          {step === 0 && (
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Choose goal type</Text>
              <Text style={styles.cardSubtitle}>Pick the flexibility outcome you want most.</Text>
              <View style={styles.cardGrid}>
                {goalTypes.map((item) => {
                  const selected = item.id === goalType.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setGoalType(item)}
                      style={[styles.optionCard, selected && styles.optionCardActive]}
                    >
                      <Text style={styles.optionTitle}>{item.title}</Text>
                      <Text style={styles.optionSubtitle}>{item.description}</Text>
                      <Text style={styles.optionMeta}>{item.targetArea}</Text>
                      {selected && (
                        <LinearGradient
                          colors={gradients.primary}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.optionBadge}
                        >
                          <Text style={styles.optionBadgeText}>Selected</Text>
                        </LinearGradient>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          )}

          {step === 1 && (
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Baseline & target ROM</Text>
              <Text style={styles.cardSubtitle}>Log where you are today and where you want to be.</Text>
              <View style={styles.inputRow}>
                <View style={styles.inputBlock}>
                  <Text style={styles.inputLabel}>Baseline (degrees)</Text>
                  <TextInput
                    value={baselineRom}
                    onChangeText={setBaselineRom}
                    keyboardType="numeric"
                    style={styles.input}
                    placeholder="60"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
                <View style={styles.inputBlock}>
                  <Text style={styles.inputLabel}>Target (degrees)</Text>
                  <TextInput
                    value={targetRom}
                    onChangeText={setTargetRom}
                    keyboardType="numeric"
                    style={styles.input}
                    placeholder="180"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              </View>
              <Text style={styles.helperText}>
                Target should be higher than baseline. Adjust later from the Goals screen.
              </Text>
            </Card>
          )}

          {step === 2 && (
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Tracking method</Text>
              <Text style={styles.cardSubtitle}>Choose how you want to log progress.</Text>
              {methods.map((item) => {
                const selected = item.id === method.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setMethod(item)}
                    style={[styles.methodRow, selected && styles.methodRowActive]}
                  >
                    <View>
                      <Text style={styles.methodTitle}>{item.title}</Text>
                      <Text style={styles.methodSubtitle}>{item.subtitle}</Text>
                    </View>
                    <View style={[styles.methodPill, selected && styles.methodPillActive]}>
                      <Text style={[styles.methodPillText, selected && styles.methodPillTextActive]}>
                        {selected ? 'Selected' : 'Select'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}

              <Text style={[styles.cardTitle, { marginTop: spacing.lg }]}>Timeline</Text>
              <Text style={styles.cardSubtitle}>Set a realistic target date.</Text>
              <View style={styles.row}>
                {timelineOptions.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => setTimelineWeeks(item.id)}
                    style={[styles.chip, timelineWeeks === item.id && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, timelineWeeks === item.id && styles.chipTextActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Card>
          )}

          {step === 3 && (
            <>
              <Card style={styles.card}>
                <Text style={styles.cardTitle}>Review goal</Text>
                <Text style={styles.cardSubtitle}>Confirm details before saving.</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Goal</Text>
                  <Text style={styles.summaryValue}>{goalType.title}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Target area</Text>
                  <Text style={styles.summaryValue}>{goalType.targetArea}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>ROM</Text>
                  <Text style={styles.summaryValue}>
                    {baselineValue}° → {targetValue}°
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Method</Text>
                  <Text style={styles.summaryValue}>{method.title}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Target date</Text>
                  <Text style={styles.summaryValue}>{targetDateLabel}</Text>
                </View>
              </Card>

              <Card style={styles.card}>
                <Text style={styles.cardTitle}>Notes (optional)</Text>
                <Text style={styles.cardSubtitle}>Add context for your coach or future self.</Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Example: focus on left hip tightness"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.input, styles.notesInput]}
                  multiline
                />
              </Card>
            </>
          )}

          <View style={styles.footer}>
            <Button
              title="Back"
              variant="secondary"
              onPress={goBack}
              style={styles.footerButton}
            />
            {step < steps.length - 1 ? (
              <PremiumButton
                title="Continue"
                onPress={goNext}
                fullWidth
                disabled={!canContinue}
                style={styles.footerButton}
              />
            ) : (
              <PremiumButton
                title="Create Goal"
                onPress={handleCreate}
                fullWidth
                disabled={!canContinue}
                style={styles.footerButton}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  stepRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stepChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  stepChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepText: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  stepTextActive: {
    color: colors.textInverse,
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
  cardGrid: {
    gap: spacing.sm,
  },
  optionCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  optionCardActive: {
    borderColor: colors.primary,
  },
  optionTitle: {
    ...typography.headline,
    color: colors.text,
  },
  optionSubtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  optionMeta: {
    ...typography.caption2,
    color: colors.accent,
    marginTop: spacing.xs,
  },
  optionBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  optionBadgeText: {
    ...typography.caption2,
    color: colors.textInverse,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputBlock: {
    flex: 1,
  },
  inputLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
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
  helperText: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  methodRowActive: {
    borderColor: colors.primary,
  },
  methodTitle: {
    ...typography.headline,
    color: colors.text,
  },
  methodSubtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  methodPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  methodPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodPillText: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  methodPillTextActive: {
    color: colors.textInverse,
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  summaryLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.headline,
    color: colors.text,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
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
