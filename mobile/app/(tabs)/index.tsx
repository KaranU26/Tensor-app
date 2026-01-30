import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Href } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { API_URL } from '@/config/api';
import { colors, typography, spacing } from '@/config/theme';
import { CalendarStrip, SessionCard, CategoryCard, Card } from '@/components/ui';

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
          <Text style={styles.title}>My Training Plan</Text>
          <View style={styles.profileButton}>
            <Text style={styles.profileEmoji}>👤</Text>
          </View>
        </View>

        {/* Calendar Strip */}
        <CalendarStrip
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        {/* Today's Session */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Session</Text>
          
          {todayRoutine ? (
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
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No session scheduled</Text>
              <Text style={styles.emptySubtitle}>
                Choose a routine to get started
              </Text>
            </Card>
          )}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          
          <View style={styles.categoryRow}>
            <CategoryCard
              title="Stretching"
              subtitle="Flexibility"
              emoji="🧘"
              onPress={() => router.push('/(tabs)/stretching' as Href)}
            />
            <CategoryCard
              title="Strength"
              subtitle="Build muscle"
              emoji="💪"
              onPress={() => router.push('/(tabs)/workouts' as Href)}
            />
          </View>
        </View>

        {/* Quick Stats */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Week</Text>
            
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Text style={styles.statIcon}>🔥</Text>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statIcon}>⏱</Text>
                <Text style={styles.statValue}>45</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statIcon}>⚡</Text>
                <Text style={styles.statValue}>320</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </Card>
            </View>
          </View>
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
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
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
  bottomSpacer: {
    height: 100,
  },
});
