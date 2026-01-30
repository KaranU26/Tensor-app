/**
 * Health Sync Service
 * Syncs workout data to Apple HealthKit (iOS) and Google Health Connect (Android)
 * Note: Requires development build - won't work in Expo Go
 */

import { Platform } from 'react-native';

// Types for health data
export interface WorkoutHealthData {
  name: string;
  startDate: Date;
  endDate: Date;
  caloriesBurned: number;
  duration: number; // minutes
  exerciseCount: number;
  totalVolume: number; // lbs
}

export interface BodyMeasurement {
  weight?: number; // lbs
  bodyFat?: number; // percentage
  date: Date;
}

// Permission status
export type HealthPermissionStatus = 'granted' | 'denied' | 'unavailable' | 'not_determined';

interface HealthSyncState {
  isAvailable: boolean;
  isAuthorized: boolean;
  lastSyncDate: Date | null;
}

let healthState: HealthSyncState = {
  isAvailable: false,
  isAuthorized: false,
  lastSyncDate: null,
};

/**
 * Check if health data is available on this device
 */
export async function isHealthAvailable(): Promise<boolean> {
  // In a real implementation, this would check for HealthKit/Health Connect
  // For now, we'll return true to show the UI flow
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/**
 * Request permission to read/write health data
 */
export async function requestHealthPermissions(): Promise<HealthPermissionStatus> {
  try {
    const available = await isHealthAvailable();
    if (!available) {
      return 'unavailable';
    }
    
    // In production, this would use:
    // iOS: expo-health or react-native-health
    // Android: react-native-health-connect
    
    // For now, simulate permission granted
    healthState.isAuthorized = true;
    console.log('[HealthSync] Permissions granted (simulated)');
    return 'granted';
  } catch (error) {
    console.error('[HealthSync] Permission request failed:', error);
    return 'denied';
  }
}

/**
 * Sync a completed workout to the health platform
 */
export async function syncWorkoutToHealth(workout: WorkoutHealthData): Promise<boolean> {
  if (!healthState.isAuthorized) {
    console.warn('[HealthSync] Not authorized to sync');
    return false;
  }
  
  try {
    // In production with HealthKit:
    // AppleHealthKit.saveWorkout({
    //   type: 'TraditionalStrengthTraining',
    //   startDate: workout.startDate.toISOString(),
    //   endDate: workout.endDate.toISOString(),
    //   energyBurned: workout.caloriesBurned,
    // });
    
    console.log('[HealthSync] Syncing workout:', {
      name: workout.name,
      duration: workout.duration,
      calories: workout.caloriesBurned,
    });
    
    healthState.lastSyncDate = new Date();
    return true;
  } catch (error) {
    console.error('[HealthSync] Failed to sync workout:', error);
    return false;
  }
}

/**
 * Sync body weight measurement
 */
export async function syncBodyWeight(weight: number, date: Date = new Date()): Promise<boolean> {
  if (!healthState.isAuthorized) {
    console.warn('[HealthSync] Not authorized to sync');
    return false;
  }
  
  try {
    // In production:
    // AppleHealthKit.saveWeight({ value: weight, unit: 'pound', date });
    
    console.log('[HealthSync] Syncing body weight:', weight, 'lbs');
    return true;
  } catch (error) {
    console.error('[HealthSync] Failed to sync weight:', error);
    return false;
  }
}

/**
 * Read latest body weight from health platform
 */
export async function getLatestBodyWeight(): Promise<number | null> {
  if (!healthState.isAuthorized) {
    return null;
  }
  
  try {
    // In production, fetch from HealthKit/Health Connect
    // For now, return null to indicate no data
    return null;
  } catch (error) {
    console.error('[HealthSync] Failed to read weight:', error);
    return null;
  }
}

/**
 * Get health sync status
 */
export function getHealthSyncState(): HealthSyncState {
  return { ...healthState };
}

/**
 * Calculate calories burned using MET values
 * MET * weight(kg) * duration(hours)
 */
export function calculateCaloriesBurned(
  metValue: number,
  weightLbs: number,
  durationMinutes: number
): number {
  const weightKg = weightLbs * 0.453592;
  const durationHours = durationMinutes / 60;
  return Math.round(metValue * weightKg * durationHours);
}

export default {
  isHealthAvailable,
  requestHealthPermissions,
  syncWorkoutToHealth,
  syncBodyWeight,
  getLatestBodyWeight,
  getHealthSyncState,
  calculateCaloriesBurned,
};
