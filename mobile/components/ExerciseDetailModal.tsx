/**
 * ExerciseDetailModal Component
 * Shows full exercise details with GIF, instructions, and muscle info
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  SlideInDown,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Exercise, BODY_PART_EMOJIS, EQUIPMENT_ICONS, MUSCLE_GROUP_COLORS } from '@/types/exercise';
import { fetchExerciseById } from '@/lib/api/exercises';
import { colors, spacing, typography, shadows } from '@/config/theme';
import { playHaptic } from '@/lib/sounds';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExerciseDetailModalProps {
  exerciseId: string | null;
  visible: boolean;
  onClose: () => void;
}

export default function ExerciseDetailModal({
  exerciseId,
  visible,
  onClose,
}: ExerciseDetailModalProps) {
  const insets = useSafeAreaInsets();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && exerciseId) {
      loadExercise();
    }
  }, [visible, exerciseId]);

  const loadExercise = async () => {
    if (!exerciseId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchExerciseById(exerciseId);
      setExercise(data);
    } catch (err) {
      setError('Failed to load exercise details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    playHaptic('light');
    onClose();
  };

  if (!visible) return null;

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
          entering={SlideInDown.springify().damping(15)}
          style={[styles.container, { paddingBottom: insets.bottom + spacing.md }]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading exercise...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorEmoji}>😔</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadExercise}>
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : exercise ? (
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              {/* GIF */}
              <Animated.View entering={FadeIn.delay(100)}>
                <View style={styles.gifContainer}>
                  {exercise.gifUrl ? (
                    <Image
                      source={{ uri: exercise.gifUrl }}
                      style={styles.gif}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.placeholderGif}>
                      <Text style={styles.placeholderEmoji}>
                        {BODY_PART_EMOJIS[exercise.bodyPart?.toLowerCase() || ''] || '🏋️'}
                      </Text>
                    </View>
                  )}
                </View>
              </Animated.View>

              {/* Title */}
              <Animated.View entering={FadeInUp.delay(150)}>
                <Text style={styles.title}>{exercise.name}</Text>
              </Animated.View>

              {/* Quick Info */}
              <Animated.View entering={FadeInUp.delay(200)} style={styles.quickInfo}>
                {exercise.bodyPart && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoIcon}>
                      {BODY_PART_EMOJIS[exercise.bodyPart.toLowerCase()] || '🏋️'}
                    </Text>
                    <Text style={styles.infoLabel}>Body Part</Text>
                    <Text style={styles.infoValue}>{exercise.bodyPart}</Text>
                  </View>
                )}
                
                {exercise.target && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoIcon}>🎯</Text>
                    <Text style={styles.infoLabel}>Target</Text>
                    <Text style={styles.infoValue}>{exercise.target}</Text>
                  </View>
                )}
                
                {exercise.equipment && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoIcon}>
                      {EQUIPMENT_ICONS[exercise.equipment.toLowerCase()] || '⚙️'}
                    </Text>
                    <Text style={styles.infoLabel}>Equipment</Text>
                    <Text style={styles.infoValue}>{exercise.equipment}</Text>
                  </View>
                )}
              </Animated.View>

              {/* Secondary Muscles */}
              {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                <Animated.View entering={FadeInUp.delay(250)} style={styles.section}>
                  <Text style={styles.sectionTitle}>Secondary Muscles</Text>
                  <View style={styles.muscleChips}>
                    {exercise.secondaryMuscles.map((muscle, index) => (
                      <View 
                        key={index} 
                        style={[
                          styles.muscleChip,
                          { backgroundColor: (MUSCLE_GROUP_COLORS[muscle.toLowerCase()] || colors.primary) + '30' }
                        ]}
                      >
                        <Text style={styles.muscleChipText}>{muscle}</Text>
                      </View>
                    ))}
                  </View>
                </Animated.View>
              )}

              {/* Instructions */}
              {exercise.instructions && exercise.instructions.length > 0 && (
                <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
                  <Text style={styles.sectionTitle}>How to Perform</Text>
                  {exercise.instructions.map((instruction, index) => (
                    <View key={index} style={styles.instructionItem}>
                      <View style={styles.instructionNumber}>
                        <Text style={styles.instructionNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.instructionText}>{instruction}</Text>
                    </View>
                  ))}
                </Animated.View>
              )}

              {/* Tips */}
              {exercise.tips && exercise.tips.length > 0 && (
                <Animated.View entering={FadeInUp.delay(350)} style={styles.section}>
                  <Text style={styles.sectionTitle}>💡 Pro Tips</Text>
                  {exercise.tips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Text style={styles.tipText}>• {tip}</Text>
                    </View>
                  ))}
                </Animated.View>
              )}

              {/* Bottom padding for scroll */}
              <View style={{ height: 40 }} />
            </ScrollView>
          ) : null}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  retryText: {
    ...typography.body,
    color: colors.textInverse,
    fontWeight: '600',
  },
  gifContainer: {
    width: '100%',
    aspectRatio: 1.2,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  gif: {
    width: '100%',
    height: '100%',
  },
  placeholderGif: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 80,
  },
  title: {
    ...typography.title2,
    marginBottom: spacing.md,
    textTransform: 'capitalize',
    color: colors.text,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 24,
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
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'capitalize',
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
  muscleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  muscleChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  muscleChipText: {
    ...typography.caption1,
    fontWeight: '500',
    textTransform: 'capitalize',
    color: colors.text,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  instructionNumberText: {
    ...typography.caption1,
    fontWeight: '700',
    color: colors.textInverse,
  },
  instructionText: {
    ...typography.body,
    flex: 1,
    lineHeight: 22,
    color: colors.text,
  },
  tipItem: {
    marginBottom: spacing.xs,
  },
  tipText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
