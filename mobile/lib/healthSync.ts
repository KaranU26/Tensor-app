/**
 * Health Sync Service
 * Syncs workout data to Apple HealthKit (iOS) and Google Health Connect (Android)
 *
 * Required packages (install when creating dev build):
 *   iOS:     react-native-health
 *   Android: react-native-health-connect
 *
 * Until packages are installed, all functions return graceful fallbacks.
 */

import { Platform } from 'react-native';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export interface WorkoutHealthData {
  name: string;
  startDate: Date;
  endDate: Date;
  caloriesBurned: number;
  duration: number; // minutes
  exerciseCount: number;
  totalVolume: number; // lbs
  type?: 'strength' | 'flexibility';
}

export interface BodyMeasurement {
  weight?: number; // lbs
  bodyFat?: number; // percentage
  date: Date;
}

export interface HealthDataPoint {
  value: number;
  date: Date;
  unit: string;
}

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

// ────────────────────────────────────────────────
// SDK Loader (dynamic import — won't crash if not installed)
// ────────────────────────────────────────────────

let healthKitModule: any = null;
let healthConnectModule: any = null;

async function loadHealthKit(): Promise<any> {
  if (Platform.OS !== 'ios') return null;
  if (healthKitModule) return healthKitModule;
  try {
    // @ts-ignore — optional peer dependency, installed with dev build
    healthKitModule = await import('react-native-health');
    return healthKitModule;
  } catch {
    return null;
  }
}

async function loadHealthConnect(): Promise<any> {
  if (Platform.OS !== 'android') return null;
  if (healthConnectModule) return healthConnectModule;
  try {
    // @ts-ignore — optional peer dependency, installed with dev build
    healthConnectModule = await import('react-native-health-connect');
    return healthConnectModule;
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────
// Core Functions
// ────────────────────────────────────────────────

export async function isHealthAvailable(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const hk = await loadHealthKit();
    if (hk?.default?.isAvailable) {
      return new Promise((resolve) => hk.default.isAvailable((err: any, available: boolean) => resolve(!err && available)));
    }
  }
  if (Platform.OS === 'android') {
    const hc = await loadHealthConnect();
    if (hc) return true;
  }
  // Fallback: report as available so UI shows the connect option
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export async function requestHealthPermissions(): Promise<HealthPermissionStatus> {
  try {
    const available = await isHealthAvailable();
    if (!available) return 'unavailable';

    if (Platform.OS === 'ios') {
      const hk = await loadHealthKit();
      if (hk?.default) {
        const permissions = {
          permissions: {
            read: [
              hk.default.Constants.Permissions.StepCount,
              hk.default.Constants.Permissions.HeartRate,
              hk.default.Constants.Permissions.SleepAnalysis,
              hk.default.Constants.Permissions.Weight,
              hk.default.Constants.Permissions.ActiveEnergyBurned,
            ],
            write: [
              hk.default.Constants.Permissions.Workout,
              hk.default.Constants.Permissions.Weight,
            ],
          },
        };
        return new Promise((resolve) => {
          hk.default.initHealthKit(permissions, (err: any) => {
            if (err) {
              console.warn('[HealthSync] HealthKit init error:', err);
              resolve('denied');
            } else {
              healthState.isAuthorized = true;
              resolve('granted');
            }
          });
        });
      }
    }

    if (Platform.OS === 'android') {
      const hc = await loadHealthConnect();
      if (hc?.requestPermission) {
        await hc.requestPermission([
          { accessType: 'read', recordType: 'Steps' },
          { accessType: 'read', recordType: 'HeartRate' },
          { accessType: 'read', recordType: 'SleepSession' },
          { accessType: 'read', recordType: 'Weight' },
          { accessType: 'write', recordType: 'ExerciseSession' },
        ]);
        healthState.isAuthorized = true;
        return 'granted';
      }
    }

    // Simulated fallback
    healthState.isAuthorized = true;
    console.log('[HealthSync] Permissions granted (simulated — install SDK for real data)');
    return 'granted';
  } catch (error) {
    console.error('[HealthSync] Permission request failed:', error);
    return 'denied';
  }
}

// ────────────────────────────────────────────────
// Write: Sync workouts and body data
// ────────────────────────────────────────────────

export async function syncWorkoutToHealth(workout: WorkoutHealthData): Promise<boolean> {
  if (!healthState.isAuthorized) return false;

  try {
    if (Platform.OS === 'ios') {
      const hk = await loadHealthKit();
      if (hk?.default?.saveWorkout) {
        return new Promise((resolve) => {
          hk.default.saveWorkout(
            {
              type: workout.type === 'flexibility'
                ? hk.default.Constants.Activities.Flexibility
                : hk.default.Constants.Activities.TraditionalStrengthTraining,
              startDate: workout.startDate.toISOString(),
              endDate: workout.endDate.toISOString(),
              energyBurned: workout.caloriesBurned,
            },
            (err: any) => {
              if (err) console.warn('[HealthSync] Save workout error:', err);
              healthState.lastSyncDate = new Date();
              resolve(!err);
            }
          );
        });
      }
    }

    if (Platform.OS === 'android') {
      const hc = await loadHealthConnect();
      if (hc?.insertRecords) {
        await hc.insertRecords([
          {
            recordType: 'ExerciseSession',
            startTime: workout.startDate.toISOString(),
            endTime: workout.endDate.toISOString(),
            exerciseType: workout.type === 'flexibility' ? 26 : 58, // FLEXIBILITY / WEIGHTLIFTING
          },
        ]);
        healthState.lastSyncDate = new Date();
        return true;
      }
    }

    // Simulated
    console.log('[HealthSync] Syncing workout (simulated):', workout.name);
    healthState.lastSyncDate = new Date();
    return true;
  } catch (error) {
    console.error('[HealthSync] Failed to sync workout:', error);
    return false;
  }
}

export async function syncBodyWeight(weight: number, date: Date = new Date()): Promise<boolean> {
  if (!healthState.isAuthorized) return false;

  try {
    if (Platform.OS === 'ios') {
      const hk = await loadHealthKit();
      if (hk?.default?.saveWeight) {
        return new Promise((resolve) => {
          hk.default.saveWeight({ value: weight, unit: 'pound', date: date.toISOString() }, (err: any) => {
            resolve(!err);
          });
        });
      }
    }

    console.log('[HealthSync] Syncing body weight (simulated):', weight, 'lbs');
    return true;
  } catch (error) {
    console.error('[HealthSync] Failed to sync weight:', error);
    return false;
  }
}

// ────────────────────────────────────────────────
// Read: Pull data from health platform
// ────────────────────────────────────────────────

export async function getLatestBodyWeight(): Promise<number | null> {
  if (!healthState.isAuthorized) return null;

  try {
    if (Platform.OS === 'ios') {
      const hk = await loadHealthKit();
      if (hk?.default?.getLatestWeight) {
        return new Promise((resolve) => {
          hk.default.getLatestWeight({}, (err: any, result: any) => {
            resolve(err ? null : result?.value || null);
          });
        });
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSteps(date: Date = new Date()): Promise<number | null> {
  if (!healthState.isAuthorized) return null;

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    if (Platform.OS === 'ios') {
      const hk = await loadHealthKit();
      if (hk?.default?.getStepCount) {
        return new Promise((resolve) => {
          hk.default.getStepCount(
            { startDate: startOfDay.toISOString(), endDate: endOfDay.toISOString() },
            (err: any, result: any) => resolve(err ? null : result?.value || 0)
          );
        });
      }
    }

    if (Platform.OS === 'android') {
      const hc = await loadHealthConnect();
      if (hc?.readRecords) {
        const result = await hc.readRecords('Steps', {
          timeRangeFilter: {
            operator: 'between',
            startTime: startOfDay.toISOString(),
            endTime: endOfDay.toISOString(),
          },
        });
        return result?.records?.reduce((sum: number, r: any) => sum + (r.count || 0), 0) || 0;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function getHeartRate(date: Date = new Date()): Promise<HealthDataPoint[] | null> {
  if (!healthState.isAuthorized) return null;

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    if (Platform.OS === 'ios') {
      const hk = await loadHealthKit();
      if (hk?.default?.getHeartRateSamples) {
        return new Promise((resolve) => {
          hk.default.getHeartRateSamples(
            { startDate: startOfDay.toISOString(), endDate: endOfDay.toISOString(), limit: 10 },
            (err: any, results: any[]) => {
              if (err || !results) { resolve(null); return; }
              resolve(results.map((r) => ({
                value: r.value,
                date: new Date(r.startDate),
                unit: 'bpm',
              })));
            }
          );
        });
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function getSleepData(date: Date = new Date()): Promise<{ totalHours: number } | null> {
  if (!healthState.isAuthorized) return null;

  try {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(18, 0, 0, 0); // Look from 6pm yesterday
    const endOfDay = new Date(date);
    endOfDay.setHours(12, 0, 0, 0); // Until noon today

    if (Platform.OS === 'ios') {
      const hk = await loadHealthKit();
      if (hk?.default?.getSleepSamples) {
        return new Promise((resolve) => {
          hk.default.getSleepSamples(
            { startDate: yesterday.toISOString(), endDate: endOfDay.toISOString() },
            (err: any, results: any[]) => {
              if (err || !results || results.length === 0) { resolve(null); return; }
              // Sum up ASLEEP samples
              const asleepMs = results
                .filter((s: any) => s.value === 'ASLEEP' || s.value === 'INBED')
                .reduce((sum: number, s: any) => {
                  const start = new Date(s.startDate).getTime();
                  const end = new Date(s.endDate).getTime();
                  return sum + (end - start);
                }, 0);
              resolve({ totalHours: Math.round((asleepMs / (1000 * 60 * 60)) * 10) / 10 });
            }
          );
        });
      }
    }

    return null;
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────
// Utility
// ────────────────────────────────────────────────

export function getHealthSyncState(): HealthSyncState {
  return { ...healthState };
}

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
  getSteps,
  getHeartRate,
  getSleepData,
  getHealthSyncState,
  calculateCaloriesBurned,
};
