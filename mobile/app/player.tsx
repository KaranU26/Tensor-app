import { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Vibration,
  Alert,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/store/authStore';
import { API_URL } from '@/config/api';

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
}

export default function PlayerScreen() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionStarted, setSessionStarted] = useState<Date | null>(null);
  const [completedStretches, setCompletedStretches] = useState<SessionStretch[]>([]);
  const [showTightPrompt, setShowTightPrompt] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stretchStartTimeRef = useRef<number>(0);

  // Fetch routine
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
        setTimeRemaining(firstStretch.customDurationSeconds || firstStretch.stretch.durationSeconds);
      }
    } catch (error) {
      console.error('Failed to fetch routine:', error);
    } finally {
      setLoading(false);
    }
  };

  // Play completion sound and vibrate
  const playCompletionFeedback = useCallback(async () => {
    try {
      Vibration.vibrate(200);
    } catch (error) {
      console.log('Vibration not available');
    }
  }, []);

  // Start timer
  const startTimer = useCallback(() => {
    if (!routine || !sessionStarted) {
      setSessionStarted(new Date());
    }
    setIsPlaying(true);
    stretchStartTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - show tight prompt
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

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsPlaying(false);
  }, []);

  // Handle tight prompt response
  const handleTightResponse = useCallback((feltTight: boolean) => {
    if (!routine) return;

    const currentStretch = routine.stretches[currentIndex];
    const heldDuration = Math.floor((Date.now() - stretchStartTimeRef.current) / 1000);

    // Record completed stretch
    setCompletedStretches((prev) => [
      ...prev,
      {
        stretchId: currentStretch.stretchId,
        heldDurationSeconds: Math.max(heldDuration, currentStretch.stretch.durationSeconds),
        feltTight,
        positionInRoutine: currentIndex + 1,
      },
    ]);

    setShowTightPrompt(false);

    // Move to next stretch or finish
    if (currentIndex < routine.stretches.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextStretch = routine.stretches[nextIndex];
      setCurrentIndex(nextIndex);
      setTimeRemaining(nextStretch.customDurationSeconds || nextStretch.stretch.durationSeconds);
      // Auto-start next stretch after brief pause
      setTimeout(() => startTimer(), 500);
    } else {
      // Routine complete - save session
      saveSession([
        ...completedStretches,
        {
          stretchId: currentStretch.stretchId,
          heldDurationSeconds: Math.max(heldDuration, currentStretch.stretch.durationSeconds),
          feltTight,
          positionInRoutine: currentIndex + 1,
        },
      ]);
    }
  }, [routine, currentIndex, completedStretches, startTimer]);

  // Skip current stretch
  const skipStretch = useCallback(() => {
    if (!routine) return;

    pauseTimer();

    if (currentIndex < routine.stretches.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextStretch = routine.stretches[nextIndex];
      setCurrentIndex(nextIndex);
      setTimeRemaining(nextStretch.customDurationSeconds || nextStretch.stretch.durationSeconds);
    } else {
      // If skipping last stretch, just save what we have
      saveSession(completedStretches);
    }
  }, [routine, currentIndex, pauseTimer, completedStretches]);

  // Save session to backend
  const saveSession = async (stretches: SessionStretch[]) => {
    if (!routine || !sessionStarted) return;

    try {
      // For now, just navigate to completion - auth required for actual save
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

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}`;
  };

  // Calculate progress
  const getProgress = () => {
    if (!routine) return 0;
    const currentStretch = routine.stretches[currentIndex];
    const totalDuration = currentStretch.customDurationSeconds || currentStretch.stretch.durationSeconds;
    return 1 - timeRemaining / totalDuration;
  };

  if (loading || !routine) {
    return (
      <View style={[styles.container, styles.centered, isDark && styles.containerDark]}>
        <Text style={[styles.loadingText, isDark && styles.textLight]}>Loading routine...</Text>
      </View>
    );
  }

  const currentStretch = routine.stretches[currentIndex];
  const progress = getProgress();

  // Tight prompt overlay
  if (showTightPrompt) {
    return (
      <View style={[styles.container, styles.centered, isDark && styles.containerDark]}>
        <Text style={styles.promptEmoji}>🤔</Text>
        <Text style={[styles.promptTitle, isDark && styles.textLight]}>
          Did this area feel tight?
        </Text>
        <Text style={[styles.promptSubtitle, isDark && styles.subtitleDark]}>
          This helps us track your progress
        </Text>
        <View style={styles.promptButtons}>
          <Pressable
            style={[styles.promptButton, { backgroundColor: '#F44336' }]}
            onPress={() => handleTightResponse(true)}
          >
            <Text style={styles.promptButtonText}>Yes, Tight</Text>
          </Pressable>
          <Pressable
            style={[styles.promptButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => handleTightResponse(false)}
          >
            <Text style={styles.promptButtonText}>Felt Good</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <Text style={[styles.routineName, isDark && styles.textLight]}>{routine.name}</Text>
        <Text style={[styles.progressText, isDark && styles.subtitleDark]}>
          {currentIndex + 1} of {routine.stretches.length}
        </Text>
      </View>

      {/* Progress Bar */}
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

      {/* Stretch Info */}
      <View style={styles.stretchContainer}>
        <Text style={styles.stretchEmoji}>🧘</Text>
        <Text style={[styles.stretchName, isDark && styles.textLight]}>
          {currentStretch.stretch.name}
        </Text>
        <Text style={[styles.stretchMuscles, isDark && styles.subtitleDark]}>
          {currentStretch.stretch.primaryMuscles.join(' • ')}
        </Text>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={[styles.timer, isDark && styles.textLight]}>{formatTime(timeRemaining)}</Text>
        </View>

        {/* Instructions */}
        {currentStretch.stretch.instructions && (
          <Text style={[styles.instructions, isDark && styles.subtitleDark]}>
            {currentStretch.stretch.instructions}
          </Text>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {currentIndex > 0 && (
          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              pauseTimer();
              const prevIndex = currentIndex - 1;
              const prevStretch = routine.stretches[prevIndex];
              setCurrentIndex(prevIndex);
              setTimeRemaining(prevStretch.customDurationSeconds || prevStretch.stretch.durationSeconds);
            }}
          >
            <Text style={styles.secondaryButtonText}>← Previous</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.mainButton, isPlaying && styles.pauseButton]}
          onPress={isPlaying ? pauseTimer : startTimer}
        >
          <Text style={styles.mainButtonText}>{isPlaying ? '⏸ Pause' : '▶ Start'}</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={skipStretch}>
          <Text style={styles.secondaryButtonText}>Skip →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    paddingTop: 60,
  },
  containerDark: {
    backgroundColor: '#0d0d1a',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textLight: {
    color: '#ffffff',
  },
  subtitleDark: {
    color: '#888',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#888',
  },
  routineName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 32,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressSegmentComplete: {
    backgroundColor: '#4CAF50',
  },
  progressSegmentActive: {
    backgroundColor: '#e0e0e0',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  stretchContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stretchEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  stretchName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 8,
  },
  stretchMuscles: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  timerContainer: {
    marginBottom: 24,
  },
  timer: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#1a1a2e',
    fontVariant: ['tabular-nums'],
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 32,
  },
  mainButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  // Prompt styles
  promptEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  promptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  promptSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  promptButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  promptButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  promptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
