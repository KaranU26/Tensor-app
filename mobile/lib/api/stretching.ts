import { fetchWithAuth } from './fetchWithAuth';

export interface SessionStretchData {
  stretchId: string;
  heldSeconds: number;
  feltTight?: boolean;
  position?: number;
}

export interface StretchingSessionData {
  routineId: string;
  durationSeconds: number;
  stretches: SessionStretchData[];
}

export interface StretchingStats {
  period: string;
  totalSessions: number;
  totalMinutes: number;
  uniqueDays: number;
  consistencyPercentage: number;
  currentStreak: number;
  tightAreasIdentified: string[];
}

export async function logStretchingSession(data: StretchingSessionData) {
  const response = await fetchWithAuth('/stretching/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to log stretching session');
  return response.json();
}

export async function getStretchingSessions(params?: { limit?: number; offset?: number }) {
  const query = new URLSearchParams();
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.offset) query.set('offset', params.offset.toString());
  const response = await fetchWithAuth(`/stretching/sessions?${query}`);
  if (!response.ok) throw new Error('Failed to fetch stretching sessions');
  return response.json();
}

export async function getStretchingStats(period: 'week' | 'month' | 'year' = 'week'): Promise<StretchingStats> {
  const response = await fetchWithAuth(`/stretching/stats?period=${period}`);
  if (!response.ok) throw new Error('Failed to fetch stretching stats');
  return response.json();
}

// ============================================
// STRETCHES (Library)
// ============================================

export interface StretchItem {
  id: string;
  name: string;
  description?: string;
  difficulty: string;
  durationSeconds: number;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  tips: string[];
  commonMistakes: string[];
  equipment: string[];
  tags: string[];
}

export async function getStretches(params?: {
  difficulty?: string;
  muscle?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ stretches: StretchItem[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.difficulty) query.set('difficulty', params.difficulty);
  if (params?.muscle) query.set('muscle', params.muscle);
  if (params?.search) query.set('search', params.search);
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.offset) query.set('offset', params.offset.toString());
  const response = await fetchWithAuth(`/stretching/stretches?${query}`);
  if (!response.ok) throw new Error('Failed to fetch stretches');
  return response.json();
}

// ============================================
// ROUTINE CRUD
// ============================================

export interface RoutineStretchInput {
  stretchId: string;
  customDurationSeconds?: number;
}

export interface CreateRoutineData {
  name: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetAreas?: string[];
  tags?: string[];
  isPublic?: boolean;
  stretches: RoutineStretchInput[];
}

export interface UpdateRoutineData {
  name?: string;
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  targetAreas?: string[];
  tags?: string[];
  isPublic?: boolean;
  stretches?: RoutineStretchInput[];
}

export async function createStretchingRoutine(data: CreateRoutineData) {
  const response = await fetchWithAuth('/stretching/routines', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create routine');
  }
  return response.json();
}

export async function updateStretchingRoutine(id: string, data: UpdateRoutineData) {
  const response = await fetchWithAuth(`/stretching/routines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update routine');
  }
  return response.json();
}

export async function deleteStretchingRoutine(id: string) {
  const response = await fetchWithAuth(`/stretching/routines/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete routine');
  }
  return response.json();
}
