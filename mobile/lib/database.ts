/**
 * Offline-First Database Layer
 * Uses Expo SQLite for local persistence with sync capabilities
 */

import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('hevy_training.db');
  
  // Create tables
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    -- Workouts table
    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      server_id TEXT,
      name TEXT NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      notes TEXT,
      synced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Workout exercises
    CREATE TABLE IF NOT EXISTS workout_exercises (
      id TEXT PRIMARY KEY,
      server_id TEXT,
      workout_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      exercise_name TEXT,
      position_order INTEGER DEFAULT 0,
      notes TEXT,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    );
    
    -- Sets
    CREATE TABLE IF NOT EXISTS sets (
      id TEXT PRIMARY KEY,
      server_id TEXT,
      workout_exercise_id TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      weight REAL,
      reps INTEGER,
      rpe REAL,
      duration_seconds INTEGER,
      distance_meters REAL,
      is_warmup INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 1,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE
    );
    
    -- Exercises library (cached from server)
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      primary_muscles TEXT,
      secondary_muscles TEXT,
      equipment TEXT,
      description TEXT,
      cached_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Routines (workout templates)
    CREATE TABLE IF NOT EXISTS routines (
      id TEXT PRIMARY KEY,
      server_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      exercises_json TEXT,
      synced INTEGER DEFAULT 0
    );
    
    -- Sync queue for offline mutations
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      attempts INTEGER DEFAULT 0,
      last_error TEXT
    );
    
    -- Personal records cache
    CREATE TABLE IF NOT EXISTS personal_records (
      id TEXT PRIMARY KEY,
      exercise_id TEXT NOT NULL,
      weight REAL,
      reps INTEGER,
      estimated_1rm REAL,
      achieved_at TEXT,
      synced INTEGER DEFAULT 0
    );
    
    -- Stretching routines cache
    CREATE TABLE IF NOT EXISTS stretching_routines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      difficulty TEXT,
      duration_seconds INTEGER,
      duration_minutes INTEGER,
      category TEXT,
      user_id TEXT,
      is_system INTEGER DEFAULT 0,
      stretches_json TEXT,
      cached_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_workouts_started ON workouts(started_at DESC);
    CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id);
    CREATE INDEX IF NOT EXISTS idx_sets_exercise ON sets(workout_exercise_id);
    CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
  `);
  
  return db;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    return initDatabase();
  }
  return db;
}

// Workout Operations
export async function saveWorkoutLocally(workout: {
  id: string;
  name: string;
  startedAt: Date;
  finishedAt?: Date;
  notes?: string;
}): Promise<void> {
  const database = await getDatabase();
  
  await database.runAsync(
    `INSERT OR REPLACE INTO workouts (id, name, started_at, finished_at, notes, synced, updated_at)
     VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
    [
      workout.id,
      workout.name,
      workout.startedAt.toISOString(),
      workout.finishedAt?.toISOString() || null,
      workout.notes || null,
    ]
  );
}

export async function getLocalWorkouts(limit = 50): Promise<any[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync(
    `SELECT * FROM workouts ORDER BY started_at DESC LIMIT ?`,
    [limit]
  );
  return results;
}

export async function saveSetLocally(set: {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  weight?: number;
  reps?: number;
  rpe?: number;
  isWarmup?: boolean;
}): Promise<void> {
  const database = await getDatabase();
  
  await database.runAsync(
    `INSERT OR REPLACE INTO sets (id, workout_exercise_id, set_number, weight, reps, rpe, is_warmup, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      set.id,
      set.workoutExerciseId,
      set.setNumber,
      set.weight || null,
      set.reps || null,
      set.rpe || null,
      set.isWarmup ? 1 : 0,
    ]
  );
}

// Cache exercises from server
export async function cacheExercises(exercises: any[]): Promise<void> {
  const database = await getDatabase();
  
  for (const exercise of exercises) {
    await database.runAsync(
      `INSERT OR REPLACE INTO exercises (id, name, category, primary_muscles, secondary_muscles, equipment, description, cached_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        exercise.id,
        exercise.name,
        exercise.category,
        JSON.stringify(exercise.primaryMuscles || []),
        JSON.stringify(exercise.secondaryMuscles || []),
        JSON.stringify(exercise.equipment || []),
        exercise.description,
      ]
    );
  }
}

export async function getCachedExercises(): Promise<any[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync(`SELECT * FROM exercises ORDER BY name`);
  return results.map((row: any) => ({
    ...row,
    primaryMuscles: JSON.parse(row.primary_muscles || '[]'),
    secondaryMuscles: JSON.parse(row.secondary_muscles || '[]'),
    equipment: JSON.parse(row.equipment || '[]'),
  }));
}

// Sync queue operations
export async function addToSyncQueue(
  entityType: string,
  entityId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  payload: any
): Promise<void> {
  const database = await getDatabase();
  
  await database.runAsync(
    `INSERT INTO sync_queue (entity_type, entity_id, action, payload) VALUES (?, ?, ?, ?)`,
    [entityType, entityId, action, JSON.stringify(payload)]
  );
}

export async function getPendingSyncItems(): Promise<any[]> {
  const database = await getDatabase();
  return database.getAllAsync(
    `SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT 100`
  );
}

export async function removeSyncItem(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [id]);
}

export async function markSyncError(id: number, error: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE sync_queue SET attempts = attempts + 1, last_error = ? WHERE id = ?`,
    [error, id]
  );
}

// Stretching routine cache
export async function cacheStretchingRoutines(routines: any[]): Promise<void> {
  const database = await getDatabase();

  for (const routine of routines) {
    await database.runAsync(
      `INSERT OR REPLACE INTO stretching_routines (id, name, description, difficulty, duration_seconds, duration_minutes, category, user_id, is_system, stretches_json, cached_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        routine.id,
        routine.name,
        routine.description || null,
        routine.difficulty || null,
        routine.durationSeconds || null,
        routine.durationMinutes || null,
        routine.category || null,
        routine.userId || null,
        routine.isSystem ? 1 : 0,
        JSON.stringify(routine.stretches || []),
      ]
    );
  }
}

export async function getCachedStretchingRoutines(): Promise<any[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync(
    `SELECT * FROM stretching_routines ORDER BY is_system DESC, name ASC`
  );
  return results.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    difficulty: row.difficulty,
    durationSeconds: row.duration_seconds,
    durationMinutes: row.duration_minutes,
    category: row.category,
    userId: row.user_id,
    isSystem: row.is_system === 1,
    stretches: JSON.parse(row.stretches_json || '[]'),
  }));
}

export default {
  initDatabase,
  getDatabase,
  saveWorkoutLocally,
  getLocalWorkouts,
  saveSetLocally,
  cacheExercises,
  getCachedExercises,
  cacheStretchingRoutines,
  getCachedStretchingRoutines,
  addToSyncQueue,
  getPendingSyncItems,
  removeSyncItem,
  markSyncError,
};
