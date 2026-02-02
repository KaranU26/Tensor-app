/**
 * ExerciseCard Component
 * Displays exercise with animated GIF preview
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { Exercise, BODY_PART_EMOJIS, EQUIPMENT_ICONS } from '@/types/exercise';
import { colors, spacing, typography, shadows } from '@/config/theme';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress: (exercise: Exercise) => void;
  index?: number;
}

export default function ExerciseCard({ exercise, onPress, index = 0 }: ExerciseCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const bodyPartEmoji = exercise.bodyPart 
    ? BODY_PART_EMOJIS[exercise.bodyPart.toLowerCase()] || '🏋️'
    : '🏋️';
  
  const equipmentIcon = exercise.equipment
    ? EQUIPMENT_ICONS[exercise.equipment.toLowerCase()] || '⚙️'
    : '⚙️';

  return (
    <Animated.View 
      entering={FadeInRight.delay(index * 50).duration(250)}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(exercise)}
        activeOpacity={0.8}
      >
        {/* GIF Preview */}
        <View style={styles.imageContainer}>
          {exercise.gifUrl && !imageError ? (
            <>
              <Image
                source={{ uri: exercise.gifUrl }}
                style={styles.image}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                resizeMode="cover"
              />
              {imageLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator color={colors.primary} size="small" />
                </View>
              )}
            </>
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderEmoji}>{bodyPartEmoji}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>
            {exercise.name}
          </Text>

          {/* Tags */}
          <View style={styles.tags}>
            {exercise.target && (
              <View style={[styles.tag, styles.targetTag]}>
                <Text style={styles.tagText}>🎯 {exercise.target}</Text>
              </View>
            )}
            {exercise.equipment && (
              <View style={[styles.tag, styles.equipmentTag]}>
                <Text style={styles.tagText}>{equipmentIcon} {exercise.equipment}</Text>
              </View>
            )}
          </View>

          {/* Body Part Badge */}
          {exercise.bodyPart && (
            <View style={styles.bodyPartBadge}>
              <Text style={styles.bodyPartText}>
                {bodyPartEmoji} {exercise.bodyPart}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  content: {
    padding: spacing.sm,
  },
  name: {
    ...typography.body,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.xs,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  targetTag: {
    backgroundColor: colors.primaryLight + '20',
  },
  equipmentTag: {
    backgroundColor: colors.primaryLight + '20',
  },
  tagText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  bodyPartBadge: {
    marginTop: 4,
  },
  bodyPartText: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
});
