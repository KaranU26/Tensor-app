/**
 * Custom Animated Tab Bar
 * Premium tab bar with scale animations and haptic feedback
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, gradients } from '@/config/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TabItemProps {
  label: string;
  icon: React.ReactNode;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function TabItem({ label, icon, isFocused, onPress, onLongPress }: TabItemProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: isFocused ? 1 : 0,
    transform: [{ scaleX: isFocused ? 1 : 0 }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    translateY.value = withSpring(2, { damping: 15, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    translateY.value = withSpring(0, { damping: 12, stiffness: 200 });
  }, []);

  const handlePress = useCallback(() => {
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [onPress]);

  return (
    <AnimatedPressable
      style={[styles.tabItem, animatedStyle]}
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {/* Active indicator */}
      <Animated.View style={[styles.activeIndicator, indicatorStyle]} />
      
      {/* Icon */}
      <View style={styles.iconContainer}>
        {icon}
      </View>
      
      {/* Label */}
      <Text
        style={[
          styles.label,
          { color: isFocused ? colors.primary : colors.textTertiary },
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

export function AnimatedTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.sm,
        },
      ]}
    >
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentLine}
      />
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? String(options.tabBarLabel)
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Get the icon
          const icon = options.tabBarIcon
            ? options.tabBarIcon({
                focused: isFocused,
                color: isFocused ? colors.primary : colors.textTertiary,
                size: 22,
              })
            : null;

          return (
            <TabItem
              key={route.key}
              label={label}
              icon={icon}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#7B3FA1',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  accentLine: {
    height: 2,
    width: '100%',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  activeIndicator: {
    position: 'absolute',
    top: -spacing.sm,
    width: 32,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.primary,
  },
  iconContainer: {
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default AnimatedTabBar;
