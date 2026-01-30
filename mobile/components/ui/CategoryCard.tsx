import React from 'react';
import { View, Text, ImageBackground, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '@/config/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const CARD_WIDTH = (Dimensions.get('window').width - spacing.lg * 3) / 2;

interface CategoryCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  emoji?: string;
  onPress: () => void;
}

export function CategoryCard({
  title,
  subtitle,
  imageUrl,
  emoji = '🏃',
  onPress,
}: CategoryCardProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const content = (
    <View style={styles.overlay}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      {imageUrl ? (
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.imageBackground}
          imageStyle={styles.image}
        >
          {content}
        </ImageBackground>
      ) : (
        <View style={styles.placeholderBackground}>
          <Text style={styles.emoji}>{emoji}</Text>
          {content}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 140,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  imageBackground: {
    flex: 1,
  },
  image: {
    borderRadius: borderRadius.lg,
  },
  placeholderBackground: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  title: {
    ...typography.title3,
    color: colors.textInverse,
    fontStyle: 'italic',
  },
  subtitle: {
    ...typography.caption1,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
});

export default CategoryCard;
