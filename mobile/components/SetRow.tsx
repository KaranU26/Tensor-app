import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/config/theme';

interface SetRowProps {
  setNumber: number;
  weight?: number;
  reps?: number;
  isPr?: boolean;
  completed?: boolean;
  onSave: (data: { weight?: number; reps?: number }) => void;
  onDelete?: () => void;
}

export default function SetRow({ setNumber, weight, reps, isPr, completed, onSave, onDelete }: SetRowProps) {
  const [weightVal, setWeightVal] = useState(weight?.toString() || '');
  const [repsVal, setRepsVal] = useState(reps?.toString() || '');

  const handleSave = () => {
    const w = parseFloat(weightVal);
    const r = parseInt(repsVal, 10);
    if (!Number.isFinite(w) || !Number.isFinite(r) || r <= 0) return;
    onSave({ weight: w, reps: r });
  };

  const isEditable = !completed;

  return (
    <View style={[styles.row, completed && styles.rowCompleted]}>
      <Text style={styles.setNumber}>{setNumber}</Text>
      <TextInput
        style={[styles.input, completed && styles.inputCompleted]}
        value={weightVal}
        onChangeText={setWeightVal}
        keyboardType="decimal-pad"
        placeholder="—"
        placeholderTextColor={colors.textTertiary}
        editable={isEditable}
      />
      <TextInput
        style={[styles.input, completed && styles.inputCompleted]}
        value={repsVal}
        onChangeText={setRepsVal}
        keyboardType="number-pad"
        placeholder="—"
        placeholderTextColor={colors.textTertiary}
        editable={isEditable}
      />
      {isEditable ? (
        <TouchableOpacity style={styles.checkButton} onPress={handleSave}>
          <Text style={styles.checkText}>+</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.doneIndicator}>
          <Text style={styles.doneText}>{isPr ? 'PR' : '✓'}</Text>
        </View>
      )}
      {onDelete && completed && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  rowCompleted: {
    opacity: 0.7,
  },
  setNumber: {
    ...typography.caption1,
    color: colors.textSecondary,
    width: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  inputCompleted: {
    backgroundColor: colors.background,
    borderColor: 'transparent',
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: '700',
  },
  doneIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneText: {
    ...typography.caption2,
    color: colors.success,
    fontWeight: '700',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
});
