/**
 * Setup Wizard Screen
 * Multi-step onboarding to generate a personalized starter routine
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { EquipmentPicker } from '@/components/EquipmentPicker';
import { generateRoutine, type Equipment, type Goal } from '@/lib/routineGenerator';
import { requestNotificationPermission } from '@/lib/notifications';
import { requestHealthPermissions } from '@/lib/healthSync';
import { Card } from '@/components/ui';
import { colors, typography, spacing, borderRadius, shadows, gradients } from '@/config/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Step = 'welcome' | 'focus' | 'days' | 'equipment' | 'mobility' | 'permissions' | 'preview';

type Focus = 'strength' | 'mobility' | 'recovery' | 'hybrid';

interface FocusOption {
  id: Focus;
  label: string;
  emoji: string;
  description: string;
}

const FOCUS_OPTIONS: FocusOption[] = [
  { id: 'strength', label: 'Strength', emoji: '💪', description: 'Build muscle & hit PRs' },
  { id: 'mobility', label: 'Mobility', emoji: '🧘', description: 'Improve flexibility & ROM' },
  { id: 'recovery', label: 'Recovery', emoji: '❄️', description: 'Reduce soreness & improve readiness' },
  { id: 'hybrid', label: 'Hybrid', emoji: '⚡', description: 'Strength + mobility combined' },
];

interface GoalOption {
  id: Goal;
  label: string;
  emoji: string;
  description: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  { id: 'build_muscle', label: 'Build Muscle', emoji: '💪', description: 'Hypertrophy focused' },
  { id: 'get_stronger', label: 'Get Stronger', emoji: '🏋️', description: 'Strength & power' },
  { id: 'general_fitness', label: 'General Fitness', emoji: '❤️', description: 'Overall health' },
];

const MOBILITY_TARGETS = [
  { id: 'hips', label: 'Hips', emoji: '🧘' },
  { id: 'hamstrings', label: 'Hamstrings', emoji: '🦵' },
  { id: 'shoulders', label: 'Shoulders', emoji: '🏹' },
  { id: 'back', label: 'Back', emoji: '🧍' },
  { id: 'ankles', label: 'Ankles', emoji: '🦶' },
];

const STEPS: Step[] = ['welcome', 'focus', 'days', 'equipment', 'mobility', 'permissions', 'preview'];

export default function SetupWizardScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [focus, setFocus] = useState<Focus>('hybrid');
  const [goal, setGoal] = useState<Goal>('build_muscle');
  const [equipment, setEquipment] = useState<Equipment[]>(['barbell', 'dumbbells']);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [mobilityTargets, setMobilityTargets] = useState<string[]>(['hips']);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [healthEnabled, setHealthEnabled] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState({
    notifications: false,
    health: false,
  });

  const stepIndex = Math.max(0, STEPS.indexOf(step));
  const progressValue = (stepIndex + 1) / STEPS.length;

  const handleNext = useCallback(() => {
    if (step === 'equipment') {
      if (equipment.length === 0) {
        Alert.alert('Select Equipment', 'Please select at least one equipment type.');
        return;
      }
    }
    if (step === 'preview') {
      handleComplete();
      return;
    }
    const nextStep = STEPS[stepIndex + 1];
    if (nextStep) setStep(nextStep);
  }, [step, stepIndex, equipment]);

  const handleBack = useCallback(() => {
    const prevStep = STEPS[stepIndex - 1];
    if (prevStep) setStep(prevStep);
  }, [stepIndex]);

  const handleFocusSelect = (nextFocus: Focus) => {
    setFocus(nextFocus);
    if (nextFocus === 'mobility' || nextFocus === 'recovery') {
      setGoal('general_fitness');
    }
  };

  const toggleMobilityTarget = (id: string) => {
    setMobilityTargets((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleNotificationPermission = async () => {
    try {
      setPermissionLoading((prev) => ({ ...prev, notifications: true }));
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
    } catch (error) {
      console.log('Notification permission failed:', error);
    } finally {
      setPermissionLoading((prev) => ({ ...prev, notifications: false }));
    }
  };

  const handleHealthPermission = async () => {
    try {
      setPermissionLoading((prev) => ({ ...prev, health: true }));
      const status = await requestHealthPermissions();
      setHealthEnabled(status === 'granted');
    } catch (error) {
      console.log('Health permission failed:', error);
    } finally {
      setPermissionLoading((prev) => ({ ...prev, health: false }));
    }
  };

  const handleComplete = useCallback(() => {
    const routine = generateRoutine({ equipment, daysPerWeek, goal });
    console.log('Generated routine:', {
      routine,
      focus,
      mobilityTargets,
      notificationsEnabled,
      healthEnabled,
    });
    AsyncStorage.setItem('hasOnboarded', 'true').catch(() => {});
    Alert.alert(
      'Plan Ready! 🎉',
      `Your ${routine.name} plan is ready with ${routine.days.length} workout days.`,
      [{ text: 'Start Today', onPress: () => router.replace('/(tabs)') }]
    );
  }, [equipment, daysPerWeek, goal, focus, mobilityTargets, notificationsEnabled, healthEnabled, router]);

  const generatedRoutine = step === 'preview'
    ? generateRoutine({ equipment, daysPerWeek, goal })
    : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: `${progressValue * 100}%` }]}>
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.progressGradient}
            />
          </Animated.View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Step */}
        {step === 'welcome' && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <View style={styles.hero}>
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroOrb}
              >
                <Text style={styles.heroEmoji}>⚡</Text>
              </LinearGradient>
              <Text style={styles.title}>Build strength + mobility</Text>
              <Text style={styles.subtitle}>Let’s set up your plan in under a minute.</Text>
            </View>
            <View style={styles.bullets}>
              <BulletRow emoji="✅" text="Personalized strength split" />
              <BulletRow emoji="🧘" text="Mobility targets tailored to you" />
              <BulletRow emoji="📈" text="Progress insights from day one" />
            </View>
          </Animated.View>
        )}

        {/* Focus Step */}
        {step === 'focus' && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.title}>What’s your primary focus?</Text>
            <Text style={styles.subtitle}>You can change this later</Text>

            <View style={styles.focusGrid}>
              {FOCUS_OPTIONS.map((option) => (
                <FocusCard
                  key={option.id}
                  option={option}
                  isSelected={focus === option.id}
                  onPress={() => handleFocusSelect(option.id)}
                />
              ))}
            </View>

            {(focus === 'strength' || focus === 'hybrid') && (
              <View style={styles.subSection}>
                <Text style={styles.sectionTitle}>Strength style</Text>
                <View style={styles.goalGrid}>
                  {GOAL_OPTIONS.map((option) => (
                    <GoalCard
                      key={option.id}
                      option={option}
                      isSelected={goal === option.id}
                      onPress={() => setGoal(option.id)}
                    />
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
        )}

        {/* Days Step */}
        {step === 'days' && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.title}>How many days per week?</Text>
            <Text style={styles.subtitle}>We’ll create the optimal split</Text>

            <View style={styles.daysGrid}>
              {[2, 3, 4, 5, 6].map((days) => (
                <DayButton
                  key={days}
                  days={days}
                  isSelected={daysPerWeek === days}
                  onPress={() => setDaysPerWeek(days)}
                />
              ))}
            </View>

            <View style={styles.splitPreview}>
              <Text style={styles.splitLabel}>
                {daysPerWeek <= 3 && '→ Full Body Split'}
                {daysPerWeek === 4 && '→ Upper/Lower Split'}
                {daysPerWeek >= 5 && '→ Push/Pull/Legs Split'}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Equipment Step */}
        {step === 'equipment' && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
            <EquipmentPicker
              selected={equipment}
              onSelectionChange={setEquipment}
            />
          </Animated.View>
        )}

        {/* Mobility Step */}
        {step === 'mobility' && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.title}>Target mobility areas</Text>
            <Text style={styles.subtitle}>Pick 1–3 areas to prioritize</Text>

            <View style={styles.mobilityGrid}>
              {MOBILITY_TARGETS.map((target) => (
                <Pressable
                  key={target.id}
                  onPress={() => toggleMobilityTarget(target.id)}
                  style={[
                    styles.mobilityChip,
                    mobilityTargets.includes(target.id) && styles.mobilityChipSelected,
                  ]}
                >
                  <Text style={styles.mobilityEmoji}>{target.emoji}</Text>
                  <Text
                    style={[
                      styles.mobilityLabel,
                      mobilityTargets.includes(target.id) && styles.mobilityLabelSelected,
                    ]}
                  >
                    {target.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Permissions Step */}
        {step === 'permissions' && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.title}>Enable helpful reminders</Text>
            <Text style={styles.subtitle}>You can change these in Settings</Text>

            <Card style={styles.permissionCard}>
              <View style={styles.permissionRow}>
                <View style={styles.permissionIcon}>
                  <Text style={styles.permissionEmoji}>🔔</Text>
                </View>
                <View style={styles.permissionText}>
                  <Text style={styles.permissionTitle}>Notifications</Text>
                  <Text style={styles.permissionSubtitle}>Workout reminders and recovery alerts</Text>
                </View>
                <Pressable
                  style={[styles.permissionButton, notificationsEnabled && styles.permissionButtonActive]}
                  onPress={handleNotificationPermission}
                >
                  {permissionLoading.notifications ? (
                    <ActivityIndicator color={colors.textInverse} size="small" />
                  ) : (
                    <Text style={styles.permissionButtonText}>
                      {notificationsEnabled ? 'Enabled' : 'Enable'}
                    </Text>
                  )}
                </Pressable>
              </View>
            </Card>

            <Card style={styles.permissionCard}>
              <View style={styles.permissionRow}>
                <View style={styles.permissionIcon}>
                  <Text style={styles.permissionEmoji}>❤️</Text>
                </View>
                <View style={styles.permissionText}>
                  <Text style={styles.permissionTitle}>Health Sync</Text>
                  <Text style={styles.permissionSubtitle}>Sync workouts to Health/Google Fit</Text>
                </View>
                <Pressable
                  style={[styles.permissionButton, healthEnabled && styles.permissionButtonActive]}
                  onPress={handleHealthPermission}
                >
                  {permissionLoading.health ? (
                    <ActivityIndicator color={colors.textInverse} size="small" />
                  ) : (
                    <Text style={styles.permissionButtonText}>
                      {healthEnabled ? 'Enabled' : 'Enable'}
                    </Text>
                  )}
                </Pressable>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Preview Step */}
        {step === 'preview' && generatedRoutine && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.title}>{generatedRoutine.name}</Text>
            <Text style={styles.subtitle}>{generatedRoutine.description}</Text>

            <Card style={styles.summaryCard}>
              <SummaryRow label="Focus" value={focusLabel(focus)} />
              <SummaryRow label="Training days" value={`${daysPerWeek} / week`} />
              <SummaryRow label="Equipment" value={equipment.join(', ')} />
              <SummaryRow
                label="Mobility targets"
                value={mobilityTargets.length ? mobilityTargets.join(', ') : 'General mobility'}
              />
              <SummaryRow label="Notifications" value={notificationsEnabled ? 'Enabled' : 'Off'} />
              <SummaryRow label="Health sync" value={healthEnabled ? 'Enabled' : 'Off'} />
            </Card>

            <View style={styles.previewContainer}>
              {generatedRoutine.days.map((day, index) => (
                <Card key={index} style={styles.dayCard}>
                  <Text style={styles.dayName}>{day.name}</Text>
                  <Text style={styles.dayExercises}>{day.exercises.length} exercises</Text>
                  <View style={styles.exerciseList}>
                    {day.exercises.slice(0, 4).map((ex, i) => (
                      <Text key={i} style={styles.exerciseItem}>
                        • {ex.name}
                      </Text>
                    ))}
                    {day.exercises.length > 4 && (
                      <Text style={styles.moreExercises}>
                        +{day.exercises.length - 4} more
                      </Text>
                    )}
                  </View>
                </Card>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {step !== 'welcome' && (
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.nextButton, step === 'welcome' && styles.nextButtonFull]}
          onPress={handleNext}
        >
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextButtonGradient}
          />
          <Text style={styles.nextButtonText}>
            {step === 'preview' ? 'Create Plan ✓' : 'Continue →'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function focusLabel(focus: Focus) {
  switch (focus) {
    case 'strength':
      return 'Strength';
    case 'mobility':
      return 'Mobility';
    case 'recovery':
      return 'Recovery';
    case 'hybrid':
      return 'Hybrid';
    default:
      return 'Hybrid';
  }
}

function BulletRow({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletEmoji}>{emoji}</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function FocusCard({
  option,
  isSelected,
  onPress,
}: {
  option: FocusOption;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.focusCard, isSelected && styles.focusCardSelected]}
    >
      <Text style={styles.focusEmoji}>{option.emoji}</Text>
      <Text style={[styles.focusLabel, isSelected && styles.focusLabelSelected]}>
        {option.label}
      </Text>
      <Text style={styles.focusDescription}>{option.description}</Text>
    </Pressable>
  );
}

function DayButton({
  days,
  isSelected,
  onPress,
}: {
  days: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.dayButton, isSelected && styles.dayButtonSelected, animatedStyle]}
    >
      <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
        {days}
      </Text>
      <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
        days
      </Text>
    </AnimatedPressable>
  );
}

function GoalCard({
  option,
  isSelected,
  onPress,
}: {
  option: GoalOption;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.goalCard, isSelected && styles.goalCardSelected]}
    >
      <Text style={styles.goalEmoji}>{option.emoji}</Text>
      <View style={styles.goalTextBlock}>
        <Text style={[styles.goalLabel, isSelected && styles.goalLabelSelected]}>
          {option.label}
        </Text>
        <Text style={styles.goalDescription}>{option.description}</Text>
      </View>
    </Pressable>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 140,
  },
  stepContainer: {
    padding: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heroOrb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroEmoji: {
    fontSize: 48,
  },
  bullets: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bulletEmoji: {
    fontSize: 18,
  },
  bulletText: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  title: {
    ...typography.title1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  focusCard: {
    width: '46%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  focusCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}12`,
  },
  focusEmoji: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  focusLabel: {
    ...typography.headline,
    color: colors.text,
  },
  focusLabelSelected: {
    color: colors.primary,
  },
  focusDescription: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  subSection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.footnote,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  goalGrid: {
    gap: spacing.md,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  goalCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}12`,
  },
  goalEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  goalTextBlock: {
    flex: 1,
  },
  goalLabel: {
    ...typography.headline,
    color: colors.text,
  },
  goalLabelSelected: {
    color: colors.primary,
  },
  goalDescription: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  dayButton: {
    width: 56,
    height: 72,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dayButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}12`,
  },
  dayNumber: {
    ...typography.title2,
    color: colors.text,
  },
  dayNumberSelected: {
    color: colors.primary,
  },
  dayLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  dayLabelSelected: {
    color: colors.primary,
  },
  splitPreview: {
    alignItems: 'center',
  },
  splitLabel: {
    ...typography.headline,
    color: colors.textSecondary,
  },
  mobilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  mobilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  mobilityChipSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}12`,
  },
  mobilityEmoji: {
    fontSize: 16,
  },
  mobilityLabel: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  mobilityLabelSelected: {
    color: colors.primary,
  },
  permissionCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  permissionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '14',
    borderWidth: 1,
    borderColor: colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionEmoji: {
    fontSize: 20,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    ...typography.headline,
    color: colors.text,
  },
  permissionSubtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  permissionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
  },
  permissionButtonActive: {
    backgroundColor: colors.success,
  },
  permissionButtonText: {
    ...typography.caption1,
    color: colors.textInverse,
  },
  summaryCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.subhead,
    color: colors.text,
    textTransform: 'capitalize',
  },
  previewContainer: {
    gap: spacing.md,
  },
  dayCard: {
    padding: spacing.lg,
  },
  dayName: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dayExercises: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  exerciseList: {
    gap: spacing.xs,
  },
  exerciseItem: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  moreExercises: {
    ...typography.caption1,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  navigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
    gap: spacing.md,
    ...shadows.lg,
  },
  backButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  backButtonText: {
    ...typography.headline,
    color: colors.textSecondary,
  },
  nextButton: {
    flex: 2,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    overflow: 'hidden',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  nextButtonText: {
    ...typography.headline,
    color: '#fff',
  },
});
