/**
 * Optimized FlashList components for high-performance lists
 * Based on Hevy's approach to handling 500+ workout history items
 */

import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '@/config/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================
// Workout History List (optimized)
// ============================================

export interface WorkoutHistoryItem {
  id: string;
  name: string;
  date: string;
  duration: number; // minutes
  exerciseCount: number;
  setCount: number;
  totalVolume: number;
}

interface WorkoutHistoryListProps {
  workouts: WorkoutHistoryItem[];
  onWorkoutPress: (workout: WorkoutHistoryItem) => void;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

// Memoized workout row to prevent re-renders
const WorkoutRow = memo(function WorkoutRow({
  workout,
  onPress,
}: {
  workout: WorkoutHistoryItem;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  }, []);
  
  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, []);

  const formattedDate = new Date(workout.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.workoutRow, animatedStyle]}
    >
      <View style={styles.workoutMain}>
        <Text style={styles.workoutName}>{workout.name}</Text>
        <Text style={styles.workoutDate}>{formattedDate}</Text>
      </View>
      <View style={styles.workoutStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{workout.exerciseCount}</Text>
          <Text style={styles.statLabel}>exercises</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{workout.setCount}</Text>
          <Text style={styles.statLabel}>sets</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{workout.duration}</Text>
          <Text style={styles.statLabel}>min</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
});

export function WorkoutHistoryList({
  workouts,
  onWorkoutPress,
  onEndReached,
  refreshing,
  onRefresh,
}: WorkoutHistoryListProps) {
  const renderItem: ListRenderItem<WorkoutHistoryItem> = useCallback(
    ({ item }) => (
      <WorkoutRow workout={item} onPress={() => onWorkoutPress(item)} />
    ),
    [onWorkoutPress]
  );

  const keyExtractor = useCallback((item: WorkoutHistoryItem) => item.id, []);

  return (
    <FlatList
      data={workouts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
}

// ============================================
// Exercise List (for exercise picker)
// ============================================

export interface ExerciseItem {
  id: string;
  name: string;
  category: string;
  primaryMuscles: string[];
  equipment?: string[];
}

interface ExerciseListProps {
  exercises: ExerciseItem[];
  onExercisePress: (exercise: ExerciseItem) => void;
  searchQuery?: string;
}

const ExerciseRow = memo(function ExerciseRow({
  exercise,
  onPress,
}: {
  exercise: ExerciseItem;
  onPress: () => void;
}) {
  const getCategoryEmoji = (category: string) => {
    switch (category.toLowerCase()) {
      case 'push': return '💪';
      case 'pull': return '🏋️';
      case 'legs': return '🦵';
      case 'core': return '🎯';
      default: return '✨';
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.exerciseRow}>
      <View style={styles.exerciseIcon}>
        <Text style={styles.exerciseEmoji}>{getCategoryEmoji(exercise.category)}</Text>
      </View>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseMeta}>
          {exercise.primaryMuscles.slice(0, 2).join(', ')}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
});

export function ExerciseList({
  exercises,
  onExercisePress,
  searchQuery,
}: ExerciseListProps) {
  const filteredExercises = searchQuery
    ? exercises.filter((e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : exercises;

  const renderItem: ListRenderItem<ExerciseItem> = useCallback(
    ({ item }) => (
      <ExerciseRow exercise={item} onPress={() => onExercisePress(item)} />
    ),
    [onExercisePress]
  );

  const keyExtractor = useCallback((item: ExerciseItem) => item.id, []);

  return (
    <FlatList
      data={filteredExercises}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}

// ============================================
// Set List (for workout logging)
// ============================================

export interface SetItem {
  id: string;
  setNumber: number;
  weight?: number;
  reps?: number;
  rpe?: number;
  isWarmup?: boolean;
  completed?: boolean;
}

interface SetListProps {
  sets: SetItem[];
  onSetPress: (set: SetItem) => void;
  onSetUpdate: (set: SetItem) => void;
}

const SetRow = memo(function SetRow({
  set,
  onPress,
}: {
  set: SetItem;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.setRow}>
      <View style={styles.setNumber}>
        <Text style={[
          styles.setNumberText,
          set.isWarmup && styles.warmupText,
        ]}>
          {set.isWarmup ? 'W' : set.setNumber}
        </Text>
      </View>
      <View style={styles.setData}>
        <Text style={styles.setValue}>{set.weight || '—'}</Text>
        <Text style={styles.setUnit}>lbs</Text>
      </View>
      <View style={styles.setData}>
        <Text style={styles.setValue}>{set.reps || '—'}</Text>
        <Text style={styles.setUnit}>reps</Text>
      </View>
      <View style={[
        styles.completedIndicator,
        set.completed && styles.completedActive,
      ]}>
        <Text style={styles.checkmark}>{set.completed ? '✓' : ''}</Text>
      </View>
    </Pressable>
  );
});

export function SetList({ sets, onSetPress }: SetListProps) {
  const renderItem: ListRenderItem<SetItem> = useCallback(
    ({ item }) => <SetRow set={item} onPress={() => onSetPress(item)} />,
    [onSetPress]
  );

  const keyExtractor = useCallback((item: SetItem) => item.id, []);

  return (
    <FlatList
      data={sets}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  // Workout Row
  workoutRow: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  workoutMain: {
    marginBottom: spacing.md,
  },
  workoutName: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  workoutDate: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.title3,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
  // Exercise Row
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
  exerciseMeta: {
    ...typography.caption1,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  chevron: {
    ...typography.title2,
    color: colors.textTertiary,
  },
  // Set Row
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  setNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  setNumberText: {
    ...typography.headline,
    color: colors.text,
  },
  warmupText: {
    color: colors.textSecondary,
  },
  setData: {
    flex: 1,
    alignItems: 'center',
  },
  setValue: {
    ...typography.title3,
    color: colors.text,
  },
  setUnit: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
  completedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default {
  WorkoutHistoryList,
  ExerciseList,
  SetList,
};
