/**
 * Plate Keyboard Component
 * Visual plate selector for gym weight input
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { usePlateCalculator, type Unit, type PlateConfig } from '@/hooks/usePlateCalculator';
import { colors, typography, spacing, borderRadius, shadows } from '@/config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PlateKeyboardProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (weight: number) => void;
  initialWeight?: number;
  unit?: Unit;
}

interface PlateButtonProps {
  plate: PlateConfig;
  onPress: () => void;
  onLongPress: () => void;
}

function PlateButton({ plate, onPress, onLongPress }: PlateButtonProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, []);

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.plateButton, animatedStyle]}
    >
      <View style={[styles.plateCircle, { backgroundColor: plate.color }]}>
        <Text style={styles.plateWeight}>{plate.weight}</Text>
      </View>
      {plate.count > 0 && (
        <View style={styles.plateBadge}>
          <Text style={styles.plateBadgeText}>{plate.count}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

export function PlateKeyboard({
  visible,
  onClose,
  onConfirm,
  initialWeight = 45,
  unit: initialUnit = 'lbs',
}: PlateKeyboardProps) {
  const {
    plates,
    barWeight,
    totalWeight,
    plateWeightPerSide,
    unit,
    addPlate,
    removePlate,
    setBarWeight,
    setUnit,
    clear,
    getPlateBreakdown,
  } = usePlateCalculator({ unit: initialUnit, barWeight: initialUnit === 'kg' ? 20 : 45 });

  // Set initial weight on open
  React.useEffect(() => {
    if (visible && initialWeight > barWeight) {
      // Could auto-calculate plates here if needed
    }
  }, [visible, initialWeight]);

  const handleConfirm = useCallback(() => {
    onConfirm(totalWeight);
    onClose();
  }, [totalWeight, onConfirm, onClose]);

  const toggleUnit = useCallback(() => {
    setUnit(unit === 'lbs' ? 'kg' : 'lbs');
  }, [unit, setUnit]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.keyboard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Plate Calculator</Text>
            <Pressable onPress={toggleUnit} style={styles.unitToggle}>
              <Text style={styles.unitText}>{unit.toUpperCase()}</Text>
            </Pressable>
          </View>

          {/* Total Display */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Weight</Text>
            <Text style={styles.totalValue}>
              {totalWeight} <Text style={styles.totalUnit}>{unit}</Text>
            </Text>
            <Text style={styles.breakdown}>
              Bar ({barWeight}) + {plateWeightPerSide}×2 per side
            </Text>
          </View>

          {/* Plate Grid */}
          <View style={styles.plateGrid}>
            {plates.map((plate) => (
              <PlateButton
                key={plate.weight}
                plate={plate}
                onPress={() => addPlate(plate.weight)}
                onLongPress={() => removePlate(plate.weight)}
              />
            ))}
          </View>

          {/* Breakdown */}
          <View style={styles.breakdownSection}>
            <Text style={styles.breakdownLabel}>Per side:</Text>
            <Text style={styles.breakdownText}>{getPlateBreakdown()}</Text>
          </View>

          {/* Bar Weight Selector */}
          <View style={styles.barSection}>
            <Text style={styles.barLabel}>Bar:</Text>
            <View style={styles.barOptions}>
              {(unit === 'lbs' ? [45, 35, 25, 15] : [20, 15, 10]).map((w) => (
                <Pressable
                  key={w}
                  style={[
                    styles.barOption,
                    barWeight === w && styles.barOptionActive,
                  ]}
                  onPress={() => setBarWeight(w)}
                >
                  <Text
                    style={[
                      styles.barOptionText,
                      barWeight === w && styles.barOptionTextActive,
                    ]}
                  >
                    {w}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={styles.clearButton} onPress={clear}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </Pressable>
            <Pressable style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  keyboard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl + 20,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title2,
    color: colors.text,
  },
  unitToggle: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  unitText: {
    ...typography.headline,
    color: colors.primary,
  },
  totalSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  totalLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  totalValue: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text,
  },
  totalUnit: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  breakdown: {
    ...typography.footnote,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  plateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  plateButton: {
    alignItems: 'center',
  },
  plateCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  plateWeight: {
    ...typography.headline,
    color: '#fff',
    fontWeight: '700',
  },
  plateBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateBadgeText: {
    ...typography.caption2,
    color: '#fff',
    fontWeight: '700',
  },
  breakdownSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  breakdownLabel: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  breakdownText: {
    ...typography.subhead,
    color: colors.text,
    fontWeight: '600',
  },
  barSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  barLabel: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  barOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  barOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  barOptionActive: {
    backgroundColor: colors.primary,
  },
  barOptionText: {
    ...typography.subhead,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  barOptionTextActive: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  clearButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  clearButtonText: {
    ...typography.headline,
    color: colors.textSecondary,
  },
  confirmButton: {
    flex: 2,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    ...typography.headline,
    color: '#fff',
  },
});

export default PlateKeyboard;
