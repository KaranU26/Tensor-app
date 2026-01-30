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

interface UseRecoveryReturn {
  recoveryData: MuscleRecoveryStatus[];
  readinessScore: number;
  recommendation: string;
  readyMuscles: MuscleGroup[];
  avoidMuscles: MuscleGroup[];
  isLoading: boolean;
  refresh: () => void;
}

// Mock workout history - in production, fetch from database
function getMockWorkoutHistory(): WorkoutVolumeData[] {
  const now = new Date();
  
  return [
    // Yesterday - Push workout
    {
      date: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      muscleVolume: {
        chest: 12,
        back: 0,
        shoulders: 6,
        biceps: 0,
        triceps: 9,
        forearms: 0,
        quads: 0,
        hamstrings: 0,
        glutes: 0,
        calves: 0,
        core: 3,
      },
    },
    // 2 days ago - Leg workout
    {
      date: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      muscleVolume: {
        chest: 0,
        back: 0,
        shoulders: 0,
        biceps: 0,
        triceps: 0,
        forearms: 0,
        quads: 15,
        hamstrings: 9,
        glutes: 12,
        calves: 6,
        core: 3,
      },
    },
    // 4 days ago - Pull workout
    {
      date: new Date(now.getTime() - 96 * 60 * 60 * 1000),
      muscleVolume: {
        chest: 0,
        back: 15,
        shoulders: 3,
        biceps: 9,
        triceps: 0,
        forearms: 6,
        quads: 0,
        hamstrings: 0,
        glutes: 0,
        calves: 0,
        core: 0,
      },
    },
  ];
}

export function useRecovery(): UseRecoveryReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutVolumeData[]>([]);

  // Load workout history
  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      // In production: fetch from SQLite database
      // const history = await getWorkoutVolumeHistory(7); // Last 7 days
      const history = getMockWorkoutHistory();
      setWorkoutHistory(history);
    } catch (error) {
      console.error('[Recovery] Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
