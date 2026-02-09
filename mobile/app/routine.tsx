import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, StatusBar, Alert } from 'react-native';
import { useLocalSearchParams, router, Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '@/config/theme';
import { Card, Button } from '@/components/ui';
import { API_URL } from '@/config/api';
import { useAuthStore } from '@/store/authStore';
import { deleteStretchingRoutine } from '@/lib/api/stretching';
import { playHaptic } from '@/lib/sounds';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Skeleton, StaggeredItem } from '@/components/AnimatedComponents';

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
  durationSeconds?: number;
  difficulty?: string;
  category?: string;
  stretches: RoutineStretch[];
  userId?: string | null;
  isSystem?: boolean;
}

export default function RoutineDetailScreen() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const isOwned = routine?.userId != null && routine.userId === user?.id;

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

  const handleEdit = () => {
    if (!routine) return;
    playHaptic('selection');
    router.push({
      pathname: '/create-routine',
      params: {
        editId: routine.id,
        prefillName: routine.name,
        prefillDescription: routine.description || '',
        prefillDifficulty: routine.difficulty || 'beginner',
      },
    } as any);
  };

  const handleDelete = () => {
    if (!routine) return;
    playHaptic('heavy');
    Alert.alert(
      'Delete Routine',
      `Delete "${routine.name}"? This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStretchingRoutine(routine.id);
              playHaptic('success');
              router.back();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete routine');
            }
          },
        },
      ]
    );
  };

  const totalSeconds = routine?.stretches?.reduce((sum, item) => {
    const duration = item.customDurationSeconds || item.stretch?.durationSeconds || 30;
    return sum + duration;
  }, 0) || 0;

  const totalMinutes = routine?.durationMinutes || Math.max(1, Math.round(totalSeconds / 60));

  if (loading || !routine) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={[styles.content, { paddingBottom: 0 }]}>
          <View style={styles.header}>
            <Skeleton width={60} height={14} borderRadius={4} style={{ marginBottom: spacing.md }} />
            <Skeleton width="70%" height={28} borderRadius={8} />
            <Skeleton width="50%" height={16} borderRadius={6} style={{ marginTop: spacing.sm }} />
          </View>
          <View style={{ backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.borderLight }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                  <Skeleton width={50} height={12} borderRadius={4} />
                  <Skeleton width={40} height={18} borderRadius={6} style={{ marginTop: spacing.xs }} />
                </View>
              ))}
            </View>
          </View>
          <Skeleton width={100} height={20} borderRadius={6} style={{ marginBottom: spacing.md }} />
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.borderLight }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Skeleton width={28} height={28} borderRadius={14} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Skeleton width="60%" height={16} borderRadius={6} />
                  <Skeleton width="25%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(50).duration(250)}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backText}>← Back</Text>
              </Pressable>
              {isOwned && (
                <View style={styles.headerActions}>
                  <Pressable onPress={handleEdit} style={styles.headerActionBtn}>
                    <Text style={styles.headerActionText}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={handleDelete} style={styles.headerActionBtn}>
                    <Text style={[styles.headerActionText, styles.deleteText]}>Delete</Text>
                  </Pressable>
                </View>
              )}
            </View>
            <Text style={styles.title}>{routine.name}</Text>
            {isOwned && (
              <View style={styles.ownedTag}>
                <Text style={styles.ownedTagText}>Custom Routine</Text>
              </View>
            )}
            {routine.description ? (
              <Text style={styles.subtitle}>{routine.description}</Text>
            ) : null}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(250)}>
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
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150).duration(250)}>
          <Text style={styles.sectionTitle}>Stretch List</Text>
        </Animated.View>
        {routine.stretches?.map((item, index) => (
          <StaggeredItem key={item.id || index} index={index}>
            <Card style={styles.stretchCard}>
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
          </StaggeredItem>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(250).duration(250)}>
        <View style={styles.footer}>
          <Button
            title="Start Routine"
            onPress={() => router.push({ pathname: '/player', params: { routineId: routine.id } })}
            size="lg"
            fullWidth
          />
        </View>
      </Animated.View>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerActionBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.sm,
  },
  headerActionText: {
    ...typography.caption1,
    color: colors.accent,
  },
  deleteText: {
    color: colors.error,
  },
  ownedTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent + '14',
    borderWidth: 1,
    borderColor: colors.accent + '33',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
    marginBottom: spacing.sm,
  },
  ownedTagText: {
    ...typography.caption2,
    color: colors.accent,
  },
  backButton: {},
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
