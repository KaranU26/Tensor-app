/**
 * Equipment Picker Component
 * Multi-select visual picker for gym equipment
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/config/theme';
import type { Equipment } from '@/lib/routineGenerator';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface EquipmentOption {
  id: Equipment;
  label: string;
  emoji: string;
  description: string;
}

const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  { id: 'barbell', label: 'Barbell', emoji: '🏋️', description: 'Squat rack, bench' },
  { id: 'dumbbells', label: 'Dumbbells', emoji: '💪', description: 'Free weights' },
  { id: 'machines', label: 'Machines', emoji: '🎰', description: 'Cable stack, leg press' },
  { id: 'cables', label: 'Cables', emoji: '🔗', description: 'Cable crossover' },
  { id: 'bodyweight', label: 'Bodyweight', emoji: '🧘', description: 'No equipment' },
];

interface EquipmentPickerProps {
  selected: Equipment[];
  onSelectionChange: (equipment: Equipment[]) => void;
}

function EquipmentCard({
  option,
  isSelected,
  onToggle,
}: {
  option: EquipmentOption;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedPressable
      onPress={onToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        animatedStyle,
      ]}
    >
      <Text style={styles.emoji}>{option.emoji}</Text>
      <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {option.label}
      </Text>
      <Text style={styles.description}>{option.description}</Text>
      {isSelected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

export function EquipmentPicker({ selected, onSelectionChange }: EquipmentPickerProps) {
  const toggleEquipment = (equipment: Equipment) => {
    if (selected.includes(equipment)) {
      onSelectionChange(selected.filter((e) => e !== equipment));
    } else {
      onSelectionChange([...selected, equipment]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What equipment do you have?</Text>
      <Text style={styles.subtitle}>Select all that apply</Text>
      
      <View style={styles.grid}>
        {EQUIPMENT_OPTIONS.map((option) => (
          <EquipmentCard
            key={option.id}
            option={option}
            isSelected={selected.includes(option.id)}
            onToggle={() => toggleEquipment(option.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  title: {
    ...typography.title2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  card: {
    width: '45%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}12`,
  },
  emoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  labelSelected: {
    color: colors.primary,
  },
  description: {
    ...typography.caption1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default EquipmentPicker;
