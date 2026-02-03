/**
 * Animated Components
 * Reusable animated UI primitives with built-in micro-interactions
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInRight,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  Layout,
  LinearTransition,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SPRING_CONFIGS, TIMING_CONFIGS } from '@/lib/animations';
import { colors, borderRadius, spacing } from '@/config/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================
// Animated Button with Haptics
// ============================================

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
}

export function AnimatedButton({
  onPress,
  children,
  style,
  disabled = false,
  haptic = 'light',
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, SPRING_CONFIGS.snappy);
    opacity.value = withTiming(0.8, TIMING_CONFIGS.fast);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIGS.snappy);
    opacity.value = withTiming(1, TIMING_CONFIGS.fast);
  }, []);

  const handlePress = useCallback(() => {
    if (haptic !== 'none') {
      const intensity = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      }[haptic];
      Haptics.impactAsync(intensity);
    }
    onPress();
  }, [onPress, haptic]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style, disabled && styles.disabled]}
    >
      {children}
    </AnimatedPressable>
  );
}

// ============================================
// Animated Card with Lift Effect
// ============================================

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  delay?: number;
}

export function AnimatedCard({ children, onPress, style, delay = 0 }: AnimatedCardProps) {
  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: interpolate(elevation.value, [0, 1], [0, -4]) },
    ],
    shadowOpacity: interpolate(elevation.value, [0, 1], [0.1, 0.25]),
    shadowRadius: interpolate(elevation.value, [0, 1], [4, 12]),
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, SPRING_CONFIGS.snappy);
    elevation.value = withSpring(1, SPRING_CONFIGS.snappy);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIGS.bouncy);
    elevation.value = withSpring(0, SPRING_CONFIGS.bouncy);
  }, []);

  const content = (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(250)}
      style={[styles.card, animatedStyle, style]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        {content}
      </Pressable>
    );
  }

  return content;
}

// ============================================
// Skeleton Shimmer
// ============================================

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius: br = 8,
  style,
}: SkeletonProps) {
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: br,
          backgroundColor: colors.borderLight,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

// ============================================
// Staggered List Item
// ============================================

interface StaggeredItemProps {
  children: React.ReactNode;
  index: number;
  style?: ViewStyle;
}

export function StaggeredItem({ children, index, style }: StaggeredItemProps) {
  const delay = Math.min(index * 50, 400);
  
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(300)}
      layout={LinearTransition.duration(250)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

// ============================================
// Animated Counter
// ============================================

interface AnimatedCounterProps {
  value: number;
  style?: TextStyle;
  duration?: number;
}

export function AnimatedCounter({ value, style, duration = 500 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  
  React.useEffect(() => {
    const startValue = displayValue;
    const diff = value - startValue;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(startValue + diff * eased);
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);
  
  return <Text style={style}>{displayValue.toLocaleString()}</Text>;
}

// ============================================
// Pull to Refresh Indicator
// ============================================

interface PullIndicatorProps {
  progress: number; // 0 to 1
}

export function PullIndicator({ progress }: PullIndicatorProps) {
  const rotation = useSharedValue(0);
  
  React.useEffect(() => {
    if (progress >= 1) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
    } else {
      rotation.value = progress * 180;
    }
  }, [progress]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    opacity: interpolate(progress, [0, 0.5, 1], [0, 0.5, 1]),
  }));
  
  return (
    <Animated.View style={[styles.pullIndicator, animatedStyle]}>
      <Text style={styles.pullIcon}>↻</Text>
    </Animated.View>
  );
}

// ============================================
// Animated Badge
// ============================================

interface AnimatedBadgeProps {
  count: number;
  color?: string;
}

export function AnimatedBadge({ count, color = colors.primary }: AnimatedBadgeProps) {
  const scale = useSharedValue(0);
  
  React.useEffect(() => {
    if (count > 0) {
      scale.value = withSequence(
        withSpring(1.2, SPRING_CONFIGS.snappy),
        withSpring(1, SPRING_CONFIGS.snappy)
      );
    } else {
      scale.value = withSpring(0, SPRING_CONFIGS.snappy);
    }
  }, [count]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  if (count === 0) return null;
  
  return (
    <Animated.View style={[styles.badge, { backgroundColor: color }, animatedStyle]}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </Animated.View>
  );
}

// ============================================
// Success Checkmark Animation
// ============================================

export function SuccessCheckmark() {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  
  React.useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2, SPRING_CONFIGS.wobbly),
      withSpring(1, SPRING_CONFIGS.snappy)
    );
    opacity.value = withTiming(1, TIMING_CONFIGS.fast);
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  return (
    <Animated.View style={[styles.checkmark, animatedStyle]}>
      <Text style={styles.checkmarkIcon}>✓</Text>
    </Animated.View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pullIndicator: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pullIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkmark: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default {
  AnimatedButton,
  AnimatedCard,
  Skeleton,
  StaggeredItem,
  AnimatedCounter,
  PullIndicator,
  AnimatedBadge,
  SuccessCheckmark,
};
