import { fetchWithAuth } from './fetchWithAuth';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  reps?: number;
  weight?: number;
  weightUnit: string;
  setType: string;
  rpe?: number;
  isPr: boolean;
  completed: boolean;
  restSeconds?: number;
  durationSeconds?: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  positionOrder: number;
  notes?: string;
  exercise: {
    id: string;
    name: string;
    bodyPart?: string;
    target?: string;
    equipment?: string;
    gifUrl?: string;
  };
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  name?: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  notes?: string;
  totalVolume?: number;
  exercises: WorkoutExercise[];
}

export async function startWorkout(name?: string): Promise<Workout> {
  const response = await fetchWithAuth('/strength/workouts', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error('Failed to start workout');
  const data = await response.json();
  return data.workout;
}

export async function getWorkout(id: string): Promise<Workout> {
  const response = await fetchWithAuth(`/strength/workouts/${id}`);
  if (!response.ok) throw new Error('Failed to fetch workout');
  const data = await response.json();
  return data.workout;
}

export async function addExerciseToWorkout(
  workoutId: string,
  exerciseId: string
): Promise<WorkoutExercise> {
  const response = await fetchWithAuth(`/strength/workouts/${workoutId}/exercises`, {
    method: 'POST',
    body: JSON.stringify({ exerciseId }),
  });
  if (!response.ok) throw new Error('Failed to add exercise');
  const data = await response.json();
  return data.exercise;
}

export async function addSet(
  workoutExerciseId: string,
  data: { weight?: number; reps?: number; weightUnit?: string; rpe?: number }
): Promise<WorkoutSet> {
  const response = await fetchWithAuth(`/strength/workout-exercises/${workoutExerciseId}/sets`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add set');
  const result = await response.json();
  return result.set;
}

export async function deleteSet(setId: string): Promise<void> {
  const response = await fetchWithAuth(`/strength/sets/${setId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete set');
}

export async function finishWorkout(
  workoutId: string,
  notes?: string
): Promise<Workout> {
  const response = await fetchWithAuth(`/strength/workouts/${workoutId}`, {
    method: 'PATCH',
    body: JSON.stringify({ finish: true, notes }),
  });
  if (!response.ok) throw new Error('Failed to finish workout');
  const data = await response.json();
  return data.workout;
}

// --- Stats & Analytics ---

export interface DashboardStats {
  totalWorkouts: number;
  weekWorkouts: number;
  weekDurationMinutes: number;
  weekVolume: number;
  weekCalories: number;
  weekStretchingSessions: number;
  personalRecords: number;
  currentStreak: number;
}

export interface StrengthStats {
  totalWorkouts: number;
  weekWorkouts: number;
  totalVolume: number;
  weekVolume: number;
  personalRecords: number;
}

export interface MuscleVolumeData {
  muscleVolume: Record<string, number>;
  periodDays: number;
  totalSets: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetchWithAuth('/strength/dashboard');
  if (!response.ok) throw new Error('Failed to fetch dashboard stats');
  return response.json();
}

export async function getStrengthStats(): Promise<StrengthStats> {
  const response = await fetchWithAuth('/strength/stats');
  if (!response.ok) throw new Error('Failed to fetch strength stats');
  return response.json();
}

export async function getMuscleVolume(days: number = 7): Promise<MuscleVolumeData> {
  const response = await fetchWithAuth(`/strength/muscle-volume?days=${days}`);
  if (!response.ok) throw new Error('Failed to fetch muscle volume');
  return response.json();
}

export async function getPersonalRecords(): Promise<{ personalRecords: any[] }> {
  const response = await fetchWithAuth('/strength/personal-records');
  if (!response.ok) throw new Error('Failed to fetch personal records');
  return response.json();
}

export async function getWorkoutHistory(
  limit: number = 20,
  offset: number = 0
): Promise<{ workouts: Workout[] }> {
  const response = await fetchWithAuth(`/strength/workouts?limit=${limit}&offset=${offset}`);
  if (!response.ok) throw new Error('Failed to fetch workout history');
  return response.json();
}
