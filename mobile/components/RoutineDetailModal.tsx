/**
 * RoutineDetailModal Component
 * Shows full routine details with exercises, warmup, and cooldown
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, { FadeIn, FadeInUp, SlideInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, shadows } from '@/config/theme';
import { Routine, CATEGORY_INFO } from '@/lib/api/routines';
import { playHaptic } from '@/lib/sounds';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RoutineDetailModalProps {
  routine: Routine | null;
  visible: boolean;
  onClose: () => void;
  onStartWorkout?: (routine: Routine) => void;
}

export default function RoutineDetailModal({
  routine,
  visible,
  onClose,
  onStartWorkout,
}: RoutineDetailModalProps) {
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    playHaptic('light');
    onClose();
  };

  const handleStart = () => {
    if (routine && onStartWorkout) {
      playHaptic('medium');
      onStartWorkout(routine);
    }
  };

  if (!visible || !routine) return null;

  const categoryInfo = CATEGORY_INFO[routine.category] || { emoji: '🏋️', label: routine.category, color: colors.primary };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '#4ECDC4';
      case 'intermediate': return '#FFB347';
      case 'advanced': return '#FF6B6B';
      default: return colors.textSecondary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <BlurView intensity={20} style={styles.backdrop} tint="dark">
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          onPress={handleClose} 
          activeOpacity={1}
        />
        
        <Animated.View
          entering={SlideInDown.duration(300)}
          style={[styles.container, { paddingBottom: insets.bottom + spacing.md }]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Header */}
            <Animated.View entering={FadeIn.delay(100)}>
              <View style={styles.header}>
                <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '20' }]}>
                  <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
                  <Text style={[styles.categoryLabel, { color: categoryInfo.color }]}>{categoryInfo.label}</Text>
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(routine.difficulty) + '20' }]}>
                  <Text style={[styles.difficultyText, { color: getDifficultyColor(routine.difficulty) }]}>
                    {routine.difficulty}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.title}>{routine.name}</Text>
              {routine.description && (
                <Text style={styles.description}>{routine.description}</Text>
              )}
            </Animated.View>

            {/* Quick Info */}
            <Animated.View entering={FadeInUp.delay(150)} style={styles.quickInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>⏱️</Text>
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{routine.durationMinutes} min</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>📋</Text>
                <Text style={styles.infoLabel}>Exercises</Text>
                <Text style={styles.infoValue}>{routine.exercises?.length || 0}</Text>
              </View>
              {routine.equipment?.length > 0 && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>🎯</Text>
                  <Text style={styles.infoLabel}>Equipment</Text>
                  <Text style={styles.infoValue}>{routine.equipment.length}</Text>
                </View>
              )}
            </Animated.View>

            {/* Equipment */}
            {routine.equipment?.length > 0 && (
              <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
                <Text style={styles.sectionTitle}>Equipment Needed</Text>
                <View style={styles.chipList}>
                  {routine.equipment.map((item, index) => (
                    <View key={index} style={styles.chip}>
                      <Text style={styles.chipText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Warmup */}
            {routine.warmup?.length > 0 && (
              <Animated.View entering={FadeInUp.delay(250)} style={styles.section}>
                <Text style={styles.sectionTitle}>🔥 Warmup</Text>
                {routine.warmup.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.listBullet}>•</Text>
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </Animated.View>
            )}

            {/* Exercises */}
            <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
              <Text style={styles.sectionTitle}>💪 Workout</Text>
              {routine.exercises?.map((ex, index) => (
                <View key={ex.id} style={styles.exerciseItem}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.exerciseContent}>
                    <Text style={styles.exerciseName}>
                      {ex.customName || ex.exercise?.name || 'Unknown Exercise'}
                    </Text>
                    <Text style={styles.exerciseMeta}>
                      {ex.sets} sets × {ex.reps || 'AMRAP'}
                      {ex.restSeconds ? ` • ${ex.restSeconds}s rest` : ''}
                    </Text>
                    {ex.notes && (
                      <Text style={styles.exerciseNotes}>{ex.notes}</Text>
                    )}
                  </View>
                </View>
              ))}
            </Animated.View>

            {/* Cooldown */}
            {routine.cooldown?.length > 0 && (
              <Animated.View entering={FadeInUp.delay(350)} style={styles.section}>
                <Text style={styles.sectionTitle}>🧘 Cooldown</Text>
                {routine.cooldown.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.listBullet}>•</Text>
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </Animated.View>
            )}

            {/* Bottom padding */}
            <View style={{ height: 80 }} />
          </ScrollView>

          {/* Start Button */}
          {onStartWorkout && (
            <Animated.View entering={FadeInUp.delay(400)} style={styles.startButtonContainer}>
              <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                <Text style={styles.startButtonText}>Start Workout</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.9,
    minHeight: SCREEN_HEIGHT * 0.5,
    paddingHorizontal: spacing.lg,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    ...typography.title2,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  infoLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.title3,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: {
    ...typography.caption1,
    color: colors.primary,
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  listBullet: {
    color: colors.textSecondary,
    marginRight: spacing.xs,
    fontSize: 14,
  },
  listText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    fontSize: 14,
  },
  exerciseItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  exerciseNumberText: {
    ...typography.caption1,
    fontWeight: '700',
    color: colors.textInverse,
  },
  exerciseContent: {
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
  exerciseNotes: {
    ...typography.caption1,
    color: colors.primary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  startButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 16,
  },
});
