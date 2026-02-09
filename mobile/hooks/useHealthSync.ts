/**
 * useHealthSync Hook
 * Manages health platform integration state and sync operations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  isHealthAvailable,
  requestHealthPermissions,
  syncWorkoutToHealth,
  getHealthSyncState,
  getSteps,
  getHeartRate,
  getSleepData,
  getLatestBodyWeight,
  type WorkoutHealthData,
  type HealthPermissionStatus,
  type HealthDataPoint,
} from '@/lib/healthSync';

interface HealthSyncHookState {
  isAvailable: boolean;
  isAuthorized: boolean;
  isLoading: boolean;
  lastSyncDate: Date | null;
  error: string | null;
  // Health data
  steps: number | null;
  heartRate: HealthDataPoint[] | null;
  sleepHours: number | null;
  weight: number | null;
}

export function useHealthSync() {
  const [state, setState] = useState<HealthSyncHookState>({
    isAvailable: false,
    isAuthorized: false,
    isLoading: true,
    lastSyncDate: null,
    error: null,
    steps: null,
    heartRate: null,
    sleepHours: null,
    weight: null,
  });

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await isHealthAvailable();
      const syncState = getHealthSyncState();

      setState((prev) => ({
        ...prev,
        isAvailable: available,
        isAuthorized: syncState.isAuthorized,
        lastSyncDate: syncState.lastSyncDate,
        isLoading: false,
      }));

      // If already authorized, fetch health data
      if (syncState.isAuthorized) {
        fetchHealthData();
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  };

  const fetchHealthData = async () => {
    const today = new Date();
    const [stepsVal, hrVal, sleepVal, weightVal] = await Promise.all([
      getSteps(today).catch(() => null),
      getHeartRate(today).catch(() => null),
      getSleepData(today).catch(() => null),
      getLatestBodyWeight().catch(() => null),
    ]);

    setState((prev) => ({
      ...prev,
      steps: stepsVal,
      heartRate: hrVal,
      sleepHours: sleepVal?.totalHours ?? null,
      weight: weightVal,
    }));
  };

  const requestPermission = useCallback(async (): Promise<HealthPermissionStatus> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const status = await requestHealthPermissions();
      const authorized = status === 'granted';

      setState((prev) => ({
        ...prev,
        isAuthorized: authorized,
        isLoading: false,
      }));

      if (authorized) {
        fetchHealthData();
      }

      return status;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      return 'denied';
    }
  }, []);

  const syncWorkout = useCallback(async (workout: WorkoutHealthData): Promise<boolean> => {
    if (!state.isAuthorized) {
      setState((prev) => ({ ...prev, error: 'Not authorized' }));
      return false;
    }

    try {
      const success = await syncWorkoutToHealth(workout);

      if (success) {
        setState((prev) => ({
          ...prev,
          lastSyncDate: new Date(),
        }));
      }

      return success;
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
      return false;
    }
  }, [state.isAuthorized]);

  return {
    ...state,
    requestPermission,
    syncWorkout,
    refreshHealthData: fetchHealthData,
    refresh: checkAvailability,
  };
}

export default useHealthSync;
