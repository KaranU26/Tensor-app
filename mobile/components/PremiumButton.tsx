/**
 * Premium Button Component
 * Gradient button with press animation and haptic feedback
 */

import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, borderRadius, spacing, gradients, shadows } from '@/config/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 400,
  mass: 0.8,
};

export function PremiumButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}: PremiumButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, SPRING_CONFIG);
    opacity.value = withTiming(0.9, { duration: 100 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
    opacity.value = withTiming(1, { duration: 100 });
  }, []);

  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onPress();
    }
  }, [onPress, disabled, loading]);

  const sizeStyles = SIZE_STYLES[size];
  const variantStyles = VARIANT_STYLES[variant];

  const renderContent = () => (
    <View style={[styles.content, { flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row' }]}>
      {loading ? (
        <Text style={[styles.loadingText, variantStyles.text]}>...</Text>
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, sizeStyles.text, variantStyles.text, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </View>
  );

  // Primary button uses gradient
  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          animatedStyle,
          fullWidth && styles.fullWidth,
          (disabled || loading) && styles.disabled,
          styles.glow,
          style,
        ]}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.button, sizeStyles.button]}
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        sizeStyles.button,
        variantStyles.button,
        animatedStyle,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {renderContent()}
    </AnimatedPressable>
  );
}

const SIZE_STYLES = {
  sm: {
    button: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: borderRadius.md,
    },
    text: {
      fontSize: 14,
    },
  },
  md: {
    button: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: borderRadius.lg,
    },
    text: {
      fontSize: 16,
    },
  },
  lg: {
    button: {
      paddingVertical: 18,
      paddingHorizontal: 32,
      borderRadius: borderRadius.lg,
    },
    text: {
      fontSize: 18,
    },
  },
};

const VARIANT_STYLES = {
  primary: {
    button: {},
    text: {
      color: '#FFFFFF',
    },
  },
  secondary: {
    button: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    text: {
      color: colors.text,
    },
  },
  outline: {
    button: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.accent,
    },
    text: {
      color: colors.accent,
    },
  },
  ghost: {
    button: {
      backgroundColor: 'transparent',
    },
    text: {
      color: colors.accent,
    },
  },
  danger: {
    button: {
      backgroundColor: colors.error,
    },
    text: {
      color: '#FFFFFF',
    },
  },
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    ...typography.headline,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
  },
  iconContainer: {
    marginHorizontal: 4,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  glow: {
    ...shadows.glow,
  },
});

export default PremiumButton;
