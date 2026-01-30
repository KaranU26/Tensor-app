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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { EquipmentPicker } from '@/components/EquipmentPicker';
import { generateRoutine, type Equipment, type Goal } from '@/lib/routineGenerator';
import { colors, typography, spacing, borderRadius, shadows } from '@/config/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Step = 'equipment' | 'days' | 'goal' | 'preview';

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

export default function SetupWizardScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('equipment');
  const [equipment, setEquipment] = useState<Equipment[]>(['barbell', 'dumbbells']);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [goal, setGoal] = useState<Goal>('build_muscle');

  const progress = {
    equipment: 0.25,
    days: 0.5,
    goal: 0.75,
    preview: 1,
  };

  const handleNext = useCallback(() => {
    if (step === 'equipment') {
      if (equipment.length === 0) {
        Alert.alert('Select Equipment', 'Please select at least one equipment type.');
        return;
      }
      setStep('days');
    } else if (step === 'days') {
      setStep('goal');
    } else if (step === 'goal') {
      setStep('preview');
    }
  }, [step, equipment]);

  const handleBack = useCallback(() => {
    if (step === 'days') setStep('equipment');
    else if (step === 'goal') setStep('days');
    else if (step === 'preview') setStep('goal');
  }, [step]);

  const handleComplete = useCallback(() => {
    const routine = generateRoutine({ equipment, daysPerWeek, goal });
    // TODO: Save routine to database
    console.log('Generated routine:', routine);
    Alert.alert(
      'Routine Created! 🎉',
      `Your ${routine.name} routine is ready with ${routine.days.length} workout days.`,
      [{ text: 'Start Training', onPress: () => router.replace('/(tabs)/workouts') }]
    );
  }, [equipment, daysPerWeek, goal, router]);

  const generatedRoutine = step === 'preview' 
    ? generateRoutine({ equipment, daysPerWeek, goal }) 
    : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View 
            style={[styles.progressFill, { width: `${progress[step] * 100}%` }]} 
          />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Equipment Step */}
        {step === 'equipment' && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
            <EquipmentPicker
              selected={equipment}
              onSelectionChange={setEquipment}
            />
          </Animated.View>
        )}

        {/* Days Step */}
        {step === 'days' && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.title}>How many days per week?</Text>
            <Text style={styles.subtitle}>We'll create the optimal split</Text>
            
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

        {/* Goal Step */}
        {step === 'goal' && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.title}>What's your goal?</Text>
            <Text style={styles.subtitle}>This affects sets and rep ranges</Text>
            
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
          </Animated.View>
        )}

        {/* Preview Step */}
        {step === 'preview' && generatedRoutine && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
            <Text style={styles.title}>{generatedRoutine.name}</Text>
            <Text style={styles.subtitle}>{generatedRoutine.description}</Text>
            
            <View style={styles.previewContainer}>
              {generatedRoutine.days.map((day, index) => (
                <View key={index} style={styles.dayCard}>
                  <Text style={styles.dayName}>{day.name}</Text>
                  <Text style={styles.dayExercises}>
                    {day.exercises.length} exercises
                  </Text>
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
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {step !== 'equipment' && (
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        )}
        
        <Pressable
          style={[styles.nextButton, step === 'equipment' && styles.nextButtonFull]}
          onPress={step === 'preview' ? handleComplete : handleNext}
        >
          <Text style={styles.nextButtonText}>
            {step === 'preview' ? 'Create Routine ✓' : 'Continue →'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// Day Button Component
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

// Goal Card Component
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
      <Text style={[styles.goalLabel, isSelected && styles.goalLabelSelected]}>
        {option.label}
      </Text>
      <Text style={styles.goalDescription}>{option.description}</Text>
    </Pressable>
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
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  stepContainer: {
    padding: spacing.lg,
  },
  title: {
    ...typography.title2,
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
  // Days
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  dayButton: {
    width: 56,
    height: 72,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
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
  // Goals
  goalGrid: {
    gap: spacing.md,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  goalEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  goalLabel: {
    ...typography.headline,
    color: colors.text,
    flex: 1,
  },
  goalLabelSelected: {
    color: colors.primary,
  },
  goalDescription: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  // Preview
  previewContainer: {
    gap: spacing.md,
  },
  dayCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
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
  // Navigation
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
  },
  backButtonText: {
    ...typography.headline,
    color: colors.textSecondary,
  },
  nextButton: {
    flex: 2,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    ...typography.headline,
    color: '#fff',
  },
});
