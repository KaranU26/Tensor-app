/**
 * Periodization Engine
 * Auto-suggests weights based on previous performance and RPE
 * Implements linear progression with smart deload detection
 */

export interface SetPerformance {
  weight: number;
  reps: number;
  rpe?: number; // 1-10 scale
  isWarmup?: boolean;
}

export interface ExerciseHistory {
  exerciseId: string;
  exerciseName: string;
  sets: SetPerformance[];
  date: Date;
}

export interface WeightSuggestion {
  suggestedWeight: number;
  change: number; // +5, 0, -10, etc.
  changeType: 'increase' | 'maintain' | 'deload';
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface PeriodizationConfig {
  upperBodyIncrement: number; // lbs
  lowerBodyIncrement: number; // lbs
  targetReps: number;
  maxRPE: number;
  deloadPercentage: number;
}

const DEFAULT_CONFIG: PeriodizationConfig = {
  upperBodyIncrement: 5,
  lowerBodyIncrement: 10,
  targetReps: 8,
  maxRPE: 8,
  deloadPercentage: 0.1, // 10%
};

// Exercise category for increment selection
const LOWER_BODY_EXERCISES = [
  'squat', 'deadlift', 'leg press', 'romanian', 'lunge', 'hip thrust',
  'leg curl', 'leg extension', 'calf'
];

function isLowerBodyExercise(exerciseName: string): boolean {
  const name = exerciseName.toLowerCase();
  return LOWER_BODY_EXERCISES.some(ex => name.includes(ex));
}

/**
 * Calculate suggested weight for next set based on previous performance
 */
export function calculateWeightSuggestion(
  lastSet: SetPerformance,
  targetReps: number,
  exerciseName: string,
  config: Partial<PeriodizationConfig> = {}
): WeightSuggestion {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const increment = isLowerBodyExercise(exerciseName)
    ? cfg.lowerBodyIncrement
    : cfg.upperBodyIncrement;

  const { weight, reps, rpe = 7 } = lastSet;

  // Decision tree for progression
  // Case 1: Hit target reps at low RPE → Increase weight
  if (reps >= targetReps && rpe <= cfg.maxRPE) {
    return {
      suggestedWeight: weight + increment,
      change: increment,
      changeType: 'increase',
      reason: `Completed ${reps} reps at RPE ${rpe}. Ready for +${increment} lbs`,
      confidence: rpe <= 7 ? 'high' : 'medium',
    };
  }

  // Case 2: Failed to hit target reps significantly → Deload
  if (reps < targetReps - 2 || rpe >= 10) {
    const deloadAmount = Math.round(weight * cfg.deloadPercentage);
    return {
      suggestedWeight: weight - deloadAmount,
      change: -deloadAmount,
      changeType: 'deload',
      reason: rpe >= 10 
        ? 'Max effort reached. Deload for recovery.'
        : `Only ${reps}/${targetReps} reps. Reduce weight for quality.`,
      confidence: 'high',
    };
  }

  // Case 3: Close to target but high RPE → Maintain
  return {
    suggestedWeight: weight,
    change: 0,
    changeType: 'maintain',
    reason: `${reps} reps at RPE ${rpe}. Maintain weight, aim for easier reps.`,
    confidence: 'medium',
  };
}

/**
 * Calculate suggested weight from exercise history
 */
export function getWeightFromHistory(
  history: ExerciseHistory[],
  exerciseName: string,
  targetReps: number = 8,
  config: Partial<PeriodizationConfig> = {}
): WeightSuggestion | null {
  if (history.length === 0) return null;

  // Get most recent workout for this exercise
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const lastWorkout = sortedHistory[0];
  const workingSets = lastWorkout.sets.filter(s => !s.isWarmup);
  
  if (workingSets.length === 0) return null;

  // Use best set (highest weight with target reps)
  const bestSet = workingSets.reduce((best, current) => {
    if (current.reps >= targetReps && current.weight > best.weight) {
      return current;
    }
    return best;
  }, workingSets[0]);

  return calculateWeightSuggestion(bestSet, targetReps, exerciseName, config);
}

/**
 * Calculate 1RM from a set (Epley formula)
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Calculate weight for target reps from 1RM
 */
export function calculateWeightForReps(oneRM: number, targetReps: number): number {
  // Inverse of Epley formula
  return Math.round(oneRM / (1 + targetReps / 30));
}

/**
 * RPE to percentage table (Mike Tuchscherer's chart)
 * Returns percentage of 1RM for given RPE and reps
 */
const RPE_TABLE: Record<number, Record<number, number>> = {
  10: { 1: 100, 2: 95.5, 3: 92.2, 4: 89.2, 5: 86.3, 6: 83.7, 8: 78.6, 10: 73.9 },
  9.5: { 1: 97.8, 2: 93.9, 3: 90.7, 4: 87.8, 5: 85.0, 6: 82.4, 8: 77.4, 10: 72.3 },
  9: { 1: 95.5, 2: 92.2, 3: 89.2, 4: 86.3, 5: 83.7, 6: 81.1, 8: 75.9, 10: 70.7 },
  8.5: { 1: 93.9, 2: 90.7, 3: 87.8, 4: 85.0, 5: 82.4, 6: 79.9, 8: 74.5, 10: 69.4 },
  8: { 1: 92.2, 2: 89.2, 3: 86.3, 4: 83.7, 5: 81.1, 6: 78.6, 8: 73.3, 10: 68.0 },
  7.5: { 1: 90.7, 2: 87.8, 3: 85.0, 4: 82.4, 5: 79.9, 6: 77.4, 8: 72.0, 10: 66.7 },
  7: { 1: 89.2, 2: 86.3, 3: 83.7, 4: 81.1, 5: 78.6, 6: 76.2, 8: 70.7, 10: 65.3 },
};

/**
 * Get percentage of 1RM for given RPE and reps
 */
export function getRPEPercentage(rpe: number, reps: number): number | null {
  const rpeRow = RPE_TABLE[rpe];
  if (!rpeRow) return null;
  
  // Find closest rep count
  const repCounts = Object.keys(rpeRow).map(Number);
  const closest = repCounts.reduce((prev, curr) =>
    Math.abs(curr - reps) < Math.abs(prev - reps) ? curr : prev
  );
  
  return rpeRow[closest];
}

/**
 * Estimate weight for target RPE and reps given 1RM
 */
export function getWeightForRPE(
  oneRM: number,
  targetRPE: number,
  targetReps: number
): number | null {
  const percentage = getRPEPercentage(targetRPE, targetReps);
  if (!percentage) return null;
  return Math.round(oneRM * (percentage / 100));
}

export default {
  calculateWeightSuggestion,
  getWeightFromHistory,
  calculate1RM,
  calculateWeightForReps,
  getRPEPercentage,
  getWeightForRPE,
};
