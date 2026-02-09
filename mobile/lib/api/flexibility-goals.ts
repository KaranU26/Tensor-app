import { fetchWithAuth } from './fetchWithAuth';

export interface RomMeasurement {
  id: string;
  romDegrees: number;
  measurementDate: string;
  measurementMethod?: string;
  notes?: string;
}

export interface FlexibilityGoal {
  id: string;
  goalType: string;
  description?: string;
  targetArea: string;
  baselineRom?: number;
  targetRom?: number;
  targetDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  measurements: RomMeasurement[];
}

export async function getFlexibilityGoals(
  status?: string
): Promise<{ goals: FlexibilityGoal[]; total: number }> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);

  const response = await fetchWithAuth(`/flexibility-goals?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch flexibility goals');
  return response.json();
}

export async function createFlexibilityGoal(data: {
  goalType: string;
  description?: string;
  targetArea: string;
  baselineRom?: number;
  targetRom?: number;
  targetDate?: string;
}): Promise<{ goal: FlexibilityGoal }> {
  const response = await fetchWithAuth('/flexibility-goals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create flexibility goal');
  return response.json();
}

export async function updateFlexibilityGoal(
  id: string,
  data: Partial<{
    goalType: string;
    description: string;
    targetArea: string;
    baselineRom: number;
    targetRom: number;
    targetDate: string;
    status: string;
  }>
): Promise<{ goal: FlexibilityGoal }> {
  const response = await fetchWithAuth(`/flexibility-goals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update flexibility goal');
  return response.json();
}

export async function deleteFlexibilityGoal(id: string): Promise<void> {
  const response = await fetchWithAuth(`/flexibility-goals/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete flexibility goal');
}

export async function logRomMeasurement(
  goalId: string,
  data: {
    romDegrees: number;
    measurementMethod?: string;
    notes?: string;
  }
): Promise<{ measurement: RomMeasurement }> {
  const response = await fetchWithAuth(`/flexibility-goals/${goalId}/measurements`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to log ROM measurement');
  return response.json();
}
