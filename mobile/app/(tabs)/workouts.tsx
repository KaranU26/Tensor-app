import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '@/config/theme';
import { useAuthStore } from '@/store/authStore';
import { API_URL } from '@/config/api';
import { Card, Button, SessionCard } from '@/components/ui';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
}

interface WorkoutSet {
  id: string;
  setNumber: number;
  weight?: number;
  reps?: number;
}

interface Workout {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
}

export default function WorkoutsScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch(`${API_URL}/strength/exercises`);
      if (response.ok) {
        const data = await response.json();
        setExercises(data.exercises || []);
      }
    } catch (error) {
      console.log('Failed to fetch exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to start a workout.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/strength/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: `Workout - ${new Date().toLocaleDateString()}` }),
      });
      if (response.ok) {
        const data = await response.json();
        setActiveWorkout({ ...data.workout, exercises: [] });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start workout');
    }
  };

  const addExerciseToWorkout = async (exercise: Exercise) => {
    if (!activeWorkout) return;
    try {
      const response = await fetch(`${API_URL}/strength/workouts/${activeWorkout.id}/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ exerciseId: exercise.id }),
      });
      if (response.ok) {
        const data = await response.json();
        setActiveWorkout({
          ...activeWorkout,
          exercises: [...activeWorkout.exercises, data.workoutExercise],
        });
        setShowExerciseModal(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add exercise');
    }
  };

  const addSet = async (workoutExerciseId: string, weight: number, reps: number) => {
    try {
      const response = await fetch(`${API_URL}/strength/workout-exercises/${workoutExerciseId}/sets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ weight, reps }),
      });
      if (response.ok) {
        const data = await response.json();
        setActiveWorkout({
          ...activeWorkout!,
          exercises: activeWorkout!.exercises.map((we) =>
            we.id === workoutExerciseId
              ? { ...we, sets: [...we.sets, data.set] }
              : we
          ),
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add set');
    }
  };

  const finishWorkout = async () => {
    if (!activeWorkout) return;
    try {
      await fetch(`${API_URL}/strength/workouts/${activeWorkout.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ finish: true }),
      });
      Alert.alert('🎉 Workout Complete!', 'Great job finishing your workout!');
      setActiveWorkout(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to finish workout');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Workouts</Text>
        </View>

        {!activeWorkout ? (
          // No active workout
          <View style={styles.startSection}>
            <Card style={styles.startCard}>
              <Text style={styles.startEmoji}>💪</Text>
              <Text style={styles.startTitle}>Ready to train?</Text>
              <Text style={styles.startSubtitle}>
                Start a workout to log your exercises and track progress.
              </Text>
              <Button
                title="Start Workout"
                onPress={startWorkout}
                fullWidth
                style={{ marginTop: spacing.lg }}
              />
            </Card>

            {/* Exercise Library */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Exercise Library</Text>
              {exercises.slice(0, 6).map((exercise) => (
                <ExerciseRow key={exercise.id} exercise={exercise} />
              ))}
            </View>
          </View>
        ) : (
          // Active workout
          <View style={styles.activeWorkout}>
            <Card style={styles.workoutHeader}>
              <Text style={styles.workoutTitle}>{activeWorkout.name}</Text>
              <Text style={styles.workoutMeta}>
                {activeWorkout.exercises.length} exercises
              </Text>
            </Card>

            {activeWorkout.exercises.map((we) => (
              <ExerciseCard
                key={we.id}
                workoutExercise={we}
                onAddSet={(weight, reps) => addSet(we.id, weight, reps)}
              />
            ))}

            <View style={styles.workoutActions}>
              <Button
                title="Add Exercise"
                variant="secondary"
                onPress={() => setShowExerciseModal(true)}
                fullWidth
              />
              <Button
                title="Finish Workout"
                onPress={finishWorkout}
                fullWidth
                style={{ marginTop: spacing.md }}
              />
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Exercise Modal */}
      <Modal visible={showExerciseModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Exercise</Text>
            <Pressable onPress={() => setShowExerciseModal(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.modalScroll}>
            {exercises.map((exercise) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                onPress={() => addExerciseToWorkout(exercise)}
              />
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function ExerciseRow({ exercise, onPress }: { exercise: Exercise; onPress?: () => void }) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.exerciseRow, animatedStyle]}
    >
      <View style={styles.exerciseIcon}>
        <Text style={styles.exerciseEmoji}>🏋️</Text>
      </View>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseCategory}>{exercise.category}</Text>
      </View>
      <Text style={styles.exerciseArrow}>›</Text>
    </AnimatedPressable>
  );
}

function ExerciseCard({ 
  workoutExercise, 
  onAddSet 
}: { 
  workoutExercise: WorkoutExercise; 
  onAddSet: (weight: number, reps: number) => void;
}) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const handleAddSet = () => {
    if (weight && reps) {
      onAddSet(parseFloat(weight), parseInt(reps));
      setWeight('');
      setReps('');
    }
  };

  return (
    <Card style={styles.exerciseCard}>
      <Text style={styles.exerciseCardTitle}>{workoutExercise.exercise.name}</Text>
      
      {workoutExercise.sets.map((set) => (
        <View key={set.id} style={styles.setRow}>
          <Text style={styles.setNumber}>Set {set.setNumber}</Text>
          <Text style={styles.setData}>{set.weight} lbs × {set.reps} reps</Text>
        </View>
      ))}
      
      <View style={styles.addSetRow}>
        <TextInput
          style={styles.setInput}
          placeholder="lbs"
          placeholderTextColor={colors.textTertiary}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.setInput}
          placeholder="reps"
          placeholderTextColor={colors.textTertiary}
          value={reps}
          onChangeText={setReps}
          keyboardType="numeric"
        />
        <Pressable style={styles.addSetButton} onPress={handleAddSet}>
          <Text style={styles.addSetButtonText}>+</Text>
        </Pressable>
      </View>
    </Card>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.title1,
    color: colors.text,
  },
  startSection: {},
  startCard: {
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    padding: spacing.xxl,
  },
  startEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  startTitle: {
    ...typography.title2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  startSubtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  exerciseEmoji: {
    fontSize: 20,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...typography.headline,
    color: colors.text,
  },
  exerciseCategory: {
    ...typography.caption1,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  exerciseArrow: {
    ...typography.title2,
    color: colors.textTertiary,
  },
  activeWorkout: {},
  workoutHeader: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  workoutTitle: {
    ...typography.title2,
    color: colors.text,
  },
  workoutMeta: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  exerciseCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  exerciseCardTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.md,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  setNumber: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  setData: {
    ...typography.subhead,
    color: colors.text,
    fontWeight: '600',
  },
  addSetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  setInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
  addSetButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetButtonText: {
    ...typography.title2,
    color: colors.textInverse,
  },
  workoutActions: {
    padding: spacing.lg,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.title2,
    color: colors.text,
  },
  modalClose: {
    ...typography.headline,
    color: colors.primary,
  },
  modalScroll: {
    flex: 1,
    padding: spacing.sm,
  },
  bottomSpacer: {
    height: 100,
  },
});
