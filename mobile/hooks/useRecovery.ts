/**
 * useRecovery Hook
 * Manages recovery state and calculations from workout history
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  calculateFullBodyRecovery,
  calculateReadinessScore,
  getTrainingRecommendation,
  type MuscleRecoveryStatus,
  type MuscleGroup,
  type WorkoutVolumeData,
} from '@/lib/recoveryEngine';
import { getWorkoutHistory } from '@/lib/api/strength';
import { useAuthStore } from '@/store/authStore';

interface UseRecoveryReturn {
  recoveryData: MuscleRecoveryStatus[];
  readinessScore: number;
  recommendation: string;
  readyMuscles: MuscleGroup[];
  avoidMuscles: MuscleGroup[];
  isLoading: boolean;
  refresh: () => void;
}

// Body part name → recovery engine muscle group mapping
const BODY_PART_MAP: Record<string, MuscleGroup> = {
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  'upper arms': 'biceps',
  'lower arms': 'forearms',
  'upper legs': 'quads',
  'lower legs': 'calves',
  waist: 'core',
  cardio: 'core',
};

export function useRecovery(): UseRecoveryReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutVolumeData[]>([]);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Load real workout history from backend
  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!isAuthenticated) {
        setWorkoutHistory([]);
        return;
      }

      const { workouts } = await getWorkoutHistory(20);

      // Only include workouts from last 7 days
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentWorkouts = workouts.filter(
        (w) => w.completedAt && new Date(w.completedAt).getTime() > sevenDaysAgo
      );

      // Convert to WorkoutVolumeData format
      const volumeData: WorkoutVolumeData[] = recentWorkouts.map((workout) => {
        const muscleVolume: Record<string, number> = {
          chest: 0, back: 0, shoulders: 0, biceps: 0, triceps: 0,
          forearms: 0, quads: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0,
        };

        for (const ex of workout.exercises) {
          const bodyPart = ex.exercise.bodyPart?.toLowerCase() || '';
          const target = ex.exercise.target?.toLowerCase() || '';
          const setCount = ex.sets.length;

          // Map target muscle to specific group when possible
          if (target.includes('glute')) muscleVolume.glutes += setCount;
          else if (target.includes('hamstring')) muscleVolume.hamstrings += setCount;
          else if (target.includes('quad')) muscleVolume.quads += setCount;
          else if (target.includes('bicep')) muscleVolume.biceps += setCount;
          else if (target.includes('tricep')) muscleVolume.triceps += setCount;
          else if (target.includes('ab') || target.includes('core')) muscleVolume.core += setCount;
          else if (target.includes('calf') || target.includes('calves')) muscleVolume.calves += setCount;
          else {
            // Fallback to body part mapping
            const mapped = BODY_PART_MAP[bodyPart];
            if (mapped) muscleVolume[mapped] += setCount;
          }
        }

        return {
          date: new Date(workout.completedAt || workout.startedAt),
          muscleVolume,
        };
      });

      setWorkoutHistory(volumeData);
    } catch (error) {
      console.error('[Recovery] Failed to load history:', error);
      setWorkoutHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Calculate recovery data
  const recoveryData = useMemo(() => {
    if (workoutHistory.length === 0) return [];
    return calculateFullBodyRecovery(workoutHistory);
  }, [workoutHistory]);

  // Calculate readiness score
  const readinessScore = useMemo(() => {
    return calculateReadinessScore(recoveryData);
  }, [recoveryData]);

  // Get recommendations
  const { recommendation, readyMuscles, avoidMuscles } = useMemo(() => {
    return getTrainingRecommendation(recoveryData);
  }, [recoveryData]);

  return {
    recoveryData,
    readinessScore,
    recommendation,
    readyMuscles,
    avoidMuscles,
    isLoading,
    refresh: loadHistory,
  };
}

export default useRecovery;
