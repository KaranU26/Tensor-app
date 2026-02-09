import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, typography, spacing, borderRadius, shadows } from '@/config/theme';
import { Card, Button } from '@/components/ui';
import { playHaptic } from '@/lib/sounds';
import {
  getStretches,
  createStretchingRoutine,
  updateStretchingRoutine,
  type StretchItem,
  type RoutineStretchInput,
} from '@/lib/api/stretching';
import { useAuthStore } from '@/store/authStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Step = 'details' | 'stretches' | 'review';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface SelectedStretch {
  stretch: StretchItem;
  customDurationSeconds?: number;
}

const TARGET_AREAS = [
  'Hamstrings', 'Quads', 'Hip Flexors', 'Glutes', 'Calves',
  'Lower Back', 'Upper Back', 'Shoulders', 'Neck', 'Chest',
  'Arms', 'Core', 'Full Body',
];

const DIFFICULTIES: { value: Difficulty; label: string; emoji: string }[] = [
  { value: 'beginner', label: 'Beginner', emoji: '🌱' },
  { value: 'intermediate', label: 'Intermediate', emoji: '💪' },
  { value: 'advanced', label: 'Advanced', emoji: '🔥' },
];

// ─── Chip Component ──────────────────────────
function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => { playHaptic('light'); onPress(); }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

// ─── Stretch Library Item ────────────────────
function StretchLibraryItem({
  stretch,
  isAdded,
  onToggle,
}: {
  stretch: StretchItem;
  isAdded: boolean;
  onToggle: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => { playHaptic('light'); onToggle(); }}
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.stretchLibItem, isAdded && styles.stretchLibItemSelected, animStyle]}
    >
      <View style={styles.stretchLibInfo}>
        <Text style={styles.stretchLibName}>{stretch.name}</Text>
        <Text style={styles.stretchLibMeta}>
          {stretch.primaryMuscles?.join(', ')} • {stretch.durationSeconds}s • {stretch.difficulty}
        </Text>
      </View>
      <View style={[styles.addBadge, isAdded && styles.addBadgeActive]}>
        <Text style={[styles.addBadgeText, isAdded && styles.addBadgeTextActive]}>
          {isAdded ? '✓' : '+'}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

// ─── Selected Stretch Row ────────────────────
function SelectedStretchRow({
  item,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
  onDurationChange,
}: {
  item: SelectedStretch;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onDurationChange: (seconds: number) => void;
}) {
  const duration = item.customDurationSeconds || item.stretch.durationSeconds;

  return (
    <View style={styles.selectedRow}>
      <View style={styles.selectedOrder}>
        <Pressable
          onPress={onMoveUp}
          disabled={index === 0}
          style={[styles.orderBtn, index === 0 && styles.orderBtnDisabled]}
        >
          <Text style={styles.orderBtnText}>▲</Text>
        </Pressable>
        <Text style={styles.orderNumber}>{index + 1}</Text>
        <Pressable
          onPress={onMoveDown}
          disabled={index === total - 1}
          style={[styles.orderBtn, index === total - 1 && styles.orderBtnDisabled]}
        >
          <Text style={styles.orderBtnText}>▼</Text>
        </Pressable>
      </View>
      <View style={styles.selectedInfo}>
        <Text style={styles.selectedName} numberOfLines={1}>{item.stretch.name}</Text>
        <View style={styles.durationRow}>
          <Pressable
            onPress={() => { playHaptic('light'); onDurationChange(Math.max(10, duration - 10)); }}
            style={styles.durationBtn}
          >
            <Text style={styles.durationBtnText}>−</Text>
          </Pressable>
          <Text style={styles.durationValue}>{duration}s</Text>
          <Pressable
            onPress={() => { playHaptic('light'); onDurationChange(duration + 10); }}
            style={styles.durationBtn}
          >
            <Text style={styles.durationBtnText}>+</Text>
          </Pressable>
        </View>
      </View>
      <Pressable onPress={onRemove} style={styles.removeBtn}>
        <Text style={styles.removeBtnText}>✕</Text>
      </Pressable>
    </View>
  );
}

// ═══════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════
export default function CreateRoutineScreen() {
  const params = useLocalSearchParams<{
    editId?: string;
    prefillName?: string;
    prefillDescription?: string;
    prefillDifficulty?: string;
  }>();
  const isEditing = !!params.editId;
  const { user } = useAuthStore();
  const isPro = (user as any)?.subscription?.status === 'active';

  // Step state
  const [step, setStep] = useState<Step>('details');

  // Details
  const [name, setName] = useState(params.prefillName || '');
  const [description, setDescription] = useState(params.prefillDescription || '');
  const [difficulty, setDifficulty] = useState<Difficulty>(
    (params.prefillDifficulty as Difficulty) || 'beginner'
  );
  const [targetAreas, setTargetAreas] = useState<string[]>([]);

  // Stretch library
  const [libraryStretches, setLibraryStretches] = useState<StretchItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');

  // Selected stretches
  const [selectedStretches, setSelectedStretches] = useState<SelectedStretch[]>([]);

  // Saving
  const [saving, setSaving] = useState(false);

  // ─── Fetch stretch library ─────────────────
  const loadStretches = useCallback(async (search?: string, diff?: string) => {
    setLibraryLoading(true);
    try {
      const result = await getStretches({
        search: search || undefined,
        difficulty: diff || undefined,
        limit: 50,
      });
      setLibraryStretches(result.stretches);
    } catch (e) {
      console.log('Failed to load stretches:', e);
    } finally {
      setLibraryLoading(false);
    }
  }, []);

  // ─── Step navigation ───────────────────────
  const goToStretches = () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please give your routine a name.');
      return;
    }
    playHaptic('selection');
    setStep('stretches');
    loadStretches();
  };

  const goToReview = () => {
    if (selectedStretches.length === 0) {
      Alert.alert('Add Stretches', 'Please add at least one stretch to your routine.');
      return;
    }
    playHaptic('selection');
    setStep('review');
  };

  const goBack = () => {
    playHaptic('light');
    if (step === 'stretches') setStep('details');
    else if (step === 'review') setStep('stretches');
    else router.back();
  };

  // ─── Toggle stretch selection ──────────────
  const toggleStretch = (stretch: StretchItem) => {
    setSelectedStretches((prev) => {
      const exists = prev.find((s) => s.stretch.id === stretch.id);
      if (exists) {
        return prev.filter((s) => s.stretch.id !== stretch.id);
      }
      return [...prev, { stretch }];
    });
  };

  // ─── Reorder ──────────────────────────────
  const moveStretch = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    setSelectedStretches((prev) => {
      const arr = [...prev];
      [arr[fromIndex], arr[toIndex]] = [arr[toIndex], arr[fromIndex]];
      return arr;
    });
    playHaptic('light');
  };

  // ─── Update duration ─────────────────────
  const updateDuration = (index: number, seconds: number) => {
    setSelectedStretches((prev) => {
      const arr = [...prev];
      arr[index] = { ...arr[index], customDurationSeconds: seconds };
      return arr;
    });
  };

  // ─── Remove stretch ──────────────────────
  const removeStretch = (index: number) => {
    playHaptic('light');
    setSelectedStretches((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Search ───────────────────────────────
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    loadStretches(text, filterDifficulty);
  };

  const handleFilterDifficulty = (diff: string) => {
    const newDiff = filterDifficulty === diff ? '' : diff;
    setFilterDifficulty(newDiff);
    loadStretches(searchQuery, newDiff);
  };

  // ─── Save routine ────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const stretchData: RoutineStretchInput[] = selectedStretches.map((s) => ({
        stretchId: s.stretch.id,
        customDurationSeconds: s.customDurationSeconds,
      }));

      if (isEditing && params.editId) {
        await updateStretchingRoutine(params.editId, {
          name: name.trim(),
          description: description.trim() || undefined,
          difficulty,
          targetAreas: targetAreas.length > 0 ? targetAreas : undefined,
          stretches: stretchData,
        });
      } else {
        await createStretchingRoutine({
          name: name.trim(),
          description: description.trim() || undefined,
          difficulty,
          targetAreas: targetAreas.length > 0 ? targetAreas : undefined,
          stretches: stretchData,
        });
      }

      playHaptic('success');
      Alert.alert(
        isEditing ? 'Routine Updated' : 'Routine Created',
        `"${name.trim()}" has been ${isEditing ? 'updated' : 'saved'}.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      playHaptic('error');
      const msg = error.message || 'Something went wrong';
      if (msg.includes('limit')) {
        Alert.alert(
          'Routine Limit Reached',
          'Free accounts can create up to 4 custom routines. Upgrade to Pro for unlimited routines.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => router.push('/paywall') },
          ]
        );
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  // ─── Total duration ───────────────────────
  const totalSeconds = selectedStretches.reduce((sum, s) => {
    return sum + (s.customDurationSeconds || s.stretch.durationSeconds);
  }, 0);
  const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));

  // ─── Toggle target area ───────────────────
  const toggleTargetArea = (area: string) => {
    playHaptic('light');
    setTargetAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(250)} style={styles.header}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>
            {isEditing ? 'Edit Routine' : 'Create Routine'}
          </Text>
          <Text style={styles.stepIndicator}>
            Step {step === 'details' ? '1' : step === 'stretches' ? '2' : '3'} of 3
          </Text>
        </Animated.View>

        {/* Step Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {
            width: step === 'details' ? '33%' : step === 'stretches' ? '66%' : '100%',
          }]} />
        </View>

        {/* ─── STEP 1: Details ─────────────────── */}
        {step === 'details' && (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={false}>
            <Animated.View entering={FadeInUp.delay(100).duration(250)}>
              <Text style={styles.label}>Routine Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Morning Stretch Flow"
                placeholderTextColor={colors.textTertiary}
                maxLength={50}
              />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(150).duration(250)}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={description}
                onChangeText={setDescription}
                placeholder="What's this routine for?"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).duration(250)}>
              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.difficultyRow}>
                {DIFFICULTIES.map((d) => (
                  <Pressable
                    key={d.value}
                    onPress={() => { playHaptic('light'); setDifficulty(d.value); }}
                    style={[
                      styles.difficultyOption,
                      difficulty === d.value && styles.difficultySelected,
                    ]}
                  >
                    <Text style={styles.difficultyEmoji}>{d.emoji}</Text>
                    <Text style={[
                      styles.difficultyLabel,
                      difficulty === d.value && styles.difficultyLabelSelected,
                    ]}>
                      {d.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(250).duration(250)}>
              <Text style={styles.label}>Target Areas</Text>
              <View style={styles.chipGrid}>
                {TARGET_AREAS.map((area) => (
                  <Chip
                    key={area}
                    label={area}
                    selected={targetAreas.includes(area)}
                    onPress={() => toggleTargetArea(area)}
                  />
                ))}
              </View>
            </Animated.View>

            {!isPro && (
              <Animated.View entering={FadeInUp.delay(300).duration(250)}>
                <View style={styles.limitBanner}>
                  <Text style={styles.limitText}>
                    Free accounts can create up to 4 custom routines
                  </Text>
                </View>
              </Animated.View>
            )}

            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}

        {/* ─── STEP 2: Browse & Select Stretches ── */}
        {step === 'stretches' && (
          <View style={{ flex: 1 }}>
            {/* Search bar */}
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Search stretches..."
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            {/* Difficulty filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {DIFFICULTIES.map((d) => (
                <Chip
                  key={d.value}
                  label={`${d.emoji} ${d.label}`}
                  selected={filterDifficulty === d.value}
                  onPress={() => handleFilterDifficulty(d.value)}
                />
              ))}
            </ScrollView>

            {/* Selected count badge */}
            {selectedStretches.length > 0 && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>
                  {selectedStretches.length} stretch{selectedStretches.length !== 1 ? 'es' : ''} selected
                </Text>
              </View>
            )}

            {/* Stretch list */}
            {libraryLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={false}>
                {libraryStretches.length === 0 ? (
                  <View style={styles.emptyLib}>
                    <Text style={styles.emptyLibText}>No stretches found</Text>
                    <Text style={styles.emptyLibSub}>Try a different search or filter</Text>
                  </View>
                ) : (
                  libraryStretches.map((stretch) => (
                    <StretchLibraryItem
                      key={stretch.id}
                      stretch={stretch}
                      isAdded={selectedStretches.some((s) => s.stretch.id === stretch.id)}
                      onToggle={() => toggleStretch(stretch)}
                    />
                  ))
                )}
                <View style={styles.bottomSpacer} />
              </ScrollView>
            )}
          </View>
        )}

        {/* ─── STEP 3: Review & Reorder ──────────── */}
        {step === 'review' && (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={false}>
            <Animated.View entering={FadeInUp.delay(100).duration(250)}>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryName}>{name}</Text>
                {description ? (
                  <Text style={styles.summaryDesc}>{description}</Text>
                ) : null}
                <View style={styles.summaryMeta}>
                  <View style={styles.summaryMetaItem}>
                    <Text style={styles.summaryMetaValue}>{totalMinutes}</Text>
                    <Text style={styles.summaryMetaLabel}>min</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryMetaItem}>
                    <Text style={styles.summaryMetaValue}>{selectedStretches.length}</Text>
                    <Text style={styles.summaryMetaLabel}>stretches</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryMetaItem}>
                    <Text style={styles.summaryMetaValue}>{difficulty}</Text>
                    <Text style={styles.summaryMetaLabel}>level</Text>
                  </View>
                </View>
              </Card>
            </Animated.View>

            <Text style={styles.reviewSectionTitle}>
              Reorder & Adjust Durations
            </Text>

            {selectedStretches.map((item, index) => (
              <Animated.View
                key={item.stretch.id}
                entering={FadeInUp.delay(150 + index * 50).duration(200)}
              >
                <SelectedStretchRow
                  item={item}
                  index={index}
                  total={selectedStretches.length}
                  onMoveUp={() => moveStretch(index, 'up')}
                  onMoveDown={() => moveStretch(index, 'down')}
                  onRemove={() => removeStretch(index)}
                  onDurationChange={(s) => updateDuration(index, s)}
                />
              </Animated.View>
            ))}

            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}

        {/* Footer CTA */}
        <View style={styles.footer}>
          {step === 'details' && (
            <Button title="Next: Add Stretches" onPress={goToStretches} size="lg" fullWidth />
          )}
          {step === 'stretches' && (
            <Button
              title={`Review (${selectedStretches.length} stretches)`}
              onPress={goToReview}
              size="lg"
              fullWidth
            />
          )}
          {step === 'review' && (
            <Button
              title={saving ? 'Saving...' : isEditing ? 'Update Routine' : 'Save Routine'}
              onPress={handleSave}
              size="lg"
              fullWidth
              disabled={saving}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  title: {
    ...typography.title1,
    color: colors.text,
  },
  stepIndicator: {
    ...typography.caption1,
    color: colors.accent,
    marginTop: spacing.xs,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    borderRadius: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  label: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  difficultyOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
  },
  difficultySelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '14',
  },
  difficultyEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  difficultyLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  difficultyLabelSelected: {
    color: colors.primary,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.full,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '14',
  },
  chipText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.accent,
  },
  limitBanner: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.warning + '14',
    borderWidth: 1,
    borderColor: colors.warning + '33',
    borderRadius: borderRadius.md,
  },
  limitText: {
    ...typography.footnote,
    color: colors.warning,
    textAlign: 'center',
  },
  // Search & filters
  searchRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    maxHeight: 44,
  },
  selectedBadge: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accent + '14',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.accent + '33',
  },
  selectedBadgeText: {
    ...typography.caption1,
    color: colors.accent,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxxl,
  },
  // Stretch library item
  stretchLibItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
  },
  stretchLibItemSelected: {
    borderColor: colors.accent + '66',
    backgroundColor: colors.accent + '0A',
  },
  stretchLibInfo: {
    flex: 1,
  },
  stretchLibName: {
    ...typography.headline,
    color: colors.text,
    marginBottom: 2,
  },
  stretchLibMeta: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  addBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBadgeActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  addBadgeText: {
    ...typography.headline,
    color: colors.textSecondary,
  },
  addBadgeTextActive: {
    color: colors.textInverse,
  },
  emptyLib: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyLibText: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyLibSub: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  // Selected stretch row (review)
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
  },
  selectedOrder: {
    alignItems: 'center',
    marginRight: spacing.md,
    gap: 2,
  },
  orderBtn: {
    padding: 2,
  },
  orderBtnDisabled: {
    opacity: 0.2,
  },
  orderBtnText: {
    ...typography.caption2,
    color: colors.textSecondary,
  },
  orderNumber: {
    ...typography.caption1,
    color: colors.accent,
    width: 20,
    textAlign: 'center',
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  durationBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '14',
    borderWidth: 1,
    borderColor: colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBtnText: {
    ...typography.headline,
    color: colors.primary,
  },
  durationValue: {
    ...typography.callout,
    color: colors.text,
    minWidth: 36,
    textAlign: 'center',
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error + '14',
    borderWidth: 1,
    borderColor: colors.error + '33',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  removeBtnText: {
    ...typography.caption1,
    color: colors.error,
  },
  // Review summary
  summaryCard: {
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryName: {
    ...typography.title2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  summaryDesc: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  summaryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  summaryMetaItem: {
    alignItems: 'center',
  },
  summaryMetaValue: {
    ...typography.title3,
    color: colors.primary,
    textTransform: 'capitalize',
  },
  summaryMetaLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderLight,
  },
  reviewSectionTitle: {
    ...typography.title3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  // Footer
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  bottomSpacer: {
    height: 20,
  },
});
