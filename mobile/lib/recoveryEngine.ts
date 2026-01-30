/**
 * Recovery Engine
 * Calculates muscle fatigue and recovery status based on workout history
 */

// Muscle groups tracked for recovery
export type MuscleGroup = 
  | 'chest' 
  | 'back' 
  | 'shoulders' 
  | 'biceps' 
  | 'triceps' 
  | 'forearms'
  | 'quads' 
  | 'hamstrings' 
  | 'glutes' 
  | 'calves' 
  | 'core';

export interface MuscleRecoveryStatus {
  muscle: MuscleGroup;
  fatigueScore: number; // 0-100, where 100 = fully fatigued
  recoveryPercent: number; // 0-100, where 100 = fully recovered
  status: 'fatigued' | 'recovering' | 'recovered';
  color: string;
  hoursUntilRecovered: number;
  lastWorkedDate: Date | null;
  volumeScore: number;
}

export interface WorkoutVolumeData {
  date: Date;
  muscleVolume: Record<MuscleGroup, number>; // Sets per muscle
}

// Base recovery times in hours by muscle group
const BASE_RECOVERY_HOURS: Record<MuscleGroup, number> = {
  chest: 48,
  back: 72,
  shoulders: 48,
  biceps: 48,
  triceps: 48,
  forearms: 36,
  quads: 72,
  hamstrings: 72,
  glutes: 72,
  calves: 48,
  core: 24,
};

// Volume thresholds (sets) that extend recovery
const VOLUME_THRESHOLDS = {
  light: 6,   // < 6 sets = normal recovery
  moderate: 12, // 6-12 sets = +25% recovery time
  heavy: 18,   // 12-18 sets = +50% recovery time
  extreme: 24, // > 18 sets = +75% recovery time
};

// Recovery status colors
const RECOVERY_COLORS = {
  fatigued: '#EF4444',    // Red
  recovering: '#F59E0B',  // Yellow/Amber
  recovered: '#22C55E',   // Green
};

/**
 * Calculate volume modifier based on sets performed
 */
function getVolumeModifier(sets: number): number {
  if (sets >= VOLUME_THRESHOLDS.extreme) return 0.75;
  if (sets >= VOLUME_THRESHOLDS.heavy) return 0.5;
  if (sets >= VOLUME_THRESHOLDS.moderate) return 0.25;
  return 0;
}

/**
 * Calculate recovery status for a single muscle
 */
export function calculateMuscleRecovery(
  muscle: MuscleGroup,
  volumeHistory: WorkoutVolumeData[]
): MuscleRecoveryStatus {
  // Find most recent workout involving this muscle
  const relevantWorkouts = volumeHistory
    .filter(w => w.muscleVolume[muscle] > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (relevantWorkouts.length === 0) {
    return {
      muscle,
      fatigueScore: 0,
      recoveryPercent: 100,
      status: 'recovered',
      color: RECOVERY_COLORS.recovered,
      hoursUntilRecovered: 0,
      lastWorkedDate: null,
      volumeScore: 0,
    };
  }

  const lastWorkout = relevantWorkouts[0];
  const volume = lastWorkout.muscleVolume[muscle];
  const hoursSince = (Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60);
  
  // Calculate recovery time with volume modifier
  const baseRecovery = BASE_RECOVERY_HOURS[muscle];
  const volumeModifier = getVolumeModifier(volume);
  const totalRecoveryHours = baseRecovery * (1 + volumeModifier);
  
  // Calculate recovery percentage
  const recoveryPercent = Math.min(100, Math.round((hoursSince / totalRecoveryHours) * 100));
  const fatigueScore = 100 - recoveryPercent;
  const hoursUntilRecovered = Math.max(0, Math.round(totalRecoveryHours - hoursSince));
  
  // Determine status
  let status: 'fatigued' | 'recovering' | 'recovered';
  let color: string;
  
  if (recoveryPercent >= 80) {
    status = 'recovered';
    color = RECOVERY_COLORS.recovered;
  } else if (recoveryPercent >= 40) {
    status = 'recovering';
    color = RECOVERY_COLORS.recovering;
  } else {
    status = 'fatigued';
    color = RECOVERY_COLORS.fatigued;
  }

  return {
    muscle,
    fatigueScore,
    recoveryPercent,
    status,
    color,
    hoursUntilRecovered,
    lastWorkedDate: new Date(lastWorkout.date),
    volumeScore: volume,
  };
}

/**
 * Calculate recovery for all muscle groups
 */
export function calculateFullBodyRecovery(
  volumeHistory: WorkoutVolumeData[]
): MuscleRecoveryStatus[] {
  const muscles: MuscleGroup[] = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'quads', 'hamstrings', 'glutes', 'calves', 'core'
  ];
  
  return muscles.map(muscle => calculateMuscleRecovery(muscle, volumeHistory));
}

/**
 * Calculate overall readiness score (0-100)
 */
export function calculateReadinessScore(recoveryStatuses: MuscleRecoveryStatus[]): number {
  if (recoveryStatuses.length === 0) return 100;
  
  const avgRecovery = recoveryStatuses.reduce((sum, s) => sum + s.recoveryPercent, 0) / recoveryStatuses.length;
  return Math.round(avgRecovery);
}

/**
 * Get training recommendations based on recovery
 */
export function getTrainingRecommendation(
  recoveryStatuses: MuscleRecoveryStatus[]
): { 
  recommendation: string; 
  readyMuscles: MuscleGroup[]; 
  avoidMuscles: MuscleGroup[];
} {
  const ready = recoveryStatuses.filter(s => s.status === 'recovered');
  const avoid = recoveryStatuses.filter(s => s.status === 'fatigued');
  
  let recommendation: string;
  
  if (avoid.length === 0) {
    recommendation = '💪 All muscles recovered! Full body workout OK.';
  } else if (ready.length >= 3) {
    recommendation = `✓ Train: ${ready.slice(0, 3).map(m => m.muscle).join(', ')}`;
  } else {
    recommendation = '⚠️ Consider a rest day or light cardio.';
  }
  
  return {
    recommendation,
    readyMuscles: ready.map(s => s.muscle),
    avoidMuscles: avoid.map(s => s.muscle),
  };
}

/**
 * Format hours until recovered for display
 */
export function formatRecoveryTime(hours: number): string {
  if (hours <= 0) return 'Recovered';
  if (hours < 1) return 'Almost ready';
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  if (remainingHours === 0) return `${days}d`;
  return `${days}d ${remainingHours}h`;
}

/**
 * Get color interpolated between red/yellow/green based on recovery %
 */
export function getRecoveryColor(recoveryPercent: number): string {
  if (recoveryPercent >= 80) return RECOVERY_COLORS.recovered;
  if (recoveryPercent >= 40) return RECOVERY_COLORS.recovering;
  return RECOVERY_COLORS.fatigued;
}

export default {
  calculateMuscleRecovery,
  calculateFullBodyRecovery,
  calculateReadinessScore,
  getTrainingRecommendation,
  formatRecoveryTime,
  getRecoveryColor,
};
