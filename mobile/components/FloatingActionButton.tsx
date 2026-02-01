/**
 * Floating Action Button
 * Premium FAB with expand/collapse animation
 */

import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows } from '@/config/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FABAction {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  icon?: string;
  actions?: FABAction[];
  onPress?: () => void;
  position?: 'bottomRight' | 'bottomCenter';
}

export function FloatingActionButton({
  icon = '+',
  actions = [],
  onPress,
  position = 'bottomRight',
}: FloatingActionButtonProps) {
  const [expanded, setExpanded] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const expandProgress = useSharedValue(0);

  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (actions.length > 0) {
      setExpanded(!expanded);
      rotation.value = withSpring(expanded ? 0 : 45, { damping: 12 });
      expandProgress.value = withSpring(expanded ? 0 : 1, { damping: 15 });
    } else if (onPress) {
      onPress();
    }
  }, [expanded, actions.length, onPress]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, []);

  const handleActionPress = useCallback((action: FABAction) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpanded(false);
    rotation.value = withSpring(0, { damping: 12 });
    expandProgress.value = withSpring(0, { damping: 15 });
    action.onPress();
  }, []);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: expandProgress.value * 0.5,
    pointerEvents: expandProgress.value > 0.5 ? 'auto' : 'none',
  }));

  const positionStyle =
    position === 'bottomCenter'
      ? styles.positionCenter
      : styles.positionRight;

  return (
    <>
      {/* Backdrop */}
      {actions.length > 0 && (
        <Animated.View
          style={[styles.backdrop, backdropStyle]}
          pointerEvents="box-none"
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              setExpanded(false);
              rotation.value = withSpring(0, { damping: 12 });
              expandProgress.value = withSpring(0, { damping: 15 });
            }}
          />
        </Animated.View>
      )}

      {/* Actions */}
      <View style={[styles.container, positionStyle]}>
        {actions.map((action, index) => (
          <FABActionItem
            key={index}
            action={action}
            index={index}
            totalActions={actions.length}
            expandProgress={expandProgress}
            onPress={() => handleActionPress(action)}
          />
        ))}

        {/* Main FAB */}
        <AnimatedPressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[fabStyle]}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.fab}
          >
            <Text style={styles.fabIcon}>{icon}</Text>
          </LinearGradient>
        </AnimatedPressable>
      </View>
    </>
  );
}

interface FABActionItemProps {
  action: FABAction;
  index: number;
  totalActions: number;
  expandProgress: { value: number };
  onPress: () => void;
}

function FABActionItem({
  action,
  index,
  totalActions,
  expandProgress,
  onPress,
}: FABActionItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    const reverseIndex = totalActions - index;
    const translateY = interpolate(
      expandProgress.value,
      [0, 1],
      [0, -70 * reverseIndex],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      expandProgress.value,
      [0, 0.5, 1],
      [0, 0, 1],
      Extrapolation.CLAMP
    );
    const itemScale = interpolate(
      expandProgress.value,
      [0, 1],
      [0.5, 1],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateY },
        { scale: itemScale * scale.value },
      ],
      opacity,
    };
  });

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, []);

  return (
    <AnimatedPressable
      style={[styles.actionItem, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles.labelContainer}>
        <Text style={styles.actionLabel}>{action.label}</Text>
      </View>
      <View
        style={[
          styles.actionButton,
          action.color ? { backgroundColor: action.color } : {},
        ]}
      >
        <Text style={styles.actionIcon}>{action.icon}</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 998,
  },
  container: {
    position: 'absolute',
    bottom: 100,
    zIndex: 999,
    alignItems: 'center',
  },
  positionRight: {
    right: spacing.lg,
  },
  positionCenter: {
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  actionItem: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: 0,
  },
  labelContainer: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    ...shadows.sm,
  },
  actionLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  actionIcon: {
    fontSize: 20,
  },
});

export default FloatingActionButton;
