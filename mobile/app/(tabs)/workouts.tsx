import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { 
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '@/config/theme';
import { useAuthStore } from '@/store/authStore';
import { API_URL } from '@/config/api';
import { Card, Button } from '@/components/ui';
import { fetchExercises, fetchBodyParts } from '@/lib/api/exercises';
import { fetchRoutines, Routine, CATEGORY_INFO } from '@/lib/api/routines';
import { Exercise as APIExercise, BODY_PART_EMOJIS } from '@/types/exercise';
import ExerciseDetailModal from '@/components/ExerciseDetailModal';
import RoutineCard from '@/components/RoutineCard';
import RoutineDetailModal from '@/components/RoutineDetailModal';
import { playHaptic } from '@/lib/sounds';
import { Skeleton } from '@/components/AnimatedComponents';

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
  // Main view state
  const [currentView, setCurrentView] = useState<'main' | 'routines' | 'exercises'>('main');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Routines state
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routinesLoading, setRoutinesLoading] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [routineModalVisible, setRoutineModalVisible] = useState(false);
  
  // Exercises state (for search)
  const [exercises, setExercises] = useState<APIExercise[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Exercise detail modal
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  
  const { accessToken, isAuthenticated } = useAuthStore();

  // Load routines on mount
  useEffect(() => {
    loadRoutines();
  }, []);

  // Search exercises when query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeout = setTimeout(() => {
        searchExercises();
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setExercises([]);
      setHasSearched(false);
    }
  }, [searchQuery]);

  const loadRoutines = async (category?: string) => {
    setRoutinesLoading(true);
    try {
      const data = await fetchRoutines({ 
        isPremade: true,
        category: category || undefined,
      });
      setRoutines(data);
    } catch (error) {
      console.log('Failed to fetch routines:', error);
    } finally {
      setRoutinesLoading(false);
    }
  };

  const searchExercises = async () => {
    setExercisesLoading(true);
    setHasSearched(true);
    try {
      const response = await fetchExercises({
        search: searchQuery,
        limit: 30,
      });
      setExercises(response.exercises);
    } catch (error) {
      console.log('Failed to search exercises:', error);
    } finally {
      setExercisesLoading(false);
    }
  };

  const handleCategoryPress = (category: string) => {
    playHaptic('light');
    setSelectedCategory(category);
    loadRoutines(category);
    setCurrentView('routines');
  };

  const handleRoutinePress = (routine: Routine) => {
    playHaptic('light');
    setSelectedRoutine(routine);
    setRoutineModalVisible(true);
  };

  const handleStartRoutineWorkout = async (routine: Routine) => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to start a workout.');
      return;
    }

    playHaptic('success');
    setRoutineModalVisible(false);

    try {
      const response = await fetch(`${API_URL}/strength/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: routine.name }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add routine exercises to the workout
        if (routine.exercises?.length) {
          for (const ex of routine.exercises) {
            const exId = ex.exerciseId || ex.exercise?.id;
            if (exId) {
              await fetch(`${API_URL}/strength/workouts/${data.workout.id}/exercises`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ exerciseId: exId }),
              });
            }
          }
        }
        router.push({ pathname: '/active-workout' as any, params: { workoutId: data.workout.id } });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start workout');
    }
  };

  const handleExercisePress = (exercise: APIExercise) => {
    playHaptic('light');
    setSelectedExerciseId(exercise.id);
    setDetailModalVisible(true);
  };

  const startEmptyWorkout = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to start a workout.');
      return;
    }

    playHaptic('success');

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
        router.push({ pathname: '/active-workout' as any, params: { workoutId: data.workout.id } });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start workout');
    }
  };

  // Get unique categories from routines
  const categories = Object.entries(CATEGORY_INFO).filter(([key]) => 
    routines.some(r => r.category === key) || 
    ['home', 'travel', 'dumbbell', 'band', 'cardio', 'gym', 'bodyweight', 'suspension'].includes(key)
  );

  // Main View - Shows categories, browse routines, create workout buttons
  const renderMainView = () => (
    <ScrollView bounces={false} style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Quick Actions */}
      <Animated.View entering={FadeInUp.delay(50).duration(250)}>
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionCard, styles.primaryAction]} 
            onPress={() => {
              playHaptic('light');
              setSelectedCategory(null);
              loadRoutines();
              setCurrentView('routines');
            }}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionLabel}>Browse Routines</Text>
            <Text style={styles.actionSublabel}>{routines.length}+ premade</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, styles.secondaryAction]} 
            onPress={startEmptyWorkout}
          >
            <Text style={styles.actionIcon}>✨</Text>
            <Text style={styles.actionLabel}>Create Workout</Text>
            <Text style={styles.actionSublabel}>Build your own</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Categories */}
      <Animated.View entering={FadeInUp.delay(100).duration(250)}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesGrid}>
          {categories.map(([key, info], index) => (
            <TouchableOpacity
              key={key}
              style={[styles.categoryCard, { borderColor: info.color + '40' }]}
              onPress={() => handleCategoryPress(key)}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryEmoji}>{info.emoji}</Text>
              <Text style={styles.categoryName}>{info.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Featured Routines */}
      <Animated.View entering={FadeInUp.delay(150).duration(250)}>
        <Text style={styles.sectionTitle}>Featured Routines</Text>
        {routinesLoading ? (
          <View style={{ padding: spacing.sm, gap: spacing.sm }}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surfaceElevated, borderRadius: 16 }}>
                <Skeleton width={48} height={48} borderRadius={12} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Skeleton width="60%" height={16} borderRadius={6} />
                  <Skeleton width="40%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          routines.slice(0, 4).map((routine, index) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onPress={handleRoutinePress}
              index={index}
            />
          ))
        )}
      </Animated.View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // Routines View - Shows filtered routines list
  const renderRoutinesView = () => (
    <View style={styles.routinesContainer}>
      {/* Back button and title */}
      <View style={styles.viewHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          setCurrentView('main');
          setSelectedCategory(null);
        }}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.viewTitle}>
          {selectedCategory ? CATEGORY_INFO[selectedCategory]?.label || selectedCategory : 'All Routines'}
        </Text>
      </View>
      
      {/* Category chips for filtering */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoryChips}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
      >
        <TouchableOpacity
          style={[styles.chip, !selectedCategory && styles.chipActive]}
          onPress={() => {
            setSelectedCategory(null);
            loadRoutines();
          }}
        >
          <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>All</Text>
        </TouchableOpacity>
        {Object.entries(CATEGORY_INFO).map(([key, info]) => (
          <TouchableOpacity
            key={key}
            style={[styles.chip, selectedCategory === key && styles.chipActive]}
            onPress={() => {
              setSelectedCategory(key);
              loadRoutines(key);
            }}
          >
            <Text style={styles.chipEmoji}>{info.emoji}</Text>
            <Text style={[styles.chipText, selectedCategory === key && styles.chipTextActive]}>{info.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Routines list */}
      {routinesLoading ? (
        <View style={{ padding: spacing.md, gap: spacing.sm }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surfaceElevated, borderRadius: 16 }}>
              <Skeleton width={48} height={48} borderRadius={12} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Skeleton width="65%" height={16} borderRadius={6} />
                <Skeleton width="45%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <RoutineCard routine={item} onPress={handleRoutinePress} index={index} />
          )}
          contentContainerStyle={{ padding: spacing.md }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No routines found</Text>
            </View>
          }
        />
      )}
    </View>
  );

  // Exercises View - Shows search and exercises list
  const renderExercisesView = () => (
    <View style={styles.exercisesContainer}>
      {/* Header with back */}
      <View style={styles.viewHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentView('main')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.viewTitle}>Find Exercises</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Hint when no search */}
      {!hasSearched && (
        <View style={styles.searchHint}>
          <Text style={styles.searchHintEmoji}>💡</Text>
          <Text style={styles.searchHintText}>
            Type at least 2 characters to search exercises
          </Text>
        </View>
      )}

      {/* Loading */}
      {exercisesLoading && (
        <View style={{ padding: spacing.md, gap: spacing.xs }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surfaceElevated, borderRadius: 12 }}>
              <View style={{ flex: 1 }}>
                <Skeleton width="55%" height={16} borderRadius={6} />
                <Skeleton width="35%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Results */}
      {hasSearched && !exercisesLoading && (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              style={styles.exerciseRow} 
              onPress={() => handleExercisePress(item)}
              activeOpacity={0.8}
            >
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {BODY_PART_EMOJIS[item.bodyPart?.toLowerCase() || ''] || '🏋️'} {item.bodyPart} • {item.equipment}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No exercises found for "{searchQuery}"</Text>
            </View>
          }
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <Animated.View entering={FadeIn} style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        {currentView === 'main' && (
          <TouchableOpacity 
            style={styles.searchHeaderButton}
            onPress={() => setCurrentView('exercises')}
          >
            <Text style={styles.searchHeaderIcon}>🔍</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Views */}
      {currentView === 'main' && renderMainView()}
      {currentView === 'routines' && renderRoutinesView()}
      {currentView === 'exercises' && renderExercisesView()}

      {/* Modals */}
      <RoutineDetailModal
        routine={selectedRoutine}
        visible={routineModalVisible}
        onClose={() => setRoutineModalVisible(false)}
        onStartWorkout={handleStartRoutineWorkout}
      />

      <ExerciseDetailModal
        exerciseId={selectedExerciseId}
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedExerciseId(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.largeTitle,
    color: colors.text,
  },
  searchHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchHeaderIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    ...typography.title2,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    color: colors.text,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    ...shadows.sm,
  },
  primaryAction: {
    backgroundColor: colors.primary,
  },
  secondaryAction: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderGlow,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  actionLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  actionSublabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...shadows.sm,
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  categoryName: {
    ...typography.caption1,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  routinesContainer: {
    flex: 1,
  },
  exercisesContainer: {
    flex: 1,
  },
  viewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  backButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  viewTitle: {
    ...typography.title3,
    flex: 1,
    color: colors.text,
  },
  finishButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  finishButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textInverse,
  },
  categoryChips: {
    marginBottom: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginRight: spacing.xs,
    gap: 4,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipText: {
    ...typography.caption1,
    color: colors.text,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.textInverse,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  searchHint: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  searchHintEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  searchHintText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    borderRadius: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  exerciseMeta: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 20,
    color: colors.textInverse,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  activeWorkoutBanner: {
    backgroundColor: colors.primary + '15',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  activeWorkoutTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  activeWorkoutMeta: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
