/**
 * Glass Card Component
 * Liquid Glass aesthetic with blur and translucency
 * 
 * From research: "Translucency to create layering... preservation of context"
 */

import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Pressable } from 'react-native';
import { playHaptic } from '@/lib/sounds';
import { colors, spacing, borderRadius, shadows } from '@/config/theme';

interface GlassCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  intensity?: number; // Blur intensity 0-100
  tint?: 'light' | 'dark' | 'default';
  style?: ViewStyle;
  animated?: boolean;
  delay?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GlassCard({
  children,
  onPress,
  intensity = 60,
  tint = 'dark',
  style,
  animated = true,
  delay = 0,
}: GlassCardProps) {
  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: interpolate(elevation.value, [0, 1], [0, -2]) },
    ],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
      elevation.value = withSpring(1, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      elevation.value = withSpring(0, { damping: 12, stiffness: 200 });
    }
  };

  const handlePress = () => {
    if (onPress) {
      playHaptic('light');
      onPress();
    }
  };

  // Use BlurView on iOS, fallback to semi-transparent on Android
  const renderBackground = () => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView
          intensity={intensity}
          tint={tint}
          style={StyleSheet.absoluteFill}
        />
      );
    }
    
    // Android fallback - semi-transparent background
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: tint === 'dark' 
              ? 'rgba(20, 20, 26, 0.85)' 
              : 'rgba(255, 255, 255, 0.85)',
          },
        ]}
      />
    );
  };

  const content = (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {renderBackground()}
      <View style={styles.content}>
        {children}
      </View>
      {/* Subtle border gradient */}
      <View style={styles.borderOverlay} />
    </Animated.View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}

/**
 * Glass Modal Background
 * Use behind modals for premium blur effect
 */
interface GlassBackdropProps {
  intensity?: number;
  onPress?: () => void;
}

export function GlassBackdrop({ intensity = 20, onPress }: GlassBackdropProps) {
  if (Platform.OS === 'ios') {
    return (
      <Pressable style={StyleSheet.absoluteFill} onPress={onPress}>
        <BlurView
          intensity={intensity}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[StyleSheet.absoluteFill, styles.androidBackdrop]}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#7B3FA1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  content: {
    padding: spacing.lg,
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(123, 63, 161, 0.2)',
    pointerEvents: 'none',
  },
  androidBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});

export default GlassCard;
