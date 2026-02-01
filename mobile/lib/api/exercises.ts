/**
 * Exercises API Client
 * Fetches exercises from our backend (cached from ExerciseDB)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise, ExerciseListResponse } from '@/types/exercise';
import { API_URL } from '@/config/api';

// Use shared API URL from config

const CACHE_KEYS = {
  EXERCISES: 'exercises_cache',
  BODY_PARTS: 'body_parts_cache',
  TARGETS: 'targets_cache',
  EQUIPMENT: 'equipment_cache',
  LAST_SYNC: 'exercises_last_sync',
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if cache is still valid
 */
async function isCacheValid(): Promise<boolean> {
  try {
    const lastSync = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
    if (!lastSync) return false;
    
    const syncTime = parseInt(lastSync, 10);
    return Date.now() - syncTime < CACHE_DURATION;
  } catch {
    return false;
  }
}

/**
 * Fetch exercises with pagination and filters
 */
export async function fetchExercises(params?: {
  page?: number;
  limit?: number;
  bodyPart?: string;
  target?: string;
  equipment?: string;
  search?: string;
}): Promise<ExerciseListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.bodyPart) searchParams.set('bodyPart', params.bodyPart);
  if (params?.target) searchParams.set('target', params.target);
  if (params?.equipment) searchParams.set('equipment', params.equipment);
  if (params?.search) searchParams.set('search', params.search);

  const url = `${API_URL}/exercises?${searchParams.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
}

/**
 * Fetch single exercise by ID
 */
export async function fetchExerciseById(id: string): Promise<Exercise> {
  try {
    const response = await fetch(`${API_URL}/exercises/${id}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching exercise:', error);
    throw error;
  }
}

/**
 * Fetch all body parts
 */
export async function fetchBodyParts(): Promise<string[]> {
  // Try cache first
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.BODY_PARTS);
    if (cached && await isCacheValid()) {
      return JSON.parse(cached);
    }
  } catch {}

  try {
    const response = await fetch(`${API_URL}/exercises/body-parts`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    
    // Cache the response
    await AsyncStorage.setItem(CACHE_KEYS.BODY_PARTS, JSON.stringify(data));
    await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
    
    return data;
  } catch (error) {
    console.error('Error fetching body parts:', error);
    throw error;
  }
}

/**
 * Fetch all target muscles
 */
export async function fetchTargetMuscles(): Promise<string[]> {
  // Try cache first
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.TARGETS);
    if (cached && await isCacheValid()) {
      return JSON.parse(cached);
    }
  } catch {}

  try {
    const response = await fetch(`${API_URL}/exercises/targets`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    
    // Cache the response
    await AsyncStorage.setItem(CACHE_KEYS.TARGETS, JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Error fetching targets:', error);
    throw error;
  }
}

/**
 * Fetch all equipment types
 */
export async function fetchEquipmentTypes(): Promise<string[]> {
  // Try cache first
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.EQUIPMENT);
    if (cached && await isCacheValid()) {
      return JSON.parse(cached);
    }
  } catch {}

  try {
    const response = await fetch(`${API_URL}/exercises/equipment`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    
    // Cache the response
    await AsyncStorage.setItem(CACHE_KEYS.EQUIPMENT, JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Error fetching equipment:', error);
    throw error;
  }
}

/**
 * Fetch exercises by body part
 */
export async function fetchExercisesByBodyPart(bodyPart: string): Promise<Exercise[]> {
  try {
    const response = await fetch(`${API_URL}/exercises/body-part/${encodeURIComponent(bodyPart)}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching exercises by body part:', error);
    throw error;
  }
}

/**
 * Fetch exercises by target muscle
 */
export async function fetchExercisesByTarget(target: string): Promise<Exercise[]> {
  try {
    const response = await fetch(`${API_URL}/exercises/target/${encodeURIComponent(target)}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching exercises by target:', error);
    throw error;
  }
}
