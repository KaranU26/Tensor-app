/**
 * Empty State Component
 * Premium empty states with animation
 */

import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { PremiumButton } from './PremiumButton';
import { getEmptyStateMessage, EmptyStateType } from '@/lib/errorMessages';
import { colors, spacing, typography, gradients } from '@/config/theme';

interface EmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
  customTitle?: string;
  customMessage?: string;
  customEmoji?: string;
  customActionLabel?: string;
  style?: ViewStyle;
}

export function EmptyState({
  type,
  onAction,
  customTitle,
  customMessage,
  customEmoji,
  customActionLabel,
  style,
}: EmptyStateProps) {
  const emptyState = getEmptyStateMessage(type);
  
  const title = customTitle || emptyState.title;
  const message = customMessage || emptyState.message;
  const emoji = customEmoji || emptyState.emoji;
  const action = customActionLabel || emptyState.action;

  // Floating animation for emoji
  const float = useSharedValue(0);
  
  React.useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1, // infinite
      true
    );
  }, []);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        entering={FadeIn.delay(100).duration(250)}
        style={[styles.emojiContainer, emojiStyle]}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emojiRing}
        >
          <View style={styles.emojiInner}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
      
      <Animated.Text
        entering={FadeInUp.delay(200).duration(250)}
        style={styles.title}
      >
        {title}
      </Animated.Text>
      
      <Animated.Text
        entering={FadeInUp.delay(300).duration(250)}
        style={styles.message}
      >
        {message}
      </Animated.Text>
      
      {action && onAction && (
        <Animated.View entering={FadeInUp.delay(400).duration(250)}>
          <PremiumButton
            title={action}
            onPress={onAction}
            style={styles.button}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emojiContainer: {
    marginBottom: spacing.lg,
  },
  emojiRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  emojiInner: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 44,
  },
  title: {
    ...typography.title2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  button: {
    marginTop: spacing.xl,
  },
});

export default EmptyState;
