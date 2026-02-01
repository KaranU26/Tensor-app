/**
 * Animation Presets
 * Reusable animation configurations for consistent motion design
 */

import {
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';

// ============================================
// Spring Configs
// ============================================

export const SPRING_CONFIGS = {
  // Snappy - for buttons, toggles
  snappy: {
    damping: 15,
    stiffness: 400,
    mass: 0.8,
  } as WithSpringConfig,
  
  // Bouncy - for modals, cards
  bouncy: {
    damping: 12,
    stiffness: 180,
    mass: 1,
  } as WithSpringConfig,
  
  // Gentle - for page transitions
  gentle: {
    damping: 20,
    stiffness: 120,
    mass: 1,
  } as WithSpringConfig,
  
  // Stiff - for precise movements
  stiff: {
    damping: 20,
    stiffness: 300,
    mass: 0.5,
  } as WithSpringConfig,
  
  // Wobbly - for fun interactions
  wobbly: {
    damping: 8,
    stiffness: 150,
    mass: 1,
  } as WithSpringConfig,
};

// ============================================
// Timing Configs
// ============================================

export const TIMING_CONFIGS = {
  fast: {
    duration: 150,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } as WithTimingConfig,
  
  normal: {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } as WithTimingConfig,
  
  slow: {
    duration: 500,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } as WithTimingConfig,
  
  // iOS-style ease
  easeOut: {
    duration: 350,
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  } as WithTimingConfig,
  
  // Overshoot effect
  overshoot: {
    duration: 400,
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  } as WithTimingConfig,
};

// ============================================
// Animation Helpers
// ============================================

/**
 * Create a press animation (scale down then up)
 */
export function createPressAnimation(scale: { value: number }) {
  return {
    onPressIn: () => {
      scale.value = withSpring(0.95, SPRING_CONFIGS.snappy);
    },
    onPressOut: () => {
      scale.value = withSpring(1, SPRING_CONFIGS.snappy);
    },
  };
}

/**
 * Create a staggered delay for list items
 */
export function staggerDelay(index: number, baseDelay = 50, maxDelay = 400): number {
  return Math.min(index * baseDelay, maxDelay);
}

/**
 * Animate value with spring
 */
export function springTo(value: number, config = SPRING_CONFIGS.bouncy) {
  return withSpring(value, config);
}

/**
 * Animate with timing
 */
export function timingTo(value: number, config = TIMING_CONFIGS.normal) {
  return withTiming(value, config);
}

/**
 * Create a pulse animation
 */
export function pulse(scale: { value: number }, intensity = 1.1) {
  scale.value = withSequence(
    withSpring(intensity, SPRING_CONFIGS.snappy),
    withSpring(1, SPRING_CONFIGS.snappy)
  );
}

/**
 * Create a shake animation
 */
export function shake(translateX: { value: number }, intensity = 10) {
  translateX.value = withSequence(
    withTiming(intensity, { duration: 50 }),
    withTiming(-intensity, { duration: 50 }),
    withTiming(intensity / 2, { duration: 50 }),
    withTiming(-intensity / 2, { duration: 50 }),
    withTiming(0, { duration: 50 })
  );
}

// ============================================
// Enter/Exit Animations
// ============================================

export const ENTER_ANIMATIONS = {
  fadeIn: {
    initialValues: { opacity: 0 },
    animations: { opacity: 1 },
  },
  
  fadeInUp: {
    initialValues: { opacity: 0, transform: [{ translateY: 20 }] },
    animations: { opacity: 1, transform: [{ translateY: 0 }] },
  },
  
  fadeInDown: {
    initialValues: { opacity: 0, transform: [{ translateY: -20 }] },
    animations: { opacity: 1, transform: [{ translateY: 0 }] },
  },
  
  scaleIn: {
    initialValues: { opacity: 0, transform: [{ scale: 0.9 }] },
    animations: { opacity: 1, transform: [{ scale: 1 }] },
  },
  
  slideInRight: {
    initialValues: { opacity: 0, transform: [{ translateX: 50 }] },
    animations: { opacity: 1, transform: [{ translateX: 0 }] },
  },
  
  slideInLeft: {
    initialValues: { opacity: 0, transform: [{ translateX: -50 }] },
    animations: { opacity: 1, transform: [{ translateX: 0 }] },
  },
};

export default {
  SPRING_CONFIGS,
  TIMING_CONFIGS,
  createPressAnimation,
  staggerDelay,
  springTo,
  timingTo,
  pulse,
  shake,
  ENTER_ANIMATIONS,
};
