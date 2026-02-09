import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Href, useFocusEffect } from 'expo-router';
import { API_URL } from '@/config/api';
import { colors, gradients, typography, spacing, borderRadius, shadows } from '@/config/theme';
import { CategoryCard, ErrorBanner } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { deleteStretchingRoutine } from '@/lib/api/stretching';
import { playHaptic } from '@/lib/sounds';
import { cacheStretchingRoutines, getCachedStretchingRoutines } from '@/lib/database';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { Skeleton, StaggeredItem } from '@/components/AnimatedComponents';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Stretch {
  id: string;
  name: string;
  targetMuscles: string;
  durationSeconds: number;
}

interface Routine {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  durationSeconds?: number;
  category: string;
  difficulty: string;
  stretches?: Stretch[];
  userId?: string | null;
  isSystem?: boolean;
}

function RoutineCard({
  routine,
  onPress,
  isOwned,
  onDelete,
}: {
  routine: Routine;
  onPress: () => void;
  isOwned?: boolean;
  onDelete?: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handleLongPress = () => {
    if (!isOwned || !onDelete) return;
    playHaptic('heavy');
    Alert.alert(
      'Delete Routine',
      `Delete "${routine.name}"? This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const getEmoji = (category: string | undefined) => {
    switch ((category || '').toLowerCase()) {
      case 'morning': return '🌅';
      case 'evening': return '🌙';
      case 'desk_break': return '💻';
      case 'pre_workout': return '🔥';
      case 'post_workout': return '❄️';
      case 'flexibility': return '🧘';
      default: return '✨';
    }
  };

  const durationMin = routine.durationMinutes ||
    (routine.durationSeconds ? Math.max(1, Math.round(routine.durationSeconds / 60)) : 0);

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.routineCard, animatedStyle]}
    >
      <LinearGradient
        colors={isOwned ? gradients.glowPlum : gradients.primaryReverse}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.routineEmoji}
      >
        <Text style={styles.emojiText}>{isOwned ? '🛠' : getEmoji(routine.category)}</Text>
      </LinearGradient>
      <View style={styles.routineContent}>
        <View style={styles.routineNameRow}>
          <Text style={styles.routineName} numberOfLines={1}>{routine.name}</Text>
          {isOwned && (
            <View style={styles.ownedBadge}>
              <Text style={styles.ownedBadgeText}>MY</Text>
            </View>
          )}
        </View>
        <Text style={styles.routineDescription} numberOfLines={1}>
          {routine.description}
        </Text>
        <View style={styles.routineMeta}>
          <Text style={styles.routineMetaText}>⏱ {durationMin} min</Text>
          <Text style={styles.routineMetaText}>• {routine.difficulty}</Text>
        </View>
      </View>
      <Text style={styles.routineArrow}>›</Text>
    </AnimatedPressable>
  );
}

export default function StretchingScreen() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const { user, isAuthenticated } = useAuthStore();

  const fetchRoutines = async () => {
    try {
      const response = await fetch(`${API_URL}/stretching/routines`);
      if (response.ok) {
        const data = await response.json();
        const fetched = data.routines || [];
        setRoutines(fetched);
        setErrorMessage(null);
        // Cache for offline use
        cacheStretchingRoutines(fetched).catch(() => {});
      } else {
        setErrorMessage('Unable to load routines right now.');
      }
    } catch (error) {
      console.log('Failed to fetch routines, trying cache:', error);
      // Fall back to cached routines
      try {
        const cached = await getCachedStretchingRoutines();
        if (cached.length > 0) {
          setRoutines(cached);
          setErrorMessage(null);
        } else {
          setErrorMessage('Unable to load routines right now.');
        }
      } catch {
        setErrorMessage('Unable to load routines right now.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  // Re-fetch when screen comes back into focus (after creating/editing)
  useFocusEffect(
    useCallback(() => {
      fetchRoutines();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoutines();
  };

  const handleDeleteRoutine = async (routineId: string) => {
    try {
      await deleteStretchingRoutine(routineId);
      playHaptic('success');
      setRoutines((prev) => prev.filter((r) => r.id !== routineId));
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to delete routine');
    }
  };

  const filteredRoutines = filter === 'mine'
    ? routines.filter((r) => r.userId === user?.id)
    : routines;

  const categories = [
    { title: 'Morning', subtitle: 'Wake up', emoji: '🌅' },
    { title: 'Evening', subtitle: 'Wind down', emoji: '🌙' },
    { title: 'Desk Break', subtitle: 'Quick relief', emoji: '💻' },
    { title: 'Full Body', subtitle: 'Complete', emoji: '🧘' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={{ flex: 1, paddingTop: spacing.md }}>
          <View style={styles.header}>
            <Skeleton width={160} height={28} borderRadius={8} />
            <Skeleton width={220} height={16} borderRadius={6} style={{ marginTop: spacing.xs }} />
          </View>
          <View style={styles.section}>
            <Skeleton width={100} height={20} borderRadius={6} style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }} />
            <View style={styles.categoryGrid}>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} width={72} height={80} borderRadius={borderRadius.md} />
              ))}
            </View>
          </View>
          <View style={styles.section}>
            <Skeleton width={80} height={20} borderRadius={6} style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }} />
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.routineCard}>
                <Skeleton width={48} height={48} borderRadius={borderRadius.md} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Skeleton width="70%" height={16} borderRadius={6} />
                  <Skeleton width="50%" height={12} borderRadius={4} style={{ marginTop: spacing.xs }} />
                  <Skeleton width="30%" height={10} borderRadius={4} style={{ marginTop: spacing.xs }} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <ScrollView bounces={false} 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(50).duration(250)}>
          <View style={styles.header}>
            <Text style={styles.title}>Stretching</Text>
            <Text style={styles.subtitle}>Build flexibility & recovery</Text>
          </View>
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInUp.delay(100).duration(250)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat, index) => (
                <CategoryCard
                  key={index}
                  title={cat.title}
                  subtitle={cat.subtitle}
                  emoji={cat.emoji}
                  onPress={() => {}}
                />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Routines */}
        <View style={styles.section}>
          <Animated.View entering={FadeInUp.delay(150).duration(250)}>
            <View style={styles.routineHeader}>
              <Text style={styles.routineHeaderTitle}>Routines</Text>
              {isAuthenticated && (
                <View style={styles.filterToggle}>
                  <Pressable
                    onPress={() => { playHaptic('light'); setFilter('all'); }}
                    style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
                  >
                    <Text style={[styles.filterBtnText, filter === 'all' && styles.filterBtnTextActive]}>
                      All
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { playHaptic('light'); setFilter('mine'); }}
                    style={[styles.filterBtn, filter === 'mine' && styles.filterBtnActive]}
                  >
                    <Text style={[styles.filterBtnText, filter === 'mine' && styles.filterBtnTextActive]}>
                      Mine
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            {errorMessage && (
              <ErrorBanner
                title="Couldn't load routines"
                message={errorMessage}
                actionLabel="Retry"
                onAction={fetchRoutines}
                style={styles.errorBanner}
              />
            )}

            {filteredRoutines.length === 0 ? (
              <EmptyState
                type="routines"
                onAction={filter === 'mine'
                  ? () => router.push('/create-routine' as Href)
                  : fetchRoutines}
                customActionLabel={filter === 'mine' ? 'Create Routine' : 'Refresh'}
                style={styles.emptyState}
              />
            ) : null}
          </Animated.View>

          {filteredRoutines.length > 0 &&
            filteredRoutines.map((routine, index) => (
              <StaggeredItem key={routine.id} index={index}>
                <RoutineCard
                  routine={routine}
                  isOwned={routine.userId === user?.id}
                  onPress={() => router.push({
                    pathname: '/routine',
                    params: { routineId: routine.id }
                  } as Href)}
                  onDelete={() => handleDeleteRoutine(routine.id)}
                />
              </StaggeredItem>
            ))
          }
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Create Routine FAB */}
      {isAuthenticated && (
        <Pressable
          onPress={() => {
            playHaptic('selection');
            router.push('/create-routine' as Href);
          }}
          style={styles.fab}
        >
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Text style={styles.fabText}>+</Text>
          </LinearGradient>
        </Pressable>
      )}
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
  subtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  routineEmoji: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  emojiText: {
    fontSize: 24,
  },
  routineContent: {
    flex: 1,
  },
  routineName: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  routineDescription: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  routineMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  routineMetaText: {
    ...typography.caption1,
    color: colors.textTertiary,
  },
  routineNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  ownedBadge: {
    backgroundColor: colors.accent + '14',
    borderWidth: 1,
    borderColor: colors.accent + '33',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  ownedBadgeText: {
    ...typography.caption2,
    color: colors.accent,
    letterSpacing: 0.5,
  },
  routineArrow: {
    ...typography.title2,
    color: colors.accent,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  routineHeaderTitle: {
    ...typography.title3,
    color: colors.text,
  },
  filterToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 2,
  },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  filterBtnActive: {
    backgroundColor: colors.accent,
  },
  filterBtnText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  filterBtnTextActive: {
    color: colors.textInverse,
  },
  errorBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyState: {
    marginHorizontal: spacing.lg,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing.lg,
    ...shadows.glow,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    fontSize: 28,
    color: colors.textInverse,
    marginTop: -2,
  },
  bottomSpacer: {
    height: 100,
  },
});
