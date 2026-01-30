import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  Pressable, 
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Href } from 'expo-router';
import { API_URL } from '@/config/api';
import { colors, typography, spacing, borderRadius, shadows } from '@/config/theme';
import { Card, CategoryCard } from '@/components/ui';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

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
  category: string;
  difficulty: string;
  stretches?: Stretch[];
}

function RoutineCard({ routine, onPress }: { routine: Routine; onPress: () => void }) {
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

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.routineCard, animatedStyle]}
    >
      <View style={styles.routineEmoji}>
        <Text style={styles.emojiText}>{getEmoji(routine.category)}</Text>
      </View>
      <View style={styles.routineContent}>
        <Text style={styles.routineName}>{routine.name}</Text>
        <Text style={styles.routineDescription} numberOfLines={1}>
          {routine.description}
        </Text>
        <View style={styles.routineMeta}>
          <Text style={styles.routineMetaText}>⏱ {routine.durationMinutes} min</Text>
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

  const fetchRoutines = async () => {
    try {
      const response = await fetch(`${API_URL}/stretching/routines`);
      if (response.ok) {
        const data = await response.json();
        setRoutines(data.routines || []);
      }
    } catch (error) {
      console.log('Failed to fetch routines:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoutines();
  };

  const categories = [
    { title: 'Morning', subtitle: 'Wake up', emoji: '🌅' },
    { title: 'Evening', subtitle: 'Wind down', emoji: '🌙' },
    { title: 'Desk Break', subtitle: 'Quick relief', emoji: '💻' },
    { title: 'Full Body', subtitle: 'Complete', emoji: '🧘' },
  ];

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
      
      <ScrollView 
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
        <View style={styles.header}>
          <Text style={styles.title}>Stretching</Text>
        </View>

        {/* Categories */}
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

        {/* Routines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Routines</Text>
          
          {routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onPress={() => router.push({
                pathname: '/player',
                params: { routineId: routine.id }
              } as Href)}
            />
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  routineEmoji: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
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
  routineArrow: {
    ...typography.title2,
    color: colors.textTertiary,
  },
  bottomSpacer: {
    height: 100,
  },
});
