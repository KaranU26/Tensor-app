/**
 * Routines API Routes
 * Handles premade and user-created workout routines
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const router = Router();

const createRoutineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  durationMinutes: z.number().positive('Duration is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  equipment: z.array(z.string()).optional(),
  warmup: z.array(z.string()).optional(),
  cooldown: z.array(z.string()).optional(),
  exercises: z.array(z.object({
    exerciseId: z.string().optional(),
    customName: z.string().optional(),
    sets: z.number().optional(),
    reps: z.string().optional(),
    restSeconds: z.number().optional(),
    notes: z.string().optional(),
  })).optional(),
});

/**
 * GET /routines
 * List all routines with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, isPremade, difficulty } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (isPremade !== undefined) where.isPremade = isPremade === 'true';
    if (difficulty) where.difficulty = difficulty;

    const routines = await prisma.routine.findMany({
      where,
      orderBy: [
        { isPremade: 'desc' },
        { name: 'asc' },
      ],
      include: {
        exercises: {
          orderBy: { positionOrder: 'asc' },
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                bodyPart: true,
                equipment: true,
                target: true,
              },
            },
          },
        },
      },
    });

    // Parse JSON fields
    const result = routines.map(routine => ({
      ...routine,
      equipment: routine.equipment ? JSON.parse(routine.equipment) : [],
      warmup: routine.warmup ? JSON.parse(routine.warmup) : [],
      cooldown: routine.cooldown ? JSON.parse(routine.cooldown) : [],
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching routines:', error);
    res.status(500).json({ error: 'Failed to fetch routines' });
  }
});

/**
 * GET /routines/categories
 * Get list of available routine categories
 */
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.routine.groupBy({
      by: ['category'],
      _count: true,
      orderBy: { category: 'asc' },
    });

    res.json(categories.map(c => ({
      name: c.category,
      count: c._count,
    })));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * GET /routines/:id
 * Get single routine by ID with exercises
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const routine = await prisma.routine.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: { positionOrder: 'asc' },
          include: {
            exercise: true,
          },
        },
      },
    });

    if (!routine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    // Parse JSON fields
    const result = {
      ...routine,
      equipment: routine.equipment ? JSON.parse(routine.equipment) : [],
      warmup: routine.warmup ? JSON.parse(routine.warmup) : [],
      cooldown: routine.cooldown ? JSON.parse(routine.cooldown) : [],
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching routine:', error);
    res.status(500).json({ error: 'Failed to fetch routine' });
  }
});

/**
 * POST /routines
 * Create a new user routine (auth required)
 */
router.post('/', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createRoutineSchema.parse(req.body);

    const routine = await prisma.routine.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        durationMinutes: data.durationMinutes,
        difficulty: data.difficulty,
        equipment: data.equipment ? JSON.stringify(data.equipment) : null,
        warmup: data.warmup ? JSON.stringify(data.warmup) : null,
        cooldown: data.cooldown ? JSON.stringify(data.cooldown) : null,
        isPremade: false,
        userId: req.userId,
        exercises: data.exercises ? {
          create: data.exercises.map((ex, index) => ({
            exerciseId: ex.exerciseId || null,
            customName: ex.customName || null,
            positionOrder: index,
            sets: ex.sets || 3,
            reps: ex.reps || null,
            restSeconds: ex.restSeconds || null,
            notes: ex.notes || null,
          })),
        } : undefined,
      },
      include: {
        exercises: {
          include: { exercise: true },
        },
      },
    });

    res.status(201).json(routine);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /routines/:id
 * Update a user routine (auth required, not premade)
 */
const updateRoutineSchema = createRoutineSchema.partial().extend({
  exercises: z.array(z.object({
    exerciseId: z.string().optional(),
    customName: z.string().optional(),
    sets: z.number().optional(),
    reps: z.string().optional(),
    restSeconds: z.number().optional(),
    notes: z.string().optional(),
  })).optional(),
});

router.put('/:id', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const data = updateRoutineSchema.parse(req.body);

    const existing = await prisma.routine.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', 'Routine not found');
    }
    if (existing.isPremade) {
      throw new ApiError(403, 'FORBIDDEN', 'Cannot edit premade routines');
    }
    if (existing.userId !== req.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Not authorized');
    }

    // If exercises array provided, replace all exercises
    if (data.exercises) {
      await prisma.routineExercise.deleteMany({ where: { routineId: id } });
    }

    const routine = await prisma.routine.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        durationMinutes: data.durationMinutes,
        difficulty: data.difficulty,
        equipment: data.equipment ? JSON.stringify(data.equipment) : undefined,
        warmup: data.warmup ? JSON.stringify(data.warmup) : undefined,
        cooldown: data.cooldown ? JSON.stringify(data.cooldown) : undefined,
        exercises: data.exercises ? {
          create: data.exercises.map((ex, index) => ({
            exerciseId: ex.exerciseId || null,
            customName: ex.customName || null,
            positionOrder: index,
            sets: ex.sets || 3,
            reps: ex.reps || null,
            restSeconds: ex.restSeconds || null,
            notes: ex.notes || null,
          })),
        } : undefined,
      },
      include: {
        exercises: {
          orderBy: { positionOrder: 'asc' },
          include: { exercise: true },
        },
      },
    });

    const result = {
      ...routine,
      equipment: routine.equipment ? JSON.parse(routine.equipment) : [],
      warmup: routine.warmup ? JSON.parse(routine.warmup) : [],
      cooldown: routine.cooldown ? JSON.parse(routine.cooldown) : [],
    };

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /routines/:id
 * Delete a user routine (auth required, not premade)
 */
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    const routine = await prisma.routine.findUnique({ where: { id } });
    if (!routine) {
      throw new ApiError(404, 'NOT_FOUND', 'Routine not found');
    }
    if (routine.isPremade) {
      throw new ApiError(403, 'FORBIDDEN', 'Cannot delete premade routines');
    }
    if (routine.userId !== req.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Not authorized');
    }

    await prisma.routine.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
