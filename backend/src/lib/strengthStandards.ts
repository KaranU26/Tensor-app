/**
 * Strength Standards Engine
 * 
 * Based on OpenPowerlifting data research methodology:
 * - Percentile-based strength standards by sex and weight class
 * - 1RM calculation using multiple formulas (Epley, Brzycki, Lander)
 * - Relative strength scoring (Wilks, DOTS)
 */

// ============================================
// 1RM CALCULATION FORMULAS
// ============================================

interface OneRepMaxResult {
  epley: number;
  brzycki: number;
  lander: number;
  average: number;
}

/**
 * Calculate estimated 1RM using multiple formulas
 * Based on research recommendation to average formulas for accuracy
 */
export function calculate1RM(weight: number, reps: number): OneRepMaxResult {
  if (reps <= 0) {
    return { epley: weight, brzycki: weight, lander: weight, average: weight };
  }
  
  if (reps === 1) {
    return { epley: weight, brzycki: weight, lander: weight, average: weight };
  }

  // Epley Formula: 1RM = w × (1 + r/30)
  const epley = weight * (1 + reps / 30);
  
  // Brzycki Formula: 1RM = w × 36 / (37 - r)
  const brzycki = reps < 37 ? weight * (36 / (37 - reps)) : weight * 1.5;
  
  // Lander Formula: 1RM = 100 × w / (101.3 - 2.67123 × r)
  const lander = (100 * weight) / (101.3 - 2.67123 * reps);
  
  // Average for most accurate estimate
  const average = (epley + brzycki + lander) / 3;
  
  return {
    epley: Math.round(epley * 10) / 10,
    brzycki: Math.round(brzycki * 10) / 10,
    lander: Math.round(lander * 10) / 10,
    average: Math.round(average * 10) / 10,
  };
}

// ============================================
// RELATIVE STRENGTH SCORES
// ============================================

type Sex = 'male' | 'female';

/**
 * Calculate Wilks Score
 * Traditional formula for comparing lifters of different weights
 */
export function calculateWilks(totalKg: number, bodyweightKg: number, sex: Sex): number {
  // Wilks coefficients (updated 2020)
  const maleCoeffs = [-216.0475144, 16.2606339, -0.002388645, -0.00113732, 7.01863e-6, -1.291e-8];
  const femaleCoeffs = [594.31747775582, -27.23842536447, 0.82112226871, -0.00930733913, 4.731582e-5, -9.054e-8];
  
  const coeffs = sex === 'male' ? maleCoeffs : femaleCoeffs;
  const x = bodyweightKg;
  
  const denominator = 
    coeffs[0] + 
    coeffs[1] * x + 
    coeffs[2] * Math.pow(x, 2) + 
    coeffs[3] * Math.pow(x, 3) + 
    coeffs[4] * Math.pow(x, 4) + 
    coeffs[5] * Math.pow(x, 5);
  
  const wilksCoeff = 500 / denominator;
  return Math.round(totalKg * wilksCoeff * 100) / 100;
}

/**
 * Calculate DOTS Score
 * Modern replacement for Wilks, less biased against middle-weight classes
 */
export function calculateDOTS(totalKg: number, bodyweightKg: number, sex: Sex): number {
  // DOTS coefficients
  const maleCoeffs = [-307.75076, 24.0900756, -0.1918759221, 0.0007391293, -0.000001093];
  const femaleCoeffs = [-57.96288, 13.6175032, -0.1126655495, 0.0005158568, -0.0000010706];
  
  const coeffs = sex === 'male' ? maleCoeffs : femaleCoeffs;
  const x = bodyweightKg;
  
  const denominator = 
    coeffs[0] + 
    coeffs[1] * x + 
    coeffs[2] * Math.pow(x, 2) + 
    coeffs[3] * Math.pow(x, 3) + 
    coeffs[4] * Math.pow(x, 4);
  
  const dotsCoeff = 500 / denominator;
  return Math.round(totalKg * dotsCoeff * 100) / 100;
}

// ============================================
// STRENGTH STANDARDS (Percentile-based)
// ============================================

// Pre-computed percentile tables based on OpenPowerlifting methodology
// Values in kg for raw lifters
const strengthStandards = {
  male: {
    bench: {
      '60': { beginner: 40, novice: 55, intermediate: 75, advanced: 100, elite: 130 },
      '67.5': { beginner: 45, novice: 62, intermediate: 85, advanced: 112, elite: 145 },
      '75': { beginner: 52, novice: 70, intermediate: 95, advanced: 125, elite: 160 },
      '82.5': { beginner: 57, novice: 77, intermediate: 105, advanced: 137, elite: 175 },
      '90': { beginner: 62, novice: 85, intermediate: 115, advanced: 150, elite: 190 },
      '100': { beginner: 67, novice: 92, intermediate: 125, advanced: 162, elite: 205 },
      '110': { beginner: 72, novice: 100, intermediate: 135, advanced: 175, elite: 220 },
      '125': { beginner: 77, novice: 107, intermediate: 145, advanced: 187, elite: 235 },
      '140+': { beginner: 82, novice: 115, intermediate: 155, advanced: 200, elite: 250 },
    },
    squat: {
      '60': { beginner: 55, novice: 75, intermediate: 105, advanced: 140, elite: 180 },
      '67.5': { beginner: 65, novice: 87, intermediate: 120, advanced: 160, elite: 205 },
      '75': { beginner: 72, novice: 97, intermediate: 135, advanced: 180, elite: 230 },
      '82.5': { beginner: 80, novice: 107, intermediate: 150, advanced: 197, elite: 250 },
      '90': { beginner: 87, novice: 117, intermediate: 165, advanced: 215, elite: 275 },
      '100': { beginner: 95, novice: 127, intermediate: 180, advanced: 235, elite: 300 },
      '110': { beginner: 102, novice: 137, intermediate: 195, advanced: 255, elite: 325 },
      '125': { beginner: 110, novice: 147, intermediate: 210, advanced: 275, elite: 350 },
      '140+': { beginner: 117, novice: 157, intermediate: 225, advanced: 295, elite: 375 },
    },
    deadlift: {
      '60': { beginner: 65, novice: 90, intermediate: 125, advanced: 165, elite: 210 },
      '67.5': { beginner: 75, novice: 102, intermediate: 140, advanced: 185, elite: 235 },
      '75': { beginner: 85, novice: 115, intermediate: 160, advanced: 210, elite: 265 },
      '82.5': { beginner: 92, novice: 125, intermediate: 175, advanced: 230, elite: 290 },
      '90': { beginner: 100, novice: 137, intermediate: 190, advanced: 250, elite: 320 },
      '100': { beginner: 110, novice: 150, intermediate: 210, advanced: 275, elite: 350 },
      '110': { beginner: 117, novice: 162, intermediate: 225, advanced: 295, elite: 375 },
      '125': { beginner: 125, novice: 172, intermediate: 240, advanced: 315, elite: 400 },
      '140+': { beginner: 132, novice: 182, intermediate: 255, advanced: 335, elite: 425 },
    },
  },
  female: {
    bench: {
      '44': { beginner: 15, novice: 22, intermediate: 35, advanced: 50, elite: 70 },
      '48': { beginner: 17, novice: 25, intermediate: 40, advanced: 55, elite: 77 },
      '52': { beginner: 20, novice: 30, intermediate: 45, advanced: 62, elite: 85 },
      '56': { beginner: 22, novice: 32, intermediate: 50, advanced: 67, elite: 92 },
      '60': { beginner: 25, novice: 37, intermediate: 55, advanced: 75, elite: 100 },
      '67.5': { beginner: 27, novice: 42, intermediate: 60, advanced: 82, elite: 110 },
      '75': { beginner: 30, novice: 47, intermediate: 67, advanced: 90, elite: 120 },
      '82.5': { beginner: 32, novice: 50, intermediate: 72, advanced: 97, elite: 130 },
      '90+': { beginner: 35, novice: 55, intermediate: 80, advanced: 107, elite: 140 },
    },
    squat: {
      '44': { beginner: 30, novice: 45, intermediate: 65, advanced: 90, elite: 120 },
      '48': { beginner: 35, novice: 52, intermediate: 75, advanced: 102, elite: 135 },
      '52': { beginner: 40, novice: 57, intermediate: 85, advanced: 112, elite: 150 },
      '56': { beginner: 45, novice: 65, intermediate: 92, advanced: 125, elite: 165 },
      '60': { beginner: 50, novice: 72, intermediate: 102, advanced: 137, elite: 180 },
      '67.5': { beginner: 55, novice: 80, intermediate: 112, advanced: 150, elite: 200 },
      '75': { beginner: 60, novice: 87, intermediate: 125, advanced: 167, elite: 220 },
      '82.5': { beginner: 65, novice: 95, intermediate: 135, advanced: 180, elite: 240 },
      '90+': { beginner: 72, novice: 105, intermediate: 150, advanced: 200, elite: 265 },
    },
    deadlift: {
      '44': { beginner: 40, novice: 55, intermediate: 80, advanced: 110, elite: 145 },
      '48': { beginner: 45, novice: 62, intermediate: 90, advanced: 122, elite: 162 },
      '52': { beginner: 50, novice: 70, intermediate: 100, advanced: 137, elite: 180 },
      '56': { beginner: 55, novice: 77, intermediate: 112, advanced: 150, elite: 200 },
      '60': { beginner: 60, novice: 85, intermediate: 122, advanced: 165, elite: 217 },
      '67.5': { beginner: 67, novice: 95, intermediate: 135, advanced: 182, elite: 240 },
      '75': { beginner: 75, novice: 105, intermediate: 150, advanced: 200, elite: 265 },
      '82.5': { beginner: 80, novice: 115, intermediate: 162, advanced: 217, elite: 287 },
      '90+': { beginner: 90, novice: 127, intermediate: 180, advanced: 240, elite: 315 },
    },
  },
};

type Level = 'untrained' | 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'elite';

interface StrengthLevel {
  level: Level;
  percentile: number;
  nextLevel: Level | null;
  toNextLevel: number | null;
}

/**
 * Get weight class for standards lookup
 */
function getWeightClass(bodyweightKg: number, sex: Sex): string {
  if (sex === 'male') {
    if (bodyweightKg <= 60) return '60';
    if (bodyweightKg <= 67.5) return '67.5';
    if (bodyweightKg <= 75) return '75';
    if (bodyweightKg <= 82.5) return '82.5';
    if (bodyweightKg <= 90) return '90';
    if (bodyweightKg <= 100) return '100';
    if (bodyweightKg <= 110) return '110';
    if (bodyweightKg <= 125) return '125';
    return '140+';
  } else {
    if (bodyweightKg <= 44) return '44';
    if (bodyweightKg <= 48) return '48';
    if (bodyweightKg <= 52) return '52';
    if (bodyweightKg <= 56) return '56';
    if (bodyweightKg <= 60) return '60';
    if (bodyweightKg <= 67.5) return '67.5';
    if (bodyweightKg <= 75) return '75';
    if (bodyweightKg <= 82.5) return '82.5';
    return '90+';
  }
}

/**
 * Determine strength level for a given lift
 */
export function getStrengthLevel(
  liftKg: number,
  lift: 'bench' | 'squat' | 'deadlift',
  bodyweightKg: number,
  sex: Sex
): StrengthLevel {
  const weightClass = getWeightClass(bodyweightKg, sex);
  const standards = strengthStandards[sex][lift][weightClass as keyof typeof strengthStandards.male.bench];
  
  if (!standards) {
    return { level: 'beginner', percentile: 0, nextLevel: 'novice', toNextLevel: null };
  }

  if (liftKg >= standards.elite) {
    return { level: 'elite', percentile: 95, nextLevel: null, toNextLevel: null };
  }
  if (liftKg >= standards.advanced) {
    const progress = (liftKg - standards.advanced) / (standards.elite - standards.advanced);
    return { 
      level: 'advanced', 
      percentile: 75 + Math.round(progress * 20), 
      nextLevel: 'elite', 
      toNextLevel: Math.round(standards.elite - liftKg)
    };
  }
  if (liftKg >= standards.intermediate) {
    const progress = (liftKg - standards.intermediate) / (standards.advanced - standards.intermediate);
    return { 
      level: 'intermediate', 
      percentile: 50 + Math.round(progress * 25), 
      nextLevel: 'advanced', 
      toNextLevel: Math.round(standards.advanced - liftKg)
    };
  }
  if (liftKg >= standards.novice) {
    const progress = (liftKg - standards.novice) / (standards.intermediate - standards.novice);
    return { 
      level: 'novice', 
      percentile: 25 + Math.round(progress * 25), 
      nextLevel: 'intermediate', 
      toNextLevel: Math.round(standards.intermediate - liftKg)
    };
  }
  if (liftKg >= standards.beginner) {
    const progress = (liftKg - standards.beginner) / (standards.novice - standards.beginner);
    return { 
      level: 'beginner', 
      percentile: 5 + Math.round(progress * 20), 
      nextLevel: 'novice', 
      toNextLevel: Math.round(standards.novice - liftKg)
    };
  }
  
  return { 
    level: 'untrained', 
    percentile: 5, 
    nextLevel: 'beginner', 
    toNextLevel: Math.round(standards.beginner - liftKg)
  };
}

// ============================================
// MET-BASED CALORIE CALCULATION
// ============================================

/**
 * Calculate calories burned using MET values from Compendium of Physical Activities
 * Formula: Calories = MET × Weight (kg) × Duration (hours)
 */
export function calculateCalories(
  metValue: number,
  bodyweightKg: number,
  durationMinutes: number
): number {
  const durationHours = durationMinutes / 60;
  const calories = metValue * bodyweightKg * durationHours;
  return Math.round(calories);
}

/**
 * Calculate workout calories with active/rest differentiation
 * Uses higher MET during active time, lower during rest
 */
export function calculateWorkoutCalories(
  activeMinutes: number,
  restMinutes: number,
  bodyweightKg: number,
  intensity: 'light' | 'moderate' | 'vigorous' = 'moderate'
): number {
  const metValues = {
    light: { active: 3.5, rest: 1.3 },
    moderate: { active: 5.0, rest: 1.3 },
    vigorous: { active: 6.0, rest: 1.5 },
  };
  
  const met = metValues[intensity];
  const activeCalories = calculateCalories(met.active, bodyweightKg, activeMinutes);
  const restCalories = calculateCalories(met.rest, bodyweightKg, restMinutes);
  
  return activeCalories + restCalories;
}

export default {
  calculate1RM,
  calculateWilks,
  calculateDOTS,
  getStrengthLevel,
  calculateCalories,
  calculateWorkoutCalories,
};
