import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const router = Router();

const createGoalSchema = z.object({
  goalType: z.string().min(1),
  description: z.string().optional(),
  targetArea: z.string().min(1),
  baselineRom: z.number().optional(),
  targetRom: z.number().optional(),
  targetDate: z.string().optional(),
});

const updateGoalSchema = createGoalSchema.partial().extend({
  status: z.enum(['active', 'completed', 'paused']).optional(),
});

const createMeasurementSchema = z.object({
  romDegrees: z.number().min(0),
  measurementDate: z.string().optional(),
  measurementMethod: z.string().optional(),
  notes: z.string().optional(),
});

// POST /api/v1/flexibility-goals - Create a goal
router.post('/', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createGoalSchema.parse(req.body);

    const goal = await prisma.flexibilityGoal.create({
      data: {
        userId: req.userId!,
        goalType: data.goalType,
        description: data.description,
        targetArea: data.targetArea,
        baselineRom: data.baselineRom,
        targetRom: data.targetRom,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      },
      include: { measurements: true },
    });

    res.status(201).json({ goal });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/flexibility-goals - List user's goals
router.get('/', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const { status, limit = '50', offset = '0' } = req.query;

    const where: any = { userId: req.userId };
    if (status) where.status = status;

    const [goals, total] = await Promise.all([
      prisma.flexibilityGoal.findMany({
        where,
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { createdAt: 'desc' },
        include: {
          measurements: {
            orderBy: { measurementDate: 'desc' },
          },
        },
      }),
      prisma.flexibilityGoal.count({ where }),
    ]);

    res.json({ goals, total });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/flexibility-goals/:id - Get single goal with measurements
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const goal = await prisma.flexibilityGoal.findUnique({
      where: { id: req.params.id },
      include: {
        measurements: {
          orderBy: { measurementDate: 'desc' },
        },
      },
    });

    if (!goal) {
      throw new ApiError(404, 'NOT_FOUND', 'Flexibility goal not found');
    }
    if (goal.userId !== req.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Not authorized');
    }

    res.json({ goal });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/flexibility-goals/:id - Update goal
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = updateGoalSchema.parse(req.body);

    const existing = await prisma.flexibilityGoal.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', 'Flexibility goal not found');
    }
    if (existing.userId !== req.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Not authorized');
    }

    const goal = await prisma.flexibilityGoal.update({
      where: { id: req.params.id },
      data: {
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      },
      include: { measurements: true },
    });

    res.json({ goal });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/flexibility-goals/:id - Delete goal
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const existing = await prisma.flexibilityGoal.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', 'Flexibility goal not found');
    }
    if (existing.userId !== req.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Not authorized');
    }

    await prisma.flexibilityGoal.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/flexibility-goals/:id/measurements - Log ROM measurement
router.post('/:id/measurements', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createMeasurementSchema.parse(req.body);

    const goal = await prisma.flexibilityGoal.findUnique({ where: { id: req.params.id } });
    if (!goal) {
      throw new ApiError(404, 'NOT_FOUND', 'Flexibility goal not found');
    }
    if (goal.userId !== req.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Not authorized');
    }

    const measurement = await prisma.romMeasurement.create({
      data: {
        goalId: req.params.id,
        romDegrees: data.romDegrees,
        measurementDate: data.measurementDate ? new Date(data.measurementDate) : new Date(),
        measurementMethod: data.measurementMethod,
        notes: data.notes,
      },
    });

    res.status(201).json({ measurement });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/flexibility-goals/:id/measurements - List measurements
router.get('/:id/measurements', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const { limit = '50', offset = '0' } = req.query;

    const goal = await prisma.flexibilityGoal.findUnique({ where: { id: req.params.id } });
    if (!goal) {
      throw new ApiError(404, 'NOT_FOUND', 'Flexibility goal not found');
    }
    if (goal.userId !== req.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Not authorized');
    }

    const [measurements, total] = await Promise.all([
      prisma.romMeasurement.findMany({
        where: { goalId: req.params.id },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { measurementDate: 'desc' },
      }),
      prisma.romMeasurement.count({ where: { goalId: req.params.id } }),
    ]);

    res.json({ measurements, total });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PROGRESS VIDEOS
// ============================================

// POST /api/v1/flexibility-goals/:id/videos - Upload video reference
const createVideoSchema = z.object({
  videoUrl: z.string().min(1),
  notes: z.string().optional(),
});

router.post('/:id/videos', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createVideoSchema.parse(req.body);

    const goal = await prisma.flexibilityGoal.findUnique({ where: { id: req.params.id } });
    if (!goal) {
      throw new ApiError(404, 'NOT_FOUND', 'Flexibility goal not found');
    }
    if (goal.userId !== req.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Not authorized');
    }

    const video = await prisma.progressVideo.create({
      data: {
        userId: req.userId!,
        goalId: req.params.id,
        videoUrl: data.videoUrl,
      },
    });

    res.status(201).json({ video });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/flexibility-goals/:id/videos - List progress videos
router.get('/:id/videos', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const goal = await prisma.flexibilityGoal.findUnique({ where: { id: req.params.id } });
    if (!goal) {
      throw new ApiError(404, 'NOT_FOUND', 'Flexibility goal not found');
    }
    if (goal.userId !== req.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Not authorized');
    }

    const videos = await prisma.progressVideo.findMany({
      where: { goalId: req.params.id },
      orderBy: { uploadedAt: 'desc' },
    });

    res.json({ videos });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/flexibility-goals/:id/videos/:videoId - Delete a video
router.delete('/:id/videos/:videoId', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const video = await prisma.progressVideo.findUnique({ where: { id: req.params.videoId } });
    if (!video) {
      throw new ApiError(404, 'NOT_FOUND', 'Video not found');
    }
    if (video.userId !== req.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Not authorized');
    }

    await prisma.progressVideo.delete({ where: { id: req.params.videoId } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
