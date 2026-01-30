/**
 * Smart Weight Input Component
 * Weight input with AI-powered suggestions from periodization engine
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';

import { PlateKeyboard } from '@/components/PlateKeyboard';
import { 
  calculateWeightSuggestion, 
  type SetPerformance, 
  type WeightSuggestion 
} from '@/lib/periodization';
import { colors, typography, spacing, borderRadius } from '@/config/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SmartWeightInputProps {
  value: number | undefined;
  onChange: (weight: number) => void;
  exerciseName: string;
  previousSet?: SetPerformance;
  targetReps?: number;
  unit?: 'lbs' | 'kg';
  placeholder?: string;
}

export function SmartWeightInput({
  value,
  onChange,
  exerciseName,
  previousSet,
  targetReps = 8,
  unit = 'lbs',
  placeholder = 'Weight',
}: SmartWeightInputProps) {
  const [showPlateKeyboard, setShowPlateKeyboard] = useState(false);
  const [suggestion, setSuggestion] = useState<WeightSuggestion | null>(null);
  const suggestionScale = useSharedValue(1);

  // Calculate suggestion when previous set changes
  useEffect(() => {
    if (previousSet && previousSet.weight > 0) {
      const newSuggestion = calculateWeightSuggestion(
        previousSet,
        targetReps,
        exerciseName
      );
      setSuggestion(newSuggestion);
    } else {
      setSuggestion(null);
    }
  }, [previousSet, targetReps, exerciseName]);

  const handleAcceptSuggestion = useCallback(() => {
    if (suggestion) {
      suggestionScale.value = withSpring(0.9, {}, () => {
        suggestionScale.value = withSpring(1);
      });
      onChange(suggestion.suggestedWeight);
    }
  }, [suggestion, onChange]);

  const handleTextChange = useCallback((text: string) => {
    const num = parseFloat(text);
    if (!isNaN(num)) {
      onChange(num);
    } else if (text === '') {
      onChange(0);
    }
  }, [onChange]);

  const handlePlateConfirm = useCallback((weight: number) => {
    onChange(weight);
  }, [onChange]);

  const suggestionAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: suggestionScale.value }],
  }));

  const getSuggestionColor = () => {
    if (!suggestion) return colors.textSecondary;
    switch (suggestion.changeType) {
      case 'increase': return colors.success;
      case 'deload': return colors.warning;
      default: return colors.primary;
    }
  };

  const getSuggestionIcon = () => {
    if (!suggestion) return '';
    switch (suggestion.changeType) {
      case 'increase': return '↑';
      case 'deload': return '↓';
      default: return '→';
    }
  };

  return (
    <View style={styles.container}>
      {/* Weight Input Row */}
      <View style={styles.inputRow}>
        <Pressable
          onPress={() => setShowPlateKeyboard(true)}
          style={styles.plateButton}
        >
          <Text style={styles.plateIcon}>🏋️</Text>
        </Pressable>

        <TextInput
          style={styles.input}
          value={value ? String(value) : ''}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          selectTextOnFocus
        />

        <Text style={styles.unit}>{unit}</Text>
      </View>

      {/* Suggestion Pill */}
      {suggestion && (
        <Animated.View entering={FadeIn} style={styles.suggestionContainer}>
          <AnimatedPressable
            onPress={handleAcceptSuggestion}
            style={[styles.suggestionPill, suggestionAnimatedStyle]}
          >
            <Text style={[styles.suggestionIcon, { color: getSuggestionColor() }]}>
              {getSuggestionIcon()}
            </Text>
            <Text style={styles.suggestionText}>
              Suggested: {suggestion.suggestedWeight} {unit}
            </Text>
            {suggestion.change !== 0 && (
              <Text style={[styles.changeText, { color: getSuggestionColor() }]}>
                ({suggestion.change > 0 ? '+' : ''}{suggestion.change})
              </Text>
            )}
          </AnimatedPressable>
          
          <Text style={styles.reasonText}>{suggestion.reason}</Text>
        </Animated.View>
      )}

      {/* Plate Keyboard Modal */}
      <PlateKeyboard
        visible={showPlateKeyboard}
        onClose={() => setShowPlateKeyboard(false)}
        onConfirm={handlePlateConfirm}
        initialWeight={value || 45}
        unit={unit}
      />
    </View>
  );
}

// RPE Selector Component
interface RPESelectorProps {
  value: number | undefined;
  onChange: (rpe: number) => void;
}

export function RPESelector({ value, onChange }: RPESelectorProps) {
  const rpeOptions = [6, 7, 8, 9, 10];
  
  const getLabel = (rpe: number) => {
    switch (rpe) {
      case 6: return 'Easy';
      case 7: return 'Moderate';
      case 8: return 'Hard';
      case 9: return 'Very Hard';
      case 10: return 'Max';
      default: return '';
    }
  };

  return (
    <View style={styles.rpeContainer}>
      <Text style={styles.rpeLabel}>RPE (Rate of Perceived Exertion)</Text>
      <View style={styles.rpeRow}>
        {rpeOptions.map((rpe) => (
          <Pressable
            key={rpe}
            onPress={() => onChange(rpe)}
            style={[
              styles.rpeButton,
              value === rpe && styles.rpeButtonSelected,
            ]}
          >
            <Text style={[
              styles.rpeNumber,
              value === rpe && styles.rpeNumberSelected,
            ]}>
              {rpe}
            </Text>
            <Text style={[
              styles.rpeDescription,
              value === rpe && styles.rpeDescriptionSelected,
            ]}>
              {getLabel(rpe)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  plateButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  plateIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    ...typography.title3,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  unit: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  suggestionContainer: {
    marginTop: spacing.sm,
  },
  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  suggestionIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  suggestionText: {
    ...typography.footnote,
    color: colors.text,
    fontWeight: '600',
  },
  changeText: {
    ...typography.footnote,
    fontWeight: '700',
  },
  reasonText: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  // RPE Selector
  rpeContainer: {
    marginVertical: spacing.md,
  },
  rpeLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  rpeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rpeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rpeButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  rpeNumber: {
    ...typography.headline,
    color: colors.textSecondary,
  },
  rpeNumberSelected: {
    color: colors.primary,
  },
  rpeDescription: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
  rpeDescriptionSelected: {
    color: colors.primary,
  },
});

export default SmartWeightInput;
