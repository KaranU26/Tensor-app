/**
 * Swipeable Card
 * Gesture-based card with swipe actions (delete, edit, etc.)
 */

import React, { useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows } from '@/config/theme';

interface SwipeAction {
  icon: string;
  color: string;
  onPress: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  onPress?: () => void;
  style?: ViewStyle;
}

const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 80;

export function SwipeableCard({
  children,
  leftAction,
  rightAction,
  onPress,
  style,
}: SwipeableCardProps) {
  const translateX = useSharedValue(0);
  const pressed = useSharedValue(false);
  const hasTriggeredHaptic = useSharedValue(false);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const resetHaptic = useCallback(() => {
    hasTriggeredHaptic.value = false;
  }, []);

  const handleLeftAction = useCallback(() => {
    if (leftAction) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      leftAction.onPress();
    }
  }, [leftAction]);

  const handleRightAction = useCallback(() => {
    if (rightAction) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      rightAction.onPress();
    }
  }, [rightAction]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Limit swipe based on available actions
      const maxLeft = leftAction ? ACTION_WIDTH : 0;
      const maxRight = rightAction ? -ACTION_WIDTH : 0;
      
      translateX.value = Math.max(maxRight, Math.min(maxLeft, e.translationX));
      
      // Trigger haptic at threshold
      if (Math.abs(translateX.value) >= SWIPE_THRESHOLD && !hasTriggeredHaptic.value) {
        hasTriggeredHaptic.value = true;
        runOnJS(triggerHaptic)();
      } else if (Math.abs(translateX.value) < SWIPE_THRESHOLD && hasTriggeredHaptic.value) {
        runOnJS(resetHaptic)();
      }
    })
    .onEnd(() => {
      // Check if swipe exceeded threshold
      if (translateX.value >= SWIPE_THRESHOLD && leftAction) {
        runOnJS(handleLeftAction)();
        translateX.value = withTiming(0, { duration: 300 });
      } else if (translateX.value <= -SWIPE_THRESHOLD && rightAction) {
        runOnJS(handleRightAction)();
        translateX.value = withTiming(0, { duration: 300 });
      } else {
        translateX.value = withSpring(0, { damping: 15 });
      }
      runOnJS(resetHaptic)();
    });

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      pressed.value = true;
    })
    .onEnd(() => {
      pressed.value = false;
      if (onPress) {
        runOnJS(onPress)();
      }
    })
    .onFinalize(() => {
      pressed.value = false;
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: pressed.value ? 0.98 : 1 },
    ],
  }));

  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [0, SWIPE_THRESHOLD],
          [0.8, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, -SWIPE_THRESHOLD / 2, -SWIPE_THRESHOLD],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [0, -SWIPE_THRESHOLD],
          [0.8, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <View style={[styles.container, style]}>
      {/* Left Action (shown when swiping right) */}
      {leftAction && (
        <Animated.View
          style={[
            styles.actionContainer,
            styles.leftAction,
            { backgroundColor: leftAction.color },
            leftActionStyle,
          ]}
        >
          <Text style={styles.actionIcon}>{leftAction.icon}</Text>
        </Animated.View>
      )}

      {/* Right Action (shown when swiping left) */}
      {rightAction && (
        <Animated.View
          style={[
            styles.actionContainer,
            styles.rightAction,
            { backgroundColor: rightAction.color },
            rightActionStyle,
          ]}
        >
          <Text style={styles.actionIcon}>{rightAction.icon}</Text>
        </Animated.View>
      )}

      {/* Card Content */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    overflow: 'visible',
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  leftAction: {
    left: 0,
  },
  rightAction: {
    right: 0,
  },
  actionIcon: {
    fontSize: 24,
  },
});

export default SwipeableCard;
