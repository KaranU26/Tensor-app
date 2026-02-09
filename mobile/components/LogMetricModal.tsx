import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/config/theme';
import { Button } from '@/components/ui';

type MetricType = 'weight' | 'bodyFat' | 'measurements';

interface LogMetricModalProps {
  visible: boolean;
  type: MetricType;
  onClose: () => void;
  onSubmit: (data: Record<string, number | string>) => void;
  loading?: boolean;
}

export default function LogMetricModal({
  visible,
  type,
  onClose,
  onSubmit,
  loading,
}: LogMetricModalProps) {
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');

  const handleSubmit = () => {
    if (type === 'weight') {
      const val = parseFloat(weight);
      if (!Number.isFinite(val) || val <= 0) return;
      onSubmit({ weight: val });
    } else if (type === 'bodyFat') {
      const val = parseFloat(bodyFat);
      if (!Number.isFinite(val) || val < 0 || val > 100) return;
      onSubmit({ bodyFatPercentage: val });
    } else {
      const data: Record<string, number> = {};
      if (chest) data.chest = parseFloat(chest);
      if (waist) data.waist = parseFloat(waist);
      if (hips) data.hips = parseFloat(hips);
      if (arms) data.arms = parseFloat(arms);
      if (thighs) data.thighs = parseFloat(thighs);
      if (Object.keys(data).length === 0) return;
      onSubmit(data);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'weight': return 'Log Weight';
      case 'bodyFat': return 'Log Body Fat';
      case 'measurements': return 'Add Measurements';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title}>{getTitle()}</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>Cancel</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {type === 'weight' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Weight (lbs)</Text>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    placeholder="e.g. 185"
                    placeholderTextColor={colors.textTertiary}
                    autoFocus
                  />
                </View>
              )}

              {type === 'bodyFat' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Body Fat (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={bodyFat}
                    onChangeText={setBodyFat}
                    keyboardType="decimal-pad"
                    placeholder="e.g. 18"
                    placeholderTextColor={colors.textTertiary}
                    autoFocus
                  />
                </View>
              )}

              {type === 'measurements' && (
                <View style={styles.measurementGrid}>
                  {[
                    { label: 'Chest (in)', value: chest, setter: setChest },
                    { label: 'Waist (in)', value: waist, setter: setWaist },
                    { label: 'Hips (in)', value: hips, setter: setHips },
                    { label: 'Arms (in)', value: arms, setter: setArms },
                    { label: 'Thighs (in)', value: thighs, setter: setThighs },
                  ].map(({ label, value, setter }) => (
                    <View key={label} style={styles.measurementInput}>
                      <Text style={styles.label}>{label}</Text>
                      <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={setter}
                        keyboardType="decimal-pad"
                        placeholder="—"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>
                  ))}
                </View>
              )}

              <Button
                title={loading ? 'Saving...' : 'Save'}
                onPress={handleSubmit}
                disabled={loading}
                fullWidth
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title3,
    color: colors.text,
  },
  closeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  closeText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    ...typography.headline,
    color: colors.text,
  },
  measurementGrid: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  measurementInput: {},
});
