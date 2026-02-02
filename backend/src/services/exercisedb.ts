/**
 * ExerciseDB API Client
 * Fetches exercises from RapidAPI ExerciseDB
 */

import fetch from 'node-fetch';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'exercisedb.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

export interface ExerciseDBExercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
  gifUrl?: string;
  // Additional fields from upgraded API tier
  description?: string;
  difficulty?: string;
  category?: string;
}

interface ExerciseDBResponse extends Array<ExerciseDBExercise> {}

/**
 * Fetch all exercises from ExerciseDB
 * Note: This fetches ALL exercises in one call (API supports it)
 */
export async function fetchAllExercises(): Promise<ExerciseDBExercise[]> {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY environment variable is not set');
  }

  console.log('Fetching all exercises from ExerciseDB...');
  
  const response = await fetch(`${BASE_URL}/exercises?limit=0`, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    throw new Error(`ExerciseDB API error: ${response.status} ${response.statusText}`);
  }

  const exercises = await response.json() as ExerciseDBResponse;
  console.log(`Fetched ${exercises.length} exercises from ExerciseDB`);
  
  return exercises;
}

/**
 * Fetch exercises by body part
 */
export async function fetchExercisesByBodyPart(bodyPart: string): Promise<ExerciseDBExercise[]> {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY environment variable is not set');
  }

  const response = await fetch(`${BASE_URL}/exercises/bodyPart/${encodeURIComponent(bodyPart)}`, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    throw new Error(`ExerciseDB API error: ${response.status} ${response.statusText}`);
  }

  return await response.json() as ExerciseDBResponse;
}

/**
 * Fetch list of all body parts
 */
export async function fetchBodyParts(): Promise<string[]> {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY environment variable is not set');
  }

  const response = await fetch(`${BASE_URL}/exercises/bodyPartList`, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    throw new Error(`ExerciseDB API error: ${response.status} ${response.statusText}`);
  }

  return await response.json() as string[];
}

/**
 * Fetch list of all target muscles
 */
export async function fetchTargetMuscles(): Promise<string[]> {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY environment variable is not set');
  }

  const response = await fetch(`${BASE_URL}/exercises/targetList`, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    throw new Error(`ExerciseDB API error: ${response.status} ${response.statusText}`);
  }

  return await response.json() as string[];
}

/**
 * Fetch list of all equipment types
 */
export async function fetchEquipmentList(): Promise<string[]> {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY environment variable is not set');
  }

  const response = await fetch(`${BASE_URL}/exercises/equipmentList`, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    throw new Error(`ExerciseDB API error: ${response.status} ${response.statusText}`);
  }

  return await response.json() as string[];
}
