import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, StatusBar } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '@/config/theme';
import { Card, Button } from '@/components/ui';
import { API_URL } from '@/config/api';

interface Stretch {
  id: string;
  name: string;
  durationSeconds: number;
}

interface RoutineStretch {
  id: string;
  stretchId: string;
  positionOrder: number;
  customDurationSeconds?: number;
  stretch: Stretch;
}

interface Routine {
  id: string;
  name: string;
  description?: string;
  durationMinutes?: number;
  difficulty?: string;
  category?: string;
  stretches: RoutineStretch[];
}

export default function RoutineDetailScreen() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (routineId) {
      loadRoutine();
    }
  }, [routineId]);

  const loadRoutine = async () => {
    try {
      const response = await fetch(`${API_URL}/stretching/routines/${routineId}`);
      const data = await response.json();
      setRoutine(data.routine);
    } catch (error) {
      console.log('Failed to load routine:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSeconds = routine?.stretches?.reduce((sum, item) => {
    const duration = item.customDurationSeconds || item.stretch?.durationSeconds || 30;
    return sum + duration;
  }, 0) || 0;

  const totalMinutes = routine?.durationMinutes || Math.max(1, Math.round(totalSeconds / 60));

  if (loading || !routine) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading routine...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>{routine.name}</Text>
          {routine.description ? (
            <Text style={styles.subtitle}>{routine.description}</Text>
          ) : null}
        </View>

        <Card style={styles.metaCard}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Duration</Text>
              <Text style={styles.metaValue}>{totalMinutes} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Difficulty</Text>
              <Text style={styles.metaValue}>{routine.difficulty || 'Beginner'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Stretches</Text>
              <Text style={styles.metaValue}>{routine.stretches?.length || 0}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Stretch List</Text>
        {routine.stretches?.map((item, index) => (
          <Card key={item.id || index} style={styles.stretchCard}>
            <View style={styles.stretchRow}>
              <View style={styles.stretchIndex}>
                <Text style={styles.stretchIndexText}>{index + 1}</Text>
              </View>
              <View style={styles.stretchContent}>
                <Text style={styles.stretchName}>{item.stretch?.name || 'Stretch'}</Text>
                <Text style={styles.stretchDuration}>
                  {Math.round((item.customDurationSeconds || item.stretch?.durationSeconds || 30))} sec
                </Text>
              </View>
            </View>
          </Card>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Start Routine"
          onPress={() => router.push({ pathname: '/player', params: { routineId: routine.id } })}
          size="lg"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 140,
  },
  header: {
    marginBottom: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  title: {
    ...typography.title1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  metaCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    alignItems: 'center',
    flex: 1,
  },
  metaLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metaValue: {
    ...typography.headline,
    color: colors.text,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  stretchCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  stretchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stretchIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '14',
    borderWidth: 1,
    borderColor: colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stretchIndexText: {
    ...typography.caption1,
    color: colors.primary,
  },
  stretchContent: {
    flex: 1,
  },
  stretchName: {
    ...typography.headline,
    color: colors.text,
  },
  stretchDuration: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },
  bottomSpacer: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
  },
  loadingText: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
