import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { colors, gradients, typography, spacing, borderRadius, shadows } from '@/config/theme';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { API_URL } from '@/config/api';
import { Card, ErrorBanner } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { fetchExercises, fetchBodyParts } from '@/lib/api/exercises';
import { Exercise as APIExercise, BODY_PART_EMOJIS, EQUIPMENT_ICONS } from '@/types/exercise';
import ExerciseDetailModal from '@/components/ExerciseDetailModal';
import { playHaptic } from '@/lib/sounds';
import { router } from 'expo-router';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface WorkoutExercise {
  id: string;
  exercise: APIExercise;
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
  const [exercises, setExercises] = useState<APIExercise[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [restTimerRemaining, setRestTimerRemaining] = useState<number | null>(null);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { accessToken, isAuthenticated } = useAuthStore();
  const preferences = useSettingsStore((state) => state.preferences);
  
  // Exercise detail modal
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Debounced search
    const timeout = setTimeout(() => {
      setPage(1);
      loadExercises(1, true);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedBodyPart]);

  const loadInitialData = async () => {
    try {
      const [exerciseData, bodyPartData] = await Promise.all([
        fetchExercises({ page: 1, limit: 20 }),
        fetchBodyParts().catch(() => []),
      ]);
      setExercises(exerciseData.exercises);
      setTotalPages(exerciseData.pagination.totalPages);
      setBodyParts(bodyPartData);
      setErrorMessage(null);
    } catch (error) {
      console.log('Failed to fetch exercises:', error);
      setErrorMessage('Unable to load exercises right now.');
    } finally {
      setLoading(false);
    }
  };

  const loadExercises = async (pageNum = 1, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const response = await fetchExercises({
        page: pageNum,
        limit: 20,
        bodyPart: selectedBodyPart || undefined,
        search: searchQuery || undefined,
      });
      
      if (reset || pageNum === 1) {
        setExercises(response.exercises);
      } else {
        setExercises(prev => [...prev, ...response.exercises]);
      }
      
      setTotalPages(response.pagination.totalPages);
      setPage(pageNum);
      setErrorMessage(null);
    } catch (error) {
      console.log('Failed to fetch exercises:', error);
      setErrorMessage('Unable to load exercises right now.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleExercisePress = (exercise: APIExercise) => {
    playHaptic('light');
    setSelectedExerciseId(exercise.id);
    setDetailModalVisible(true);
  };

  const handleFilterPress = (bodyPart: string) => {
    playHaptic('selection');
    setSelectedBodyPart(prev => prev === bodyPart ? null : bodyPart);
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

  const addExerciseToWorkout = async (exercise: APIExercise) => {
    if (!activeWorkout) return;
    playHaptic('success');
    
    // Add locally for immediate feedback
    const newWorkoutExercise: WorkoutExercise = {
      id: `temp-${Date.now()}`,
      exercise,
      sets: [],
    };
    
    setActiveWorkout({
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newWorkoutExercise],
    });
    
    
    // Optionally sync with backend
    try {
      await fetch(`${API_URL}/strength/workouts/${activeWorkout.id}/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ exerciseId: exercise.id }),
      });
    } catch (error) {
      console.log('Failed to sync exercise to backend:', error);
    }
  };

  const addSet = async (workoutExerciseId: string, weight: number, reps: number) => {
    playHaptic('light');
    
    // Add locally
    const newSet: WorkoutSet = {
      id: `set-${Date.now()}`,
      setNumber: (activeWorkout?.exercises.find(e => e.id === workoutExerciseId)?.sets.length || 0) + 1,
      weight,
      reps,
    };
    
    setActiveWorkout({
      ...activeWorkout!,
      exercises: activeWorkout!.exercises.map((we) =>
        we.id === workoutExerciseId
          ? { ...we, sets: [...we.sets, newSet] }
          : we
      ),
    });

    if (preferences.autoRestTimer) {
      startRestTimer(preferences.restTimerSeconds);
    }
  };

  const startRestTimer = (durationSeconds: number) => {
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
    }
    setRestTimerRemaining(durationSeconds);
    restIntervalRef.current = setInterval(() => {
      setRestTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (restIntervalRef.current) clearInterval(restIntervalRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelRestTimer = () => {
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
    }
    setRestTimerRemaining(null);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const finishWorkout = async () => {
    if (!activeWorkout) return;
    playHaptic('success');
    setActiveWorkout(null);
    if (preferences.autoStretchPrompt) {
      Alert.alert(
        'Workout Complete',
        'Want a quick recovery stretch?',
        [
          { text: 'Maybe later', style: 'cancel' },
          { text: 'Start Stretch', onPress: () => router.push('/(tabs)/stretching') },
        ]
      );
    } else {
      Alert.alert('🎉 Workout Complete!', 'Great job finishing your workout!');
    }
  };

  const renderExerciseItem = useCallback(({ item, index }: { item: APIExercise; index: number }) => (
    <ExerciseLibraryRow 
      exercise={item} 
      onPress={() => handleExercisePress(item)}
      onAdd={activeWorkout ? () => addExerciseToWorkout(item) : undefined}
      index={index}
    />
  ), [activeWorkout]);

  if (loading && exercises.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <Animated.View entering={FadeIn} style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        {activeWorkout && (
          <TouchableOpacity 
            style={styles.finishButton} 
            onPress={finishWorkout}
          >
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Active Workout Banner */}
      {activeWorkout && (
        <Animated.View entering={FadeInUp.duration(250)} style={styles.activeWorkoutBanner}>
          <Text style={styles.activeWorkoutTitle}>🔥 {activeWorkout.name}</Text>
          <Text style={styles.activeWorkoutMeta}>
            {activeWorkout.exercises.length} exercises • Tap exercises below to add
          </Text>
        </Animated.View>
      )}

      {/* Rest Timer */}
      {restTimerRemaining !== null && (
        <View style={styles.restTimerBanner}>
          <View>
            <Text style={styles.restTimerLabel}>Rest Timer</Text>
            <Text style={styles.restTimerValue}>{formatTimer(restTimerRemaining)}</Text>
          </View>
          <Pressable style={styles.restTimerButton} onPress={cancelRestTimer}>
            <Text style={styles.restTimerButtonText}>Skip</Text>
          </Pressable>
        </View>
      )}

      {errorMessage && (
        <View style={styles.errorBannerWrap}>
          <ErrorBanner
            title="Couldn't load exercises"
            message={errorMessage}
            actionLabel="Retry"
            onAction={() => loadExercises(1, true)}
          />
        </View>
      )}

      {/* Active Workout Exercises */}
      {activeWorkout && activeWorkout.exercises.length > 0 && (
        <ScrollView bounces={false} 
          style={styles.activeExercisesScroll}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeExercisesContent}
        >
          {activeWorkout.exercises.map((we, index) => (
            <WorkoutExerciseCard
              key={we.id}
              workoutExercise={we}
              onAddSet={(weight, reps) => addSet(we.id, weight, reps)}
            />
          ))}
        </ScrollView>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Body Part Filters */}
      {bodyParts.length > 0 && (
        <ScrollView bounces={false} 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {bodyParts.map((bp) => (
            <TouchableOpacity
              key={bp}
              style={[
                styles.filterChip,
                selectedBodyPart === bp && styles.filterChipActive,
              ]}
              onPress={() => handleFilterPress(bp)}
            >
              <Text style={styles.filterChipEmoji}>
                {BODY_PART_EMOJIS[bp.toLowerCase()] || '🏋️'}
              </Text>
              <Text style={[
                styles.filterChipText,
                selectedBodyPart === bp && styles.filterChipTextActive,
              ]}>
                {bp}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Exercise List */}
      <FlatList
        data={exercises}
        renderItem={renderExerciseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (page < totalPages && !loadingMore) {
            loadExercises(page + 1);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              type={searchQuery || selectedBodyPart ? 'search' : 'exercises'}
              onAction={
                searchQuery || selectedBodyPart
                  ? () => {
                      setSearchQuery('');
                      setSelectedBodyPart(null);
                    }
                  : undefined
              }
              customActionLabel={searchQuery || selectedBodyPart ? 'Clear filters' : undefined}
            />
          </View>
        }
      />

      {/* Start Workout FAB */}
      {!activeWorkout && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={startWorkout}
        >
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          />
          <Text style={styles.fabText}>+ Start Workout</Text>
        </TouchableOpacity>
      )}

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        exerciseId={selectedExerciseId}
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
      />
    </SafeAreaView>
  );
}

// Exercise Row with GIF preview
function ExerciseLibraryRow({ 
  exercise, 
  onPress,
  onAdd,
  index = 0,
}: { 
  exercise: APIExercise; 
  onPress: () => void;
  onAdd?: () => void;
  index?: number;
}) {
  const scale = useSharedValue(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bodyPartEmoji = exercise.bodyPart 
    ? BODY_PART_EMOJIS[exercise.bodyPart.toLowerCase()] || '🏋️'
    : '🏋️';

  return (
    <Animated.View entering={FadeInUp.delay(index * 30).duration(250)}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[styles.exerciseRow, animatedStyle]}
      >
        {/* GIF Thumbnail */}
        <View style={styles.exerciseThumbnail}>
          {exercise.gifUrl ? (
            <Image
              source={{ uri: exercise.gifUrl }}
              style={styles.exerciseGif}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <Text style={styles.exerciseEmoji}>{bodyPartEmoji}</Text>
          )}
        </View>

        {/* Info */}
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName} numberOfLines={1}>{exercise.name}</Text>
          <View style={styles.exerciseTags}>
            {exercise.target && (
              <Text style={styles.exerciseTag}>🎯 {exercise.target}</Text>
            )}
            {exercise.equipment && (
              <Text style={styles.exerciseTag}>
                {EQUIPMENT_ICONS[exercise.equipment.toLowerCase()] || '⚙️'} {exercise.equipment}
              </Text>
            )}
          </View>
        </View>

        {/* Add Button (if workout active) */}
        {onAdd ? (
          <TouchableOpacity style={styles.addButton} onPress={onAdd}>
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButtonGradient}
            />
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.exerciseArrow}>›</Text>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

// Compact workout exercise card
function WorkoutExerciseCard({ 
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
      // Keep previous values for faster logging
      setWeight(weight);
      setReps(reps);
    }
  };

  return (
    <Card style={styles.workoutExerciseCard}>
      {/* Thumbnail */}
      <View style={styles.workoutExerciseThumbnail}>
        {workoutExercise.exercise.gifUrl ? (
          <Image
            source={{ uri: workoutExercise.exercise.gifUrl }}
            style={styles.workoutExerciseGif}
          />
        ) : (
          <Text style={{ fontSize: 24 }}>🏋️</Text>
        )}
      </View>
      
      <Text style={styles.workoutExerciseTitle} numberOfLines={2}>
        {workoutExercise.exercise.name}
      </Text>
      
      {/* Sets */}
      {workoutExercise.sets.map((set) => (
        <Text key={set.id} style={styles.setInfo}>
          Set {set.setNumber}: {set.weight}lbs × {set.reps}
        </Text>
      ))}
      
      {/* Add Set */}
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
        <Pressable style={styles.miniAddButton} onPress={handleAddSet}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.miniAddButtonGradient}
          />
          <Text style={styles.miniAddButtonText}>+</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.title1,
    color: colors.text,
  },
  finishButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
  },
  finishButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textInverse,
  },
  activeWorkoutBanner: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primary + '14',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '33',
    marginBottom: spacing.md,
  },
  restTimerBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restTimerLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  restTimerValue: {
    ...typography.title2,
    color: colors.text,
  },
  restTimerButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent + '12',
    borderWidth: 1,
    borderColor: colors.accent + '33',
  },
  restTimerButtonText: {
    ...typography.caption1,
    color: colors.accent,
  },
  activeWorkoutTitle: {
    ...typography.headline,
    color: colors.text,
  },
  activeWorkoutMeta: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activeExercisesScroll: {
    maxHeight: 220,
    marginBottom: spacing.md,
  },
  activeExercisesContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    height: 44,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.textSecondary,
    padding: spacing.xs,
  },
  filterScroll: {
    marginBottom: spacing.sm,
  },
  filterContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterChipActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  filterChipEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  filterChipText: {
    ...typography.caption1,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 100,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  exerciseThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  exerciseGif: {
    width: '100%',
    height: '100%',
  },
  exerciseEmoji: {
    fontSize: 24,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...typography.headline,
    color: colors.text,
    textTransform: 'capitalize',
  },
  exerciseTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 4,
  },
  exerciseTag: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontSize: 11,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  addButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  addButtonText: {
    fontSize: 20,
    color: colors.textInverse,
    fontWeight: '600',
  },
  exerciseArrow: {
    ...typography.title2,
    color: colors.textTertiary,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  errorBannerWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 28,
    overflow: 'hidden',
    ...shadows.lg,
  },
  fabGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  fabText: {
    ...typography.headline,
    color: colors.textInverse,
  },
  // Workout Exercise Card
  workoutExerciseCard: {
    width: 160,
    padding: spacing.sm,
  },
  workoutExerciseThumbnail: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  workoutExerciseGif: {
    width: '100%',
    height: '100%',
  },
  workoutExerciseTitle: {
    ...typography.caption1,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  setInfo: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  addSetRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: spacing.xs,
  },
  setInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    ...typography.caption1,
    color: colors.text,
    textAlign: 'center',
  },
  miniAddButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  miniAddButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  miniAddButtonText: {
    fontSize: 16,
    color: colors.textInverse,
    fontWeight: '600',
  },
});
