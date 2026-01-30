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
  type WorkoutHealthData,
  type HealthPermissionStatus,
} from '@/lib/healthSync';

interface HealthSyncHookState {
  isAvailable: boolean;
  isAuthorized: boolean;
  isLoading: boolean;
  lastSyncDate: Date | null;
  error: string | null;
}

export function useHealthSync() {
  const [state, setState] = useState<HealthSyncHookState>({
    isAvailable: false,
    isAuthorized: false,
    isLoading: true,
    lastSyncDate: null,
    error: null,
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
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  };

  const requestPermission = useCallback(async (): Promise<HealthPermissionStatus> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const status = await requestHealthPermissions();
      
      setState((prev) => ({
        ...prev,
        isAuthorized: status === 'granted',
        isLoading: false,
      }));
      
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
    refresh: checkAvailability,
  };
}

export default useHealthSync;
