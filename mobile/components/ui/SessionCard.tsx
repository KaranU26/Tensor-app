import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '@/config/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SessionCardProps {
  title: string;
  subtitle?: string;
  dayNumber?: number;
  duration: number;
  calories?: number;
  imageUrl?: string;
  onPress: () => void;
  onPlayPress?: () => void;
}

export function SessionCard({
  title,
  subtitle,
  dayNumber,
  duration,
  calories,
  imageUrl,
  onPress,
  onPlayPress,
}: SessionCardProps) {
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

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.content}>
        <View style={styles.textContent}>
          {dayNumber ? (
            <View style={styles.dayBadge}>
              <Text style={styles.dayBadgeText}>Day {dayNumber}</Text>
            </View>
          ) : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏱</Text>
              <Text style={styles.metaText}>{duration} Min</Text>
            </View>
            {calories ? (
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>⚡</Text>
                <Text style={styles.metaText}>{calories} Kcal</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderEmoji}>🏋️</Text>
            </View>
          )}
          {onPlayPress && (
            <Pressable onPress={onPlayPress} style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </Pressable>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    ...shadows.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    padding: spacing.lg,
  },
  textContent: {
    flex: 1,
    paddingRight: spacing.md,
  },
  dayBadge: {
    backgroundColor: colors.text,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  dayBadgeText: {
    ...typography.caption1,
    color: colors.textInverse,
    fontWeight: '600',
  },
  title: {
    ...typography.title2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  imageContainer: {
    width: 120,
    height: 100,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 32,
  },
  playButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: colors.textInverse,
    fontSize: 12,
    marginLeft: 2,
  },
});

export default SessionCard;
