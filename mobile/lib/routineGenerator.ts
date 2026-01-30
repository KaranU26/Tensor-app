/**
 * Routine Generator
 * Creates personalized workout routines based on equipment, days, and goals
 */

// Types
export type Equipment = 'barbell' | 'dumbbells' | 'machines' | 'cables' | 'bodyweight';
export type Goal = 'build_muscle' | 'get_stronger' | 'general_fitness';
export type Split = 'full_body' | 'upper_lower' | 'ppl' | 'bro_split';

export interface RoutineConfig {
  equipment: Equipment[];
  daysPerWeek: number;
  goal: Goal;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface ExerciseTemplate {
  name: string;
  sets: number;
  reps: string; // "8-12" or "5"
  equipment: Equipment[];
  primaryMuscles: string[];
  category: 'push' | 'pull' | 'legs' | 'core';
}

export interface WorkoutDay {
  name: string;
  exercises: ExerciseTemplate[];
}

export interface GeneratedRoutine {
  name: string;
  description: string;
  split: Split;
  days: WorkoutDay[];
}

// Exercise database (simplified)
const EXERCISE_DB: ExerciseTemplate[] = [
  // Push
  { name: 'Barbell Bench Press', sets: 4, reps: '6-8', equipment: ['barbell'], primaryMuscles: ['chest', 'triceps'], category: 'push' },
  { name: 'Dumbbell Bench Press', sets: 3, reps: '8-12', equipment: ['dumbbells'], primaryMuscles: ['chest', 'triceps'], category: 'push' },
  { name: 'Overhead Press', sets: 3, reps: '6-8', equipment: ['barbell'], primaryMuscles: ['shoulders'], category: 'push' },
  { name: 'Dumbbell Shoulder Press', sets: 3, reps: '8-12', equipment: ['dumbbells'], primaryMuscles: ['shoulders'], category: 'push' },
  { name: 'Push-ups', sets: 3, reps: '10-15', equipment: ['bodyweight'], primaryMuscles: ['chest', 'triceps'], category: 'push' },
  { name: 'Incline Dumbbell Press', sets: 3, reps: '8-12', equipment: ['dumbbells'], primaryMuscles: ['chest'], category: 'push' },
  { name: 'Cable Flyes', sets: 3, reps: '12-15', equipment: ['cables'], primaryMuscles: ['chest'], category: 'push' },
  { name: 'Tricep Pushdowns', sets: 3, reps: '10-12', equipment: ['cables'], primaryMuscles: ['triceps'], category: 'push' },
  { name: 'Chest Press Machine', sets: 3, reps: '10-12', equipment: ['machines'], primaryMuscles: ['chest'], category: 'push' },
  { name: 'Lateral Raises', sets: 3, reps: '12-15', equipment: ['dumbbells'], primaryMuscles: ['shoulders'], category: 'push' },

  // Pull
  { name: 'Barbell Rows', sets: 4, reps: '6-8', equipment: ['barbell'], primaryMuscles: ['back', 'biceps'], category: 'pull' },
  { name: 'Dumbbell Rows', sets: 3, reps: '8-12', equipment: ['dumbbells'], primaryMuscles: ['back', 'biceps'], category: 'pull' },
  { name: 'Pull-ups', sets: 3, reps: '6-10', equipment: ['bodyweight'], primaryMuscles: ['back', 'biceps'], category: 'pull' },
  { name: 'Lat Pulldowns', sets: 3, reps: '8-12', equipment: ['cables', 'machines'], primaryMuscles: ['back'], category: 'pull' },
  { name: 'Seated Cable Rows', sets: 3, reps: '10-12', equipment: ['cables'], primaryMuscles: ['back'], category: 'pull' },
  { name: 'Face Pulls', sets: 3, reps: '12-15', equipment: ['cables'], primaryMuscles: ['rear delts'], category: 'pull' },
  { name: 'Barbell Curls', sets: 3, reps: '8-12', equipment: ['barbell'], primaryMuscles: ['biceps'], category: 'pull' },
  { name: 'Dumbbell Curls', sets: 3, reps: '10-12', equipment: ['dumbbells'], primaryMuscles: ['biceps'], category: 'pull' },
  { name: 'Deadlifts', sets: 4, reps: '5', equipment: ['barbell'], primaryMuscles: ['back', 'hamstrings'], category: 'pull' },

  // Legs
  { name: 'Barbell Squats', sets: 4, reps: '6-8', equipment: ['barbell'], primaryMuscles: ['quads', 'glutes'], category: 'legs' },
  { name: 'Goblet Squats', sets: 3, reps: '10-12', equipment: ['dumbbells'], primaryMuscles: ['quads', 'glutes'], category: 'legs' },
  { name: 'Leg Press', sets: 3, reps: '10-12', equipment: ['machines'], primaryMuscles: ['quads', 'glutes'], category: 'legs' },
  { name: 'Romanian Deadlifts', sets: 3, reps: '8-10', equipment: ['barbell', 'dumbbells'], primaryMuscles: ['hamstrings', 'glutes'], category: 'legs' },
  { name: 'Lunges', sets: 3, reps: '10 each', equipment: ['bodyweight', 'dumbbells'], primaryMuscles: ['quads', 'glutes'], category: 'legs' },
  { name: 'Leg Curls', sets: 3, reps: '10-12', equipment: ['machines'], primaryMuscles: ['hamstrings'], category: 'legs' },
  { name: 'Leg Extensions', sets: 3, reps: '12-15', equipment: ['machines'], primaryMuscles: ['quads'], category: 'legs' },
  { name: 'Calf Raises', sets: 3, reps: '15-20', equipment: ['bodyweight', 'machines'], primaryMuscles: ['calves'], category: 'legs' },
  { name: 'Hip Thrusts', sets: 3, reps: '10-12', equipment: ['barbell'], primaryMuscles: ['glutes'], category: 'legs' },

  // Core
  { name: 'Planks', sets: 3, reps: '30-60s', equipment: ['bodyweight'], primaryMuscles: ['core'], category: 'core' },
  { name: 'Hanging Leg Raises', sets: 3, reps: '10-15', equipment: ['bodyweight'], primaryMuscles: ['core'], category: 'core' },
  { name: 'Cable Crunches', sets: 3, reps: '12-15', equipment: ['cables'], primaryMuscles: ['core'], category: 'core' },
  { name: 'Ab Wheel Rollouts', sets: 3, reps: '8-12', equipment: ['bodyweight'], primaryMuscles: ['core'], category: 'core' },
];

/**
 * Filter exercises by available equipment
 */
function filterByEquipment(exercises: ExerciseTemplate[], equipment: Equipment[]): ExerciseTemplate[] {
  return exercises.filter((ex) =>
    ex.equipment.some((eq) => equipment.includes(eq))
  );
}

/**
 * Pick exercises for a category
 */
function pickExercises(
  exercises: ExerciseTemplate[],
  category: 'push' | 'pull' | 'legs' | 'core',
  count: number
): ExerciseTemplate[] {
  const filtered = exercises.filter((ex) => ex.category === category);
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Determine split based on days per week
 */
function determineSplit(days: number): Split {
  if (days <= 3) return 'full_body';
  if (days === 4) return 'upper_lower';
  return 'ppl'; // 5-6 days
}

/**
 * Generate Full Body routine
 */
function generateFullBody(exercises: ExerciseTemplate[], days: number): WorkoutDay[] {
  const dayNames = ['Day A', 'Day B', 'Day C'];
  const result: WorkoutDay[] = [];

  for (let i = 0; i < days; i++) {
    result.push({
      name: dayNames[i] || `Day ${i + 1}`,
      exercises: [
        ...pickExercises(exercises, 'legs', 2),
        ...pickExercises(exercises, 'push', 2),
        ...pickExercises(exercises, 'pull', 2),
        ...pickExercises(exercises, 'core', 1),
      ],
    });
  }

  return result;
}

/**
 * Generate Upper/Lower split
 */
function generateUpperLower(exercises: ExerciseTemplate[]): WorkoutDay[] {
  return [
    {
      name: 'Upper A',
      exercises: [
        ...pickExercises(exercises, 'push', 3),
        ...pickExercises(exercises, 'pull', 3),
      ],
    },
    {
      name: 'Lower A',
      exercises: [
        ...pickExercises(exercises, 'legs', 5),
        ...pickExercises(exercises, 'core', 1),
      ],
    },
    {
      name: 'Upper B',
      exercises: [
        ...pickExercises(exercises, 'push', 3),
        ...pickExercises(exercises, 'pull', 3),
      ],
    },
    {
      name: 'Lower B',
      exercises: [
        ...pickExercises(exercises, 'legs', 5),
        ...pickExercises(exercises, 'core', 1),
      ],
    },
  ];
}

/**
 * Generate Push/Pull/Legs split
 */
function generatePPL(exercises: ExerciseTemplate[]): WorkoutDay[] {
  return [
    {
      name: 'Push',
      exercises: pickExercises(exercises, 'push', 6),
    },
    {
      name: 'Pull',
      exercises: pickExercises(exercises, 'pull', 6),
    },
    {
      name: 'Legs',
      exercises: [
        ...pickExercises(exercises, 'legs', 5),
        ...pickExercises(exercises, 'core', 1),
      ],
    },
    {
      name: 'Push 2',
      exercises: pickExercises(exercises, 'push', 5),
    },
    {
      name: 'Pull 2',
      exercises: pickExercises(exercises, 'pull', 5),
    },
    {
      name: 'Legs 2',
      exercises: [
        ...pickExercises(exercises, 'legs', 5),
        ...pickExercises(exercises, 'core', 1),
      ],
    },
  ];
}

/**
 * Main routine generator
 */
export function generateRoutine(config: RoutineConfig): GeneratedRoutine {
  const { equipment, daysPerWeek, goal } = config;
  
  // Filter exercises by available equipment
  const availableExercises = filterByEquipment(EXERCISE_DB, equipment);
  
  // Determine split
  const split = determineSplit(daysPerWeek);
  
  // Generate days
  let days: WorkoutDay[];
  switch (split) {
    case 'full_body':
      days = generateFullBody(availableExercises, daysPerWeek);
      break;
    case 'upper_lower':
      days = generateUpperLower(availableExercises);
      break;
    case 'ppl':
      days = generatePPL(availableExercises).slice(0, daysPerWeek);
      break;
    default:
      days = generateFullBody(availableExercises, daysPerWeek);
  }

  // Adjust sets/reps based on goal
  if (goal === 'get_stronger') {
    days = days.map((day) => ({
      ...day,
      exercises: day.exercises.map((ex) => ({
        ...ex,
        sets: Math.min(ex.sets + 1, 5),
        reps: ex.reps.includes('-') ? '4-6' : '5',
      })),
    }));
  } else if (goal === 'build_muscle') {
    days = days.map((day) => ({
      ...day,
      exercises: day.exercises.map((ex) => ({
        ...ex,
        reps: '8-12',
      })),
    }));
  }

  // Generate name
  const splitNames: Record<Split, string> = {
    full_body: 'Full Body',
    upper_lower: 'Upper/Lower',
    ppl: 'Push Pull Legs',
    bro_split: 'Bro Split',
  };

  return {
    name: `${daysPerWeek}-Day ${splitNames[split]}`,
    description: `A ${daysPerWeek}-day ${splitNames[split].toLowerCase()} program optimized for ${goal.replace('_', ' ')}.`,
    split,
    days,
  };
}

export default generateRoutine;
