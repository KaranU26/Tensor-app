import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  Pressable,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
  LinearTransition,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Href } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { API_URL } from '@/config/api';
import { colors, typography, spacing, borderRadius } from '@/config/theme';
import { CalendarStrip, SessionCard, CategoryCard, Card } from '@/components/ui';
import { AnimatedCard, Skeleton } from '@/components/AnimatedComponents';
import { RecoveryCard } from '@/components/RecoveryCard';

interface Routine {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  category: string;
  difficulty: string;
}

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

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

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayRoutine = routines[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
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
        {/* Header - Fade in first */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(300)}
          style={styles.header}
        >
          <View>
            <Text style={styles.title}>Today</Text>
            <Text style={styles.subtitle}>{greeting()}</Text>
          </View>
          <View style={styles.profileButton}>
            <Text style={styles.profileEmoji}>👤</Text>
          </View>
        </Animated.View>

        {/* Calendar Strip - Slide in from right */}
        <Animated.View entering={FadeInRight.delay(200).duration(250)}>
          <CalendarStrip
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </Animated.View>

        {/* Daily Focus */}
        <Animated.View
          entering={FadeInUp.delay(250).duration(300)}
          style={styles.section}
        >
          <Card style={styles.focusCard}>
            <View style={styles.focusHeader}>
              <Text style={styles.focusLabel}>Today's Focus</Text>
              <Text style={styles.focusBadge}>Hybrid</Text>
            </View>
            <Text style={styles.focusTitle}>Strength + Mobility</Text>
            <Text style={styles.focusSubtitle}>45 min strength • 10 min stretch</Text>
          </Card>
        </Animated.View>

        {/* Today's Session - Fade in with delay */}
        <Animated.View 
          entering={FadeInUp.delay(300).duration(300)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Today's Session</Text>
          
          {loading ? (
            <View style={styles.skeletonCard}>
              <Skeleton width="60%" height={24} style={{ marginBottom: 12 }} />
              <Skeleton width="40%" height={16} style={{ marginBottom: 8 }} />
              <Skeleton width="80%" height={40} />
            </View>
          ) : todayRoutine ? (
            <SessionCard
              title={todayRoutine.name}
              subtitle={todayRoutine.category}
              dayNumber={Math.floor(Math.random() * 30) + 1}
              duration={todayRoutine.durationMinutes}
              calories={Math.round(todayRoutine.durationMinutes * 6)}
              onPress={() => router.push({
                pathname: '/player',
                params: { routineId: todayRoutine.id }
              } as Href)}
              onPlayPress={() => router.push({
                pathname: '/player',
                params: { routineId: todayRoutine.id }
              } as Href)}
            />
          ) : (
            <AnimatedCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No session scheduled</Text>
              <Text style={styles.emptySubtitle}>
                Choose a routine to get started
              </Text>
            </AnimatedCard>
          )}
        </Animated.View>

        {/* Categories - Staggered animation */}
        <Animated.View 
          entering={FadeInUp.delay(400).duration(300)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Categories</Text>
          
          <View style={styles.categoryRow}>
            <Animated.View 
              entering={FadeInUp.delay(450).duration(250)}
              style={{ flex: 1 }}
            >
              <CategoryCard
                title="Stretching"
                subtitle="Flexibility"
                emoji="🧘"
                onPress={() => router.push('/(tabs)/stretching' as Href)}
              />
            </Animated.View>
            <Animated.View 
              entering={FadeInUp.delay(500).duration(250)}
              style={{ flex: 1 }}
            >
              <CategoryCard
                title="Strength"
                subtitle="Build muscle"
                emoji="💪"
                onPress={() => router.push('/(tabs)/workouts' as Href)}
              />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(300)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickRow}>
            <Pressable style={styles.quickCard} onPress={() => router.push('/(tabs)/workouts' as Href)}>
              <Text style={styles.quickEmoji}>⚡</Text>
              <Text style={styles.quickLabel}>Quick Log</Text>
            </Pressable>
            <Pressable style={styles.quickCard} onPress={() => router.push('/(tabs)/stretching' as Href)}>
              <Text style={styles.quickEmoji}>🧘</Text>
              <Text style={styles.quickLabel}>Quick Stretch</Text>
            </Pressable>
            <Pressable style={styles.quickCard} onPress={() => router.push('/recovery' as Href)}>
              <Text style={styles.quickEmoji}>🧊</Text>
              <Text style={styles.quickLabel}>Recovery</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Recovery Summary */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(300)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Recovery</Text>
          <RecoveryCard />
        </Animated.View>

        {/* Quick Stats - Staggered cards */}
        {isAuthenticated && (
          <Animated.View 
            entering={FadeInUp.delay(650).duration(300)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>This Week</Text>
            
            <View style={styles.statsRow}>
              <AnimatedCard style={styles.statCard} delay={600}>
                <Text style={styles.statIcon}>🔥</Text>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </AnimatedCard>
              <AnimatedCard style={styles.statCard} delay={650}>
                <Text style={styles.statIcon}>⏱</Text>
                <Text style={styles.statValue}>45</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </AnimatedCard>
              <AnimatedCard style={styles.statCard} delay={700}>
                <Text style={styles.statIcon}>⚡</Text>
                <Text style={styles.statValue}>320</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </AnimatedCard>
            </View>
          </Animated.View>
        )}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEmoji: {
    fontSize: 20,
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
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  focusCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  focusLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  focusBadge: {
    ...typography.caption2,
    color: colors.accent,
    backgroundColor: colors.accent + '12',
    borderWidth: 1,
    borderColor: colors.accent + '33',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
  },
  focusTitle: {
    ...typography.title2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  focusSubtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  quickRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickEmoji: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  quickLabel: {
    ...typography.caption1,
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.title2,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  skeletonCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  bottomSpacer: {
    height: 100,
  },
});
