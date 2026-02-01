/**
 * Exercise Types
 * Types for exercises from ExerciseDB API
 */

export interface Exercise {
  id: string;
  externalId: string | null;
  name: string;
  bodyPart: string | null;
  target: string | null;
  equipment: string | null;
  gifUrl: string | null;
  // Full details (available on single exercise fetch)
  description?: string | null;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
  tips?: string[];
  difficulty?: string;
  category?: string;
}

export interface ExerciseListResponse {
  exercises: Exercise[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Body part emoji mapping for visual display
export const BODY_PART_EMOJIS: Record<string, string> = {
  'back': '🔙',
  'cardio': '❤️',
  'chest': '💪',
  'lower arms': '💪',
  'lower legs': '🦵',
  'neck': '🦒',
  'shoulders': '🏋️',
  'upper arms': '💪',
  'upper legs': '🦵',
  'waist': '🎯',
};

// Equipment icons
export const EQUIPMENT_ICONS: Record<string, string> = {
  'barbell': '🏋️',
  'dumbbell': '🏋️‍♂️',
  'cable': '🔗',
  'kettlebell': '🔔',
  'body weight': '🧘',
  'band': '🎗️',
  'machine': '⚙️',
  'assisted': '🤝',
  'leverage machine': '⚙️',
  'medicine ball': '⚽',
  'stability ball': '🔴',
  'ez barbell': '🏋️',
  'olympic barbell': '🏋️',
  'trap bar': '🏋️',
  'smith machine': '⚙️',
  'bosu ball': '🔵',
  'roller': '🛞',
  'rope': '🪢',
  'sled machine': '🛷',
  'tire': '🛞',
  'weighted': '⚖️',
  'wheel roller': '🛞',
};

// Muscle group colors for visual distinction
export const MUSCLE_GROUP_COLORS: Record<string, string> = {
  // Primary muscles
  'pectoralis major': '#FF6B6B',
  'biceps': '#4ECDC4',
  'triceps': '#45B7D1',
  'deltoids': '#FFA07A',
  'latissimus dorsi': '#98D8C8',
  'quadriceps': '#F7DC6F',
  'hamstrings': '#BB8FCE',
  'glutes': '#F1948A',
  'abs': '#82E0AA',
  'calves': '#85C1E9',
  'traps': '#F8B500',
  'forearms': '#D7BDE2',
  // Target muscles from ExerciseDB
  'abs': '#82E0AA',
  'adductors': '#C39BD3',
  'biceps': '#4ECDC4',
  'calves': '#85C1E9',
  'cardiovascular system': '#F1948A',
  'delts': '#FFA07A',
  'forearms': '#D7BDE2',
  'glutes': '#F1948A',
  'hamstrings': '#BB8FCE',
  'lats': '#98D8C8',
  'levator scapulae': '#AED6F1',
  'pectorals': '#FF6B6B',
  'quads': '#F7DC6F',
  'serratus anterior': '#ABEBC6',
  'spine': '#D5DBDB',
  'traps': '#F8B500',
  'triceps': '#45B7D1',
  'upper back': '#A9CCE3',
};
