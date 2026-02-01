/**
 * Success Celebration Component
 * Animated celebration overlay for achievements, PRs, workout completion
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { playRichHaptic } from '@/lib/sounds';
import { colors, spacing, typography, gradients } from '@/config/theme';

const { width, height } = Dimensions.get('window');

interface SuccessCelebrationProps {
  visible: boolean;
  onComplete: () => void;
  title?: string;
  subtitle?: string;
  emoji?: string;
  type?: 'success' | 'pr' | 'streak' | 'complete';
}

export function SuccessCelebration({
  visible,
  onComplete,
  title = "Amazing!",
  subtitle = "You did it!",
  emoji = "🎉",
  type = 'success',
}: SuccessCelebrationProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);
  const emojiRotate = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Trigger haptic
      playRichHaptic(type === 'pr' ? 'celebration' : 'success_burst');

      // Animate in
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      
      // Emoji bounce
      emojiScale.value = withSequence(
        withDelay(200, withSpring(1.3, { damping: 8 })),
        withSpring(1, { damping: 10 })
      );
      
      // Emoji wiggle
      emojiRotate.value = withSequence(
        withDelay(400, withTiming(-15, { duration: 100, easing: Easing.ease })),
        withTiming(15, { duration: 100, easing: Easing.ease }),
        withTiming(-10, { duration: 100, easing: Easing.ease }),
        withTiming(10, { duration: 100, easing: Easing.ease }),
        withTiming(0, { duration: 100, easing: Easing.ease })
      );

      // Auto-dismiss
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 });
        scale.value = withTiming(0.8, { duration: 300 });
        setTimeout(() => {
          runOnJS(onComplete)();
        }, 300);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.6,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: emojiScale.value },
      { rotate: `${emojiRotate.value}deg` },
    ],
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} statusBarTranslucent>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
        
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Confetti particles */}
          <ConfettiParticles />
          
          <Animated.Text style={[styles.emoji, emojiStyle]}>
            {emoji}
          </Animated.Text>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * Simple confetti effect
 */
function ConfettiParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    color: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FF8E53', '#7C4DFF'][i % 5],
    delay: i * 50,
    x: (Math.random() - 0.5) * 200,
    rotation: Math.random() * 360,
  }));

  return (
    <View style={styles.confettiContainer}>
      {particles.map((particle) => (
        <ConfettiPiece key={particle.id} {...particle} />
      ))}
    </View>
  );
}

interface ConfettiPieceProps {
  color: string;
  delay: number;
  x: number;
  rotation: number;
}

function ConfettiPiece({ color, delay, x, rotation }: ConfettiPieceProps) {
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(150, { duration: 800, easing: Easing.out(Easing.quad) }),
        withTiming(250, { duration: 600, easing: Easing.in(Easing.quad) })
      )
    );
    rotate.value = withDelay(
      delay,
      withTiming(rotation + 180, { duration: 1400 })
    );
    
    // Fade out
    setTimeout(() => {
      opacity.value = withTiming(0, { duration: 400 });
    }, 1000 + delay);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        { backgroundColor: color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 32,
    padding: spacing.xxl,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 10,
    height: 10,
  },
  confettiPiece: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});

export default SuccessCelebration;
