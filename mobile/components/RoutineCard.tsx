/**
 * RoutineCard Component
 * Displays a workout routine preview card
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, spacing, typography, shadows } from '@/config/theme';
import { Routine, CATEGORY_INFO } from '@/lib/api/routines';
import { playHaptic } from '@/lib/sounds';

interface RoutineCardProps {
  routine: Routine;
  onPress: (routine: Routine) => void;
  index?: number;
}

export default function RoutineCard({ routine, onPress, index = 0 }: RoutineCardProps) {
  const categoryInfo = CATEGORY_INFO[routine.category] || { emoji: '🏋️', label: routine.category, color: colors.primary };

  const handlePress = () => {
    playHaptic('light');
    onPress(routine);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '#4ECDC4';
      case 'intermediate': return '#FFB347';
      case 'advanced': return '#FF6B6B';
      default: return colors.textSecondary;
    }
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(250)}>
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Header with emoji and category */}
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

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>{routine.name}</Text>

        {/* Description */}
        {routine.description && (
          <Text style={styles.description} numberOfLines={2}>{routine.description}</Text>
        )}

        {/* Footer with duration and exercise count */}
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Text style={styles.footerIcon}>⏱️</Text>
            <Text style={styles.footerText}>{routine.durationMinutes} min</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerIcon}>📋</Text>
            <Text style={styles.footerText}>{routine.exercises?.length || 0} exercises</Text>
          </View>
          {routine.equipment?.length > 0 && (
            <View style={styles.footerItem}>
              <Text style={styles.footerIcon}>🎯</Text>
              <Text style={styles.footerText}>{routine.equipment.length} equip</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    ...typography.title3,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  description: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerIcon: {
    fontSize: 12,
  },
  footerText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
});
