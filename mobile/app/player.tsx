import { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Vibration,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { API_URL } from '@/config/api';
import { Button, Card } from '@/components/ui';
import { colors, gradients, spacing, typography, borderRadius, shadows } from '@/config/theme';

const { width } = Dimensions.get('window');

interface Stretch {
  id: string;
  name: string;
  durationSeconds: number;
  instructions?: string;
  tips?: string[];
  primaryMuscles: string[];
}

interface RoutineStretch {
  id: string;
  stretchId: string;
  positionOrder: number;
  customDurationSeconds?: number;
  stretch: Stretch;
}

interface Routine {
  id: string;
  name: string;
  stretches: RoutineStretch[];
}

interface SessionStretch {
  stretchId: string;
  heldDurationSeconds: number;
  feltTight: boolean;
  positionInRoutine: number;
  tightnessLevel?: 'tight' | 'moderate' | 'loose';
}

export default function PlayerScreen() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionStarted, setSessionStarted] = useState<Date | null>(null);
  const [completedStretches, setCompletedStretches] = useState<SessionStretch[]>([]);
  const [showTightPrompt, setShowTightPrompt] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stretchStartTimeRef = useRef<number>(0);

  useEffect(() => {
    if (routineId) {
      fetchRoutine();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [routineId]);

  const fetchRoutine = async () => {
    try {
      const res = await fetch(`${API_URL}/stretching/routines/${routineId}`);
      const data = await res.json();
      setRoutine(data.routine);
      if (data.routine?.stretches[0]) {
        const firstStretch = data.routine.stretches[0];
        const duration = firstStretch.customDurationSeconds || firstStretch.stretch.durationSeconds;
        setTimeRemaining(duration);
        setCurrentTotal(duration);
      }
    } catch (error) {
      console.error('Failed to fetch routine:', error);
    } finally {
      setLoading(false);
    }
  };

  const playCompletionFeedback = useCallback(async () => {
    try {
      Vibration.vibrate(200);
    } catch (error) {
      console.log('Vibration not available');
    }
  }, []);

  const startTimer = useCallback(() => {
    if (!routine || !sessionStarted) {
      setSessionStarted(new Date());
    }
    setIsPlaying(true);
    stretchStartTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsPlaying(false);
          playCompletionFeedback();
          setShowTightPrompt(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [routine, sessionStarted, playCompletionFeedback]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsPlaying(false);
  }, []);

  const handleTightResponse = useCallback((level: 'tight' | 'moderate' | 'loose') => {
    if (!routine) return;

    const currentStretch = routine.stretches[currentIndex];
    const heldDuration = Math.floor((Date.now() - stretchStartTimeRef.current) / 1000);
    const feltTight = level === 'tight';

    setCompletedStretches((prev) => [
      ...prev,
      {
        stretchId: currentStretch.stretchId,
        heldDurationSeconds: Math.max(heldDuration, currentStretch.stretch.durationSeconds),
        feltTight,
        tightnessLevel: level,
        positionInRoutine: currentIndex + 1,
      },
    ]);

    setShowTightPrompt(false);

    if (currentIndex < routine.stretches.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextStretch = routine.stretches[nextIndex];
      const duration = nextStretch.customDurationSeconds || nextStretch.stretch.durationSeconds;
      setCurrentIndex(nextIndex);
      setTimeRemaining(duration);
      setCurrentTotal(duration);
      setTimeout(() => startTimer(), 500);
    } else {
      saveSession([
        ...completedStretches,
        {
          stretchId: currentStretch.stretchId,
          heldDurationSeconds: Math.max(heldDuration, currentStretch.stretch.durationSeconds),
          feltTight,
          tightnessLevel: level,
          positionInRoutine: currentIndex + 1,
        },
      ]);
    }
  }, [routine, currentIndex, completedStretches, startTimer]);

  const skipStretch = useCallback(() => {
    if (!routine) return;

    pauseTimer();

    if (currentIndex < routine.stretches.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextStretch = routine.stretches[nextIndex];
      const duration = nextStretch.customDurationSeconds || nextStretch.stretch.durationSeconds;
      setCurrentIndex(nextIndex);
      setTimeRemaining(duration);
      setCurrentTotal(duration);
    } else {
      saveSession(completedStretches);
    }
  }, [routine, currentIndex, pauseTimer, completedStretches]);

  const saveSession = async (stretches: SessionStretch[]) => {
    if (!routine || !sessionStarted) return;

    try {
      router.push({
        pathname: '/routine-complete' as const,
        params: {
          routineName: routine.name,
          duration: Math.floor((Date.now() - sessionStarted.getTime()) / 1000).toString(),
          stretchCount: stretches.length.toString(),
        },
      } as any);
    } catch (error) {
      console.error('Failed to save session:', error);
      router.back();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}`;
  };

  const getProgress = () => {
    if (!routine) return 0;
    const totalDuration = currentTotal || 1;
    return 1 - timeRemaining / totalDuration;
  };

  const extendTimer = (seconds: number) => {
    setTimeRemaining((prev) => prev + seconds);
    setCurrentTotal((prev) => prev + seconds);
  };

  if (loading || !routine) {
    return (
      <LinearGradient colors={gradients.background} style={[styles.container, styles.centered]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <Text style={styles.loadingText}>Loading routine...</Text>
      </LinearGradient>
    );
  }

  const currentStretch = routine.stretches[currentIndex];
  const progress = getProgress();

  if (showTightPrompt) {
    return (
      <LinearGradient colors={gradients.background} style={[styles.container, styles.centered]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <Text style={styles.promptEmoji}>🤔</Text>
        <Text style={styles.promptTitle}>How did that feel?</Text>
        <Text style={styles.promptSubtitle}>This helps us track your progress</Text>
        <View style={styles.promptButtons}>
          <Pressable
            style={[styles.promptButton, styles.promptButtonTight]}
            onPress={() => handleTightResponse('tight')}
          >
            <Text style={styles.promptButtonText}>Tight</Text>
          </Pressable>
          <Pressable
            style={[styles.promptButton, styles.promptButtonModerate]}
            onPress={() => handleTightResponse('moderate')}
          >
            <Text style={styles.promptButtonText}>Moderate</Text>
          </Pressable>
          <Pressable
            style={[styles.promptButton, styles.promptButtonGood]}
            onPress={() => handleTightResponse('loose')}
          >
            <Text style={styles.promptButtonText}>Loose</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={gradients.background} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <Text style={styles.routineName}>{routine.name}</Text>
        <Text style={styles.progressText}>
          {currentIndex + 1} of {routine.stretches.length}
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        {routine.stretches.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressSegment,
              index < currentIndex && styles.progressSegmentComplete,
              index === currentIndex && styles.progressSegmentActive,
            ]}
          >
            {index === currentIndex && (
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            )}
          </View>
        ))}
      </View>

      <View style={styles.stretchContainer}>
        <Text style={styles.stretchEmoji}>🧘</Text>
        <Text style={styles.stretchName}>{currentStretch.stretch.name}</Text>
        <Text style={styles.stretchMuscles}>
          {currentStretch.stretch.primaryMuscles.join(' • ')}
        </Text>

        <View style={styles.timerOuter}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.timerGradient}
          >
            <View style={styles.timerInner}>
              <Text style={styles.timer}>{formatTime(timeRemaining)}</Text>
              <Text style={styles.timerLabel}>seconds</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.timerActions}>
          <Pressable style={styles.timerAction} onPress={() => extendTimer(15)}>
            <Text style={styles.timerActionText}>+15s</Text>
          </Pressable>
          <Pressable style={styles.timerAction} onPress={skipStretch}>
            <Text style={styles.timerActionText}>Skip</Text>
          </Pressable>
        </View>

        {currentStretch.stretch.instructions && (
          <Card variant="flat" style={styles.coachCard} padding="md">
            <Text style={styles.coachTitle}>Coach Tip</Text>
            <Text style={styles.instructions}>{currentStretch.stretch.instructions}</Text>
          </Card>
        )}
      </View>

      <View style={styles.controls}>
        {currentIndex > 0 ? (
          <Pressable
            style={styles.secondaryPill}
            onPress={() => {
              pauseTimer();
              const prevIndex = currentIndex - 1;
              const prevStretch = routine.stretches[prevIndex];
              const duration = prevStretch.customDurationSeconds || prevStretch.stretch.durationSeconds;
              setCurrentIndex(prevIndex);
              setTimeRemaining(duration);
              setCurrentTotal(duration);
            }}
          >
            <Text style={styles.secondaryPillText}>Previous</Text>
          </Pressable>
        ) : (
          <View style={styles.controlSpacer} />
        )}

        <Button
          title={isPlaying ? 'Pause' : 'Start'}
          onPress={isPlaying ? pauseTimer : startTimer}
          size="lg"
          style={styles.mainButton}
        />

        <Pressable style={styles.secondaryPill} onPress={() => extendTimer(30)}>
          <Text style={styles.secondaryPillText}>+30s</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: 56,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  routineName: {
    ...typography.title2,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  progressText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  progressBarContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.xl,
  },
  progressSegment: {
    flex: 1,
    height: 5,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressSegmentComplete: {
    backgroundColor: colors.accent,
  },
  progressSegmentActive: {
    backgroundColor: colors.borderLight,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  stretchContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stretchEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  stretchName: {
    ...typography.title1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  stretchMuscles: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  timerOuter: {
    width: width * 0.62,
    height: width * 0.62,
    borderRadius: width * 0.31,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  timerGradient: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.31,
    padding: 3,
  },
  timerInner: {
    flex: 1,
    borderRadius: width * 0.31,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  timer: {
    ...typography.largeTitle,
    fontSize: 64,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  timerActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  timerAction: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  timerActionText: {
    ...typography.caption1,
    color: colors.text,
  },
  coachCard: {
    width: '100%',
    marginTop: spacing.md,
  },
  coachTitle: {
    ...typography.caption1,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  instructions: {
    ...typography.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  mainButton: {
    minWidth: 140,
  },
  secondaryPill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryPillText: {
    ...typography.footnote,
    color: colors.text,
  },
  controlSpacer: {
    width: 78,
  },
  promptEmoji: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  promptTitle: {
    ...typography.title2,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  promptSubtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  promptButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  promptButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  promptButtonTight: {
    backgroundColor: colors.error,
  },
  promptButtonModerate: {
    backgroundColor: colors.warning,
  },
  promptButtonGood: {
    backgroundColor: colors.success,
  },
  promptButtonText: {
    ...typography.subhead,
    color: colors.textInverse,
    fontWeight: '600',
  },
});
