import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '@/config/theme';
import { Card } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { fetchExercises } from '@/lib/api/exercises';
import { Exercise as APIExercise, BODY_PART_EMOJIS } from '@/types/exercise';
import {
  getWorkout,
  addExerciseToWorkout,
  addSet,
  deleteSet,
  finishWorkout,
  type Workout,
  type WorkoutExercise,
  type WorkoutSet,
} from '@/lib/api/strength';
import SetRow from '@/components/SetRow';
import { playHaptic } from '@/lib/sounds';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ workoutId: string }>();
  const workoutId = params.workoutId;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  // Exercise search modal
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<APIExercise[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingExercise, setAddingExercise] = useState(false);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load workout data
  useEffect(() => {
    if (workoutId) {
      loadWorkout();
    }
  }, [workoutId]);

  const loadWorkout = async () => {
    try {
      const data = await getWorkout(workoutId);
      setWorkout(data);
    } catch (error) {
      console.error('Failed to load workout:', error);
      Alert.alert('Error', 'Failed to load workout');
    } finally {
      setLoading(false);
    }
  };

  // Search exercises
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeout = setTimeout(async () => {
        setSearching(true);
        try {
          const response = await fetchExercises({ search: searchQuery, limit: 20 });
          setSearchResults(response.exercises);
        } catch {
          // ignore
        } finally {
          setSearching(false);
        }
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleAddExercise = async (exercise: APIExercise) => {
    if (!workoutId || addingExercise) return;
    setAddingExercise(true);
    try {
      await addExerciseToWorkout(workoutId, exercise.id);
      playHaptic('success');
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      await loadWorkout();
    } catch (error) {
      Alert.alert('Error', 'Failed to add exercise');
    } finally {
      setAddingExercise(false);
    }
  };

  const handleAddSet = async (workoutExerciseId: string, data: { weight?: number; reps?: number }) => {
    try {
      await addSet(workoutExerciseId, data);
      playHaptic('success');
      await loadWorkout();
    } catch (error) {
      Alert.alert('Error', 'Failed to add set');
    }
  };

  const handleDeleteSet = async (setId: string) => {
    try {
      await deleteSet(setId);
      await loadWorkout();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete set');
    }
  };

  const handleFinish = () => {
    Alert.alert('Finish Workout?', 'Are you sure you want to finish this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        onPress: async () => {
          try {
            const result = await finishWorkout(workoutId);
            playHaptic('success');

            const exerciseCount = result.exercises?.length || 0;
            const setCount = result.exercises?.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0) || 0;
            const totalVolume = result.totalVolume || 0;
            const prs = result.exercises?.reduce(
              (sum, ex) => sum + (ex.sets?.filter((s) => s.isPr).length || 0),
              0
            ) || 0;

            router.replace({
              pathname: '/workout-complete',
              params: {
                name: result.name || 'Workout',
                duration: Math.round(elapsed / 60).toString(),
                exercises: exerciseCount.toString(),
                sets: setCount.toString(),
                volume: Math.round(totalVolume).toString(),
                prs: prs.toString(),
              },
            });
          } catch (error) {
            Alert.alert('Error', 'Failed to finish workout');
          }
        },
      },
    ]);
  };

  const handleDiscard = () => {
    Alert.alert('Discard Workout?', 'Your progress will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => router.back(),
      },
    ]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.primary} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDiscard}>
          <Text style={styles.discardText}>Discard</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.workoutName} numberOfLines={1}>
            {workout?.name || 'Workout'}
          </Text>
          <Text style={styles.timer}>{formatTime(elapsed)}</Text>
        </View>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Exercises */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {workout?.exercises?.map((workoutExercise, index) => (
          <Animated.View
            key={workoutExercise.id}
            entering={FadeInUp.delay(index * 50).duration(200)}
          >
            <Card style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>
                    {workoutExercise.exercise?.name || 'Exercise'}
                  </Text>
                  <Text style={styles.exerciseMeta}>
                    {BODY_PART_EMOJIS[workoutExercise.exercise?.bodyPart?.toLowerCase() || ''] || '🏋️'}{' '}
                    {workoutExercise.exercise?.target || workoutExercise.exercise?.bodyPart}
                  </Text>
                </View>
              </View>

              {/* Set header */}
              <View style={styles.setHeader}>
                <Text style={[styles.setHeaderText, { width: 24 }]}>Set</Text>
                <Text style={[styles.setHeaderText, { flex: 1 }]}>Weight</Text>
                <Text style={[styles.setHeaderText, { flex: 1 }]}>Reps</Text>
                <View style={{ width: 32 }} />
              </View>

              {/* Completed sets */}
              {workoutExercise.sets?.map((set) => (
                <SetRow
                  key={set.id}
                  setNumber={set.setNumber}
                  weight={set.weight || undefined}
                  reps={set.reps || undefined}
                  isPr={set.isPr}
                  completed={true}
                  onSave={() => {}}
                  onDelete={() => handleDeleteSet(set.id)}
                />
              ))}

              {/* New set row */}
              <SetRow
                setNumber={(workoutExercise.sets?.length || 0) + 1}
                completed={false}
                onSave={(data) => handleAddSet(workoutExercise.id, data)}
              />
            </Card>
          </Animated.View>
        ))}

        {/* Add exercise button */}
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => setShowSearch(true)}
        >
          <Text style={styles.addExerciseText}>+ Add Exercise</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Exercise Search Modal */}
      <Modal visible={showSearch} animationType="slide" onRequestClose={() => setShowSearch(false)}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.searchHeader}>
            <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.searchTitle}>Add Exercise</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
          </View>

          {searching && <ActivityIndicator color={colors.primary} style={{ padding: spacing.lg }} />}

          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchResultRow}
                onPress={() => handleAddExercise(item)}
                disabled={addingExercise}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultMeta}>
                    {BODY_PART_EMOJIS[item.bodyPart?.toLowerCase() || ''] || '🏋️'} {item.bodyPart} • {item.equipment}
                  </Text>
                </View>
                <View style={styles.addBadge}>
                  <Text style={styles.addBadgeText}>+</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              searchQuery.length >= 2 && !searching ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No exercises found</Text>
                </View>
              ) : searchQuery.length < 2 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Type 2+ characters to search</Text>
                </View>
              ) : null
            }
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  discardText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '500',
  },
  headerCenter: {
    alignItems: 'center',
  },
  workoutName: {
    ...typography.headline,
    color: colors.text,
  },
  timer: {
    ...typography.title2,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  finishButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  finishButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textInverse,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  exerciseCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    marginTop: 2,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: spacing.xs,
  },
  setHeaderText: {
    ...typography.caption2,
    color: colors.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addExerciseButton: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary + '40',
    borderStyle: 'dashed',
  },
  addExerciseText: {
    ...typography.headline,
    color: colors.primary,
  },
  // Search modal
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    width: 60,
  },
  searchTitle: {
    ...typography.headline,
    color: colors.text,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  resultName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  resultMeta: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBadgeText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
