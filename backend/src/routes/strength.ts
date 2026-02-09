import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// =============================================================================
// EXERCISES
// =============================================================================

// GET /exercises - List all exercises
router.get('/exercises', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { muscleGroup, equipment, search } = req.query;
    
    const where: any = {};
    
    if (muscleGroup) {
      where.primaryMuscles = { contains: muscleGroup as string };
    }
    
    if (equipment) {
      where.equipment = { contains: equipment as string };
    }
    
    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' };
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({ exercises });
  } catch (error) {
    next(error);
  }
});

// GET /exercises/:id - Get single exercise
router.get('/exercises/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: req.params.id },
    });

    if (!exercise) {
      return res.status(404).json({ error: { message: 'Exercise not found' } });
    }

    res.json({ exercise });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// WORKOUTS
// =============================================================================

const createWorkoutSchema = z.object({
  name: z.string().optional(),
  notes: z.string().optional(),
});

// POST /workouts - Start a new workout
router.post('/workouts', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createWorkoutSchema.parse(req.body);
    
    const workout = await prisma.strengthWorkout.create({
      data: {
        userId: req.userId!,
        name: data.name || `Workout - ${new Date().toLocaleDateString()}`,
        notes: data.notes,
        startedAt: new Date(),
      },
    });

    res.status(201).json({ workout });
  } catch (error) {
    next(error);
  }
});

// GET /workouts - List user's workouts
router.get('/workouts', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = '20', offset = '0' } = req.query;

    const workouts = await prisma.strengthWorkout.findMany({
      where: { userId: req.userId! },
      orderBy: { startedAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    res.json({ workouts });
  } catch (error) {
    next(error);
  }
});

// GET /workouts/:id - Get single workout with exercises
router.get('/workouts/:id', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const workout = await prisma.strengthWorkout.findFirst({
      where: { 
        id: req.params.id,
        userId: req.userId!,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
          orderBy: { positionOrder: 'asc' },
        },
      },
    });

    if (!workout) {
      return res.status(404).json({ error: { message: 'Workout not found' } });
    }

    res.json({ workout });
  } catch (error) {
    next(error);
  }
});

// PATCH /workouts/:id - Update workout (finish, add notes)
router.patch('/workouts/:id', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { notes, finish } = req.body;

    const updateData: any = {};
    if (notes !== undefined) updateData.notes = notes;

    if (finish) {
      const now = new Date();
      updateData.completedAt = now;

      // Compute derived fields
      const existing = await prisma.strengthWorkout.findUnique({
        where: { id: req.params.id },
        include: { exercises: { include: { sets: true } } },
      });

      if (existing) {
        // Duration in seconds
        updateData.durationSeconds = Math.round((now.getTime() - existing.startedAt.getTime()) / 1000);

        // Total volume = sum of (weight * reps) per set
        let volume = 0;
        for (const ex of existing.exercises) {
          for (const set of ex.sets) {
            volume += (set.weight || 0) * (set.reps || 0);
          }
        }
        updateData.totalVolume = volume;
      }
    }

    const workout = await prisma.strengthWorkout.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    res.json({ workout });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// WORKOUT EXERCISES
// =============================================================================

const addExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
});

// POST /workouts/:id/exercises - Add exercise to workout
router.post('/workouts/:id/exercises', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { exerciseId } = addExerciseSchema.parse(req.body);
    
    // Get current exercise count for ordering
    const existingCount = await prisma.workoutExercise.count({
      where: { workoutId: req.params.id },
    });

    const workoutExercise = await prisma.workoutExercise.create({
      data: {
        workoutId: req.params.id,
        exerciseId,
        positionOrder: existingCount + 1,
      },
      include: {
        exercise: true,
        sets: true,
      },
    });

    res.status(201).json({ workoutExercise });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// SETS
// =============================================================================

const addSetSchema = z.object({
  weight: z.number().optional(),
  reps: z.number().optional(),
  durationSeconds: z.number().optional(),
  rpe: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

// POST /workout-exercises/:id/sets - Add set to workout exercise
router.post('/workout-exercises/:id/sets', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = addSetSchema.parse(req.body);
    
    // Get current set count
    const existingCount = await prisma.workoutSet.count({
      where: { workoutExerciseId: req.params.id },
    });

    const set = await prisma.workoutSet.create({
      data: {
        workoutExerciseId: req.params.id,
        setNumber: existingCount + 1,
        weight: data.weight,
        reps: data.reps,
        durationSeconds: data.durationSeconds,
        rpe: data.rpe,
      },
    });

    // Check for personal record
    const workoutExercise = await prisma.workoutExercise.findUnique({
      where: { id: req.params.id },
      include: { workout: true },
    });

    if (workoutExercise && data.weight && data.reps) {
      // Check if this is a new 1RM equivalent PR
      const estimated1RM = data.weight * (1 + data.reps / 30); // Epley formula
      
      const existingPR = await prisma.personalRecord.findFirst({
        where: {
          userId: workoutExercise.workout.userId,
          exerciseId: workoutExercise.exerciseId,
          recordType: 'estimated_1rm',
        },
        orderBy: { value: 'desc' },
      });

      if (!existingPR || estimated1RM > existingPR.value) {
        await prisma.personalRecord.create({
          data: {
            userId: workoutExercise.workout.userId,
            exerciseId: workoutExercise.exerciseId,
            recordType: 'estimated_1rm',
            value: estimated1RM,
            achievedAt: new Date(),
          },
        });
      }
    }

    res.status(201).json({ set });
  } catch (error) {
    next(error);
  }
});

// DELETE /sets/:id - Delete a set
router.delete('/sets/:id', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.workoutSet.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// STATS
// =============================================================================

// GET /dashboard - Combined stats for Home + Profile screens
router.get('/dashboard', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // All-time completed workouts
    const totalWorkouts = await prisma.strengthWorkout.count({
      where: { userId, completedAt: { not: null } },
    });

    // This week's workouts with duration
    const weekWorkoutsData = await prisma.strengthWorkout.findMany({
      where: { userId, completedAt: { gte: weekStart } },
      select: { durationSeconds: true, totalVolume: true },
    });
    const weekWorkouts = weekWorkoutsData.length;
    const weekDurationMinutes = Math.round(
      weekWorkoutsData.reduce((sum, w) => sum + (w.durationSeconds || 0), 0) / 60
    );
    const weekVolume = weekWorkoutsData.reduce((sum, w) => sum + (w.totalVolume || 0), 0);

    // Estimate calories (moderate strength training MET ~5.0, 80kg average)
    const weekCalories = Math.round(weekDurationMinutes * 5.0 * 80 / 60);

    // Personal records count
    const personalRecords = await prisma.personalRecord.count({
      where: { userId },
    });

    // Streak: consecutive days with a workout or stretching session
    const allWorkoutDates = await prisma.strengthWorkout.findMany({
      where: { userId, completedAt: { not: null } },
      select: { completedAt: true },
      orderBy: { completedAt: 'desc' },
    });
    const allSessionDates = await prisma.stretchingSession.findMany({
      where: { userId, completed: true },
      select: { completedAt: true },
      orderBy: { completedAt: 'desc' },
    });

    const activityDates = new Set<string>();
    for (const w of allWorkoutDates) {
      if (w.completedAt) activityDates.add(w.completedAt.toISOString().split('T')[0]);
    }
    for (const s of allSessionDates) {
      if (s.completedAt) activityDates.add(s.completedAt.toISOString().split('T')[0]);
    }

    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (activityDates.has(dateStr)) {
        currentStreak++;
      } else if (i === 0) {
        // Allow skipping today if no activity yet
        continue;
      } else {
        break;
      }
    }

    // Total stretching sessions this week
    const weekStretchingSessions = await prisma.stretchingSession.count({
      where: { userId, completed: true, completedAt: { gte: weekStart } },
    });

    res.json({
      totalWorkouts,
      weekWorkouts,
      weekDurationMinutes,
      weekVolume,
      weekCalories,
      weekStretchingSessions,
      personalRecords,
      currentStreak,
    });
  } catch (error) {
    next(error);
  }
});

// GET /stats - Get strength training stats
router.get('/stats', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    
    // Total workouts
    const totalWorkouts = await prisma.strengthWorkout.count({
      where: { userId, completedAt: { not: null } },
    });

    // This week's workouts
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekWorkouts = await prisma.strengthWorkout.count({
      where: {
        userId,
        completedAt: { gte: weekStart },
      },
    });

    // Total volume (sum of weight * reps per set)
    const allSets = await prisma.workoutSet.findMany({
      where: {
        workoutExercise: {
          workout: { userId, completedAt: { not: null } },
        },
      },
      select: { weight: true, reps: true },
    });
    const totalVolume = allSets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);

    // Week volume
    const weekSets = await prisma.workoutSet.findMany({
      where: {
        workoutExercise: {
          workout: { userId, completedAt: { gte: weekStart } },
        },
      },
      select: { weight: true, reps: true },
    });
    const weekVolume = weekSets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);

    // Personal records count
    const prCount = await prisma.personalRecord.count({
      where: { userId },
    });

    res.json({
      totalWorkouts,
      weekWorkouts,
      totalVolume,
      weekVolume,
      personalRecords: prCount,
    });
  } catch (error) {
    next(error);
  }
});

// GET /personal-records - Get user's PRs
router.get('/personal-records', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get best PR for each exercise
    const prs = await prisma.personalRecord.findMany({
      where: { userId: req.userId! },
      include: { exercise: true },
      orderBy: { achievedAt: 'desc' },
    });

    // Group by exercise and get best
    const bestPRs: Record<string, any> = {};
    for (const pr of prs) {
      if (!bestPRs[pr.exerciseId] || pr.value > bestPRs[pr.exerciseId].value) {
        bestPRs[pr.exerciseId] = pr;
      }
    }

    res.json({ personalRecords: Object.values(bestPRs) });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// RESEARCH ENHANCEMENTS: STRENGTH STANDARDS & MUSCLE VOLUME
// =============================================================================

// POST /strength-level - Get strength level for a lift
router.post('/strength-level', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lift, weightKg, bodyweightKg, sex } = req.body;
    
    // Import dynamically to avoid circular dependencies
    const { getStrengthLevel, calculate1RM } = await import('../lib/strengthStandards.js');
    
    const level = getStrengthLevel(weightKg, lift, bodyweightKg, sex);
    
    res.json({ 
      level: level.level,
      percentile: level.percentile,
      nextLevel: level.nextLevel,
      toNextLevelKg: level.toNextLevel,
    });
  } catch (error) {
    next(error);
  }
});

// POST /calculate-1rm - Calculate 1RM using multiple formulas
router.post('/calculate-1rm', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { weight, reps } = req.body;
    
    const { calculate1RM } = await import('../lib/strengthStandards.js');
    const result = calculate1RM(weight, reps);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /relative-strength - Calculate Wilks and DOTS scores
router.post('/relative-strength', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { totalKg, bodyweightKg, sex } = req.body;
    
    const { calculateWilks, calculateDOTS } = await import('../lib/strengthStandards.js');
    
    res.json({
      wilks: calculateWilks(totalKg, bodyweightKg, sex),
      dots: calculateDOTS(totalKg, bodyweightKg, sex),
    });
  } catch (error) {
    next(error);
  }
});

// GET /muscle-volume - Get muscle volume distribution for user's workouts
router.get('/muscle-volume', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { days = '7' } = req.query;
    const daysAgo = parseInt(days as string);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    startDate.setHours(0, 0, 0, 0);

    // Get all workout sets with exercise muscle data
    const workoutSets = await prisma.workoutSet.findMany({
      where: {
        workoutExercise: {
          workout: {
            userId: req.userId!,
            startedAt: { gte: startDate },
          },
        },
      },
      include: {
        workoutExercise: {
          include: {
            exercise: true,
          },
        },
      },
    });

    // Aggregate volume by muscle group
    const muscleVolume: Record<string, number> = {};
    
    for (const set of workoutSets) {
      const exercise = set.workoutExercise.exercise;
      const primaryMuscles = JSON.parse(exercise.primaryMuscles || '[]');
      const secondaryMuscles = JSON.parse(exercise.secondaryMuscles || '[]');
      
      // Primary muscles get full set credit
      for (const muscle of primaryMuscles) {
        muscleVolume[muscle] = (muscleVolume[muscle] || 0) + 1;
      }
      
      // Secondary muscles get partial credit (0.5 sets)
      for (const muscle of secondaryMuscles) {
        muscleVolume[muscle] = (muscleVolume[muscle] || 0) + 0.5;
      }
    }

    // Round values
    for (const muscle of Object.keys(muscleVolume)) {
      muscleVolume[muscle] = Math.round(muscleVolume[muscle] * 10) / 10;
    }

    res.json({ 
      muscleVolume,
      periodDays: daysAgo,
      totalSets: workoutSets.length,
    });
  } catch (error) {
    next(error);
  }
});

// POST /calories - Calculate workout calories using MET values
router.post('/calories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { activeMinutes, restMinutes, bodyweightKg, intensity } = req.body;
    
    const { calculateWorkoutCalories } = await import('../lib/strengthStandards.js');
    const calories = calculateWorkoutCalories(activeMinutes, restMinutes, bodyweightKg, intensity);
    
    res.json({ calories });
  } catch (error) {
    next(error);
  }
});

export default router;

