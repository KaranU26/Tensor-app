import { fetchWithAuth } from './fetchWithAuth';

export interface BodyMetric {
  id: string;
  weight?: number;
  weightUnit: string;
  bodyFatPercentage?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  measurementUnit: string;
  measurementDate: string;
  notes?: string;
  createdAt: string;
}

export interface CreateBodyMetricData {
  weight?: number;
  weightUnit?: string;
  bodyFatPercentage?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  measurementUnit?: string;
  notes?: string;
}

export async function getBodyMetrics(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ bodyMetrics: BodyMetric[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));

  const response = await fetchWithAuth(`/body-metrics?${searchParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch body metrics');
  return response.json();
}

export async function getLatestBodyMetric(): Promise<{ bodyMetric: BodyMetric | null }> {
  const response = await fetchWithAuth('/body-metrics/latest');
  if (!response.ok) throw new Error('Failed to fetch latest body metric');
  return response.json();
}

export async function createBodyMetric(data: CreateBodyMetricData): Promise<{ bodyMetric: BodyMetric }> {
  const response = await fetchWithAuth('/body-metrics', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create body metric');
  return response.json();
}

export async function updateBodyMetric(
  id: string,
  data: Partial<CreateBodyMetricData>
): Promise<{ bodyMetric: BodyMetric }> {
  const response = await fetchWithAuth(`/body-metrics/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update body metric');
  return response.json();
}

export async function deleteBodyMetric(id: string): Promise<void> {
  const response = await fetchWithAuth(`/body-metrics/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete body metric');
}
