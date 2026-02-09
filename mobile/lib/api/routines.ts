/**
 * Routines API Client
 * Fetches workout routines from the backend
 */

import { API_URL } from '@/config/api';
import { fetchWithAuth } from './fetchWithAuth';

export interface RoutineExercise {
  id: string;
  customName?: string;
  exerciseId?: string;
  sets: number;
  reps?: string;
  restSeconds?: number;
  notes?: string;
  exercise?: {
    id: string;
    name: string;
    bodyPart?: string;
    equipment?: string;
    target?: string;
  };
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  category: string;
  durationMinutes: number;
  difficulty: string;
  equipment: string[];
  isPremade: boolean;
  warmup: string[];
  cooldown: string[];
  exercises: RoutineExercise[];
  createdAt: string;
}

export interface RoutineCategory {
  name: string;
  count: number;
}

// Category display info
export const CATEGORY_INFO: Record<string, { emoji: string; label: string; color: string }> = {
  home: { emoji: '🏠', label: 'At Home', color: '#4ECDC4' },
  travel: { emoji: '✈️', label: 'Travel', color: '#45B7D1' },
  dumbbell: { emoji: '💪', label: 'Dumbbells Only', color: '#96CEB4' },
  band: { emoji: '🎗️', label: 'Band', color: '#FFEAA7' },
  cardio: { emoji: '🔥', label: 'Cardio', color: '#FF7675' },
  gym: { emoji: '🏋️', label: 'Gym', color: '#FF6B6B' },
  bodyweight: { emoji: '🤸', label: 'Bodyweight', color: '#74B9FF' },
  suspension: { emoji: '🪢', label: 'Suspension Band', color: '#A29BFE' },
};

/**
 * Fetch all routines with optional filtering
 */
export async function fetchRoutines(params?: {
  category?: string;
  isPremade?: boolean;
  difficulty?: string;
}): Promise<Routine[]> {
  const searchParams = new URLSearchParams();
  
  if (params?.category) searchParams.set('category', params.category);
  if (params?.isPremade !== undefined) searchParams.set('isPremade', String(params.isPremade));
  if (params?.difficulty) searchParams.set('difficulty', params.difficulty);

  const url = `${API_URL}/routines?${searchParams.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching routines:', error);
    throw error;
  }
}

/**
 * Fetch routine categories with counts
 */
export async function fetchRoutineCategories(): Promise<RoutineCategory[]> {
  try {
    const response = await fetch(`${API_URL}/routines/categories`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching routine categories:', error);
    throw error;
  }
}

/**
 * Fetch single routine by ID
 */
export async function fetchRoutineById(id: string): Promise<Routine> {
  try {
    const response = await fetch(`${API_URL}/routines/${id}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching routine:', error);
    throw error;
  }
}

/**
 * Create a new user routine
 */
export async function createRoutine(data: {
  name: string;
  description?: string;
  category: string;
  durationMinutes: number;
  difficulty?: string;
  equipment?: string[];
  exercises?: {
    exerciseId?: string;
    customName?: string;
    sets?: number;
    reps?: string;
    restSeconds?: number;
    notes?: string;
  }[];
}): Promise<Routine> {
  try {
    const response = await fetchWithAuth('/routines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating routine:', error);
    throw error;
  }
}
