// Shared types between mobile and backend

// ============================================
// AUTH
// ============================================

export interface User {
  id: string;
  email: string;
  username?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ============================================
// STRETCHING
// ============================================

export interface Stretch {
  id: string;
  name: string;
  description?: string;
  durationSeconds: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  instructions?: string;
  tips?: string[];
  commonMistakes?: string[];
  equipment?: string[];
  tags?: string[];
}

export interface StretchingRoutine {
  id: string;
  name: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationSeconds: number;
  targetAreas?: string[];
  tags?: string[];
  isPublic: boolean;
  isSystem: boolean;
  usesCount: number;
  stretches: RoutineStretch[];
}

export interface RoutineStretch {
  id: string;
  stretchId: string;
  positionOrder: number;
  customDurationSeconds?: number;
  stretch?: Stretch;
}

export interface StretchingSession {
  id: string;
  routineId?: string;
  routineName?: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  completed: boolean;
  stretches: SessionStretch[];
}

export interface SessionStretch {
  id: string;
  stretchId: string;
  heldDurationSeconds: number;
  feltTight: boolean;
  positionInRoutine: number;
}

// ============================================
// STRENGTH TRAINING
// ============================================

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: 'barbell' | 'dumbbell' | 'machine' | 'bodyweight' | 'cable' | 'kettlebell';
  equipmentNeeded?: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string;
  tips?: string[];
  commonMistakes?: string[];
  isCompound: boolean;
  isUnilateral: boolean;
}

export interface StrengthWorkout {
  id: string;
  name?: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  sessionIntensityRpe?: number;
  notes?: string;
  totalVolume?: number;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise?: Exercise;
  positionOrder: number;
  notes?: string;
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  reps?: number;
  weight?: number;
  weightUnit: 'lbs' | 'kg';
  setType: 'warmup' | 'normal' | 'dropset' | 'failure' | 'amrap';
  rpe?: number;
  isPr: boolean;
  completed: boolean;
  restSeconds?: number;
  durationSeconds?: number;
  distanceMeters?: number;
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  recordType: '1rm' | '3rm' | '5rm' | 'max_reps' | 'max_weight';
  value: number;
  weightUnit: 'lbs' | 'kg';
  achievedAt: string;
}

// ============================================
// FLEXIBILITY GOALS
// ============================================

export type FlexibilityGoalType = 
  | 'achieve_full_splits'
  | 'touch_toes'
  | 'improve_hamstring_rom'
  | 'improve_hip_mobility'
  | 'shoulder_mobility'
  | 'general_flexibility'
  | 'sport_specific'
  | 'injury_rehab';

export type GoalStatus = 'active' | 'paused' | 'completed' | 'failed';

export interface FlexibilityGoal {
  id: string;
  goalType: FlexibilityGoalType;
  description?: string;
  targetArea: string;
  baselineRom?: number;
  targetRom?: number;
  targetDate?: string;
  status: GoalStatus;
  currentProgress?: number;
  measurements: RomMeasurement[];
}

export interface RomMeasurement {
  id: string;
  romDegrees: number;
  measurementDate: string;
  measurementMethod?: 'video_comparison' | 'measurement' | 'self_assessment';
  notes?: string;
}

// ============================================
// BODY METRICS
// ============================================

export interface BodyMetric {
  id: string;
  weight?: number;
  weightUnit: 'lbs' | 'kg';
  bodyFatPercentage?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  measurementUnit: 'inches' | 'cm';
  measurementDate: string;
  notes?: string;
}

// ============================================
// SUBSCRIPTION
// ============================================

export type PlanType = 'free' | 'pro_monthly' | 'pro_yearly' | 'lifetime';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'paused';

export interface Subscription {
  planType: PlanType;
  status: SubscriptionStatus;
  expiresAt?: string;
}

// ============================================
// ONBOARDING
// ============================================

export type FitnessGoal = 'build_muscle' | 'flexibility' | 'balanced' | 'recovery' | 'athletic';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type FlexibilityLevel = 'tight' | 'moderate' | 'flexible';

export interface UserOnboarding {
  completedAt?: string;
  skipped: boolean;
  primaryGoal?: FitnessGoal;
  experienceLevel?: ExperienceLevel;
  toeTouchScore?: number;
  shoulderReachScore?: number;
  hipFlexibilityScore?: number;
  overallFlexibilityScore?: number;
  flexibilityLevel?: FlexibilityLevel;
  workoutDays?: string[];
  preferredWorkoutTime?: string;
  stretchingPreference?: string;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
    timestamp: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
