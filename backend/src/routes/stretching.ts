import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { z } from 'zod';

export const stretchingRouter = Router();

// ============================================
// STRETCHES (Library)
// ============================================

// GET /api/v1/stretching/stretches - Get all stretches
stretchingRouter.get('/stretches', async (req, res, next) => {
  try {
    const { difficulty, muscle, search, limit = '50', offset = '0' } = req.query;

    const where: any = {};

    if (difficulty) {
      where.difficulty = difficulty as string;
    }

    if (muscle) {
      where.primaryMuscles = {
        contains: muscle as string
      };
    }

    if (search) {
      where.name = {
        contains: search as string
      };
    }

    const [stretches, total] = await Promise.all([
      prisma.stretch.findMany({
        where,
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { name: 'asc' }
      }),
      prisma.stretch.count({ where })
    ]);

    // Parse JSON fields
    const formattedStretches = stretches.map((s) => ({
      ...s,
      primaryMuscles: JSON.parse(s.primaryMuscles),
      secondaryMuscles: s.secondaryMuscles ? JSON.parse(s.secondaryMuscles) : [],
      tips: s.tips ? JSON.parse(s.tips) : [],
      commonMistakes: s.commonMistakes ? JSON.parse(s.commonMistakes) : [],
      equipment: s.equipment ? JSON.parse(s.equipment) : [],
      tags: s.tags ? JSON.parse(s.tags) : []
    }));

    res.json({
      stretches: formattedStretches,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/stretching/stretches/:id - Get single stretch
stretchingRouter.get('/stretches/:id', async (req, res, next) => {
  try {
    const stretch = await prisma.stretch.findUnique({
      where: { id: req.params.id }
    });

    if (!stretch) {
      throw new ApiError(404, 'RESOURCE_NOT_FOUND', 'Stretch not found');
    }

    res.json({
      stretch: {
        ...stretch,
        primaryMuscles: JSON.parse(stretch.primaryMuscles),
        secondaryMuscles: stretch.secondaryMuscles ? JSON.parse(stretch.secondaryMuscles) : [],
        tips: stretch.tips ? JSON.parse(stretch.tips) : [],
        commonMistakes: stretch.commonMistakes ? JSON.parse(stretch.commonMistakes) : [],
        equipment: stretch.equipment ? JSON.parse(stretch.equipment) : [],
        tags: stretch.tags ? JSON.parse(stretch.tags) : []
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// ROUTINES
// ============================================

// GET /api/v1/stretching/routines - Get all routines (public + user's)
stretchingRouter.get('/routines', async (req, res, next) => {
  try {
    const { category, difficulty, limit = '50', offset = '0' } = req.query;

    // Get user ID from optional auth header
    let userId: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(
          authHeader.substring(7),
          process.env.JWT_SECRET || 'secret'
        ) as { userId: string };
        userId = decoded.userId;
      } catch {
        // Ignore auth errors for public routes
      }
    }

    const where: any = {
      OR: [
        { isPublic: true },
        { isSystem: true },
        ...(userId ? [{ userId }] : [])
      ]
    };

    if (difficulty) {
      where.difficulty = difficulty as string;
    }

    if (category) {
      where.tags = {
        contains: category as string
      };
    }

    const [routines, total] = await Promise.all([
      prisma.stretchingRoutine.findMany({
        where,
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: [{ isSystem: 'desc' }, { usesCount: 'desc' }],
        include: {
          stretches: {
            include: {
              stretch: true
            },
            orderBy: { positionOrder: 'asc' }
          }
        }
      }),
      prisma.stretchingRoutine.count({ where })
    ]);

    // Format routines
    const formattedRoutines = routines.map((r) => ({
      ...r,
      targetAreas: r.targetAreas ? JSON.parse(r.targetAreas) : [],
      tags: r.tags ? JSON.parse(r.tags) : [],
      stretches: r.stretches.map((rs) => ({
        id: rs.id,
        stretchId: rs.stretchId,
        positionOrder: rs.positionOrder,
        customDurationSeconds: rs.customDurationSeconds,
        stretch: rs.stretch
          ? {
              ...rs.stretch,
              primaryMuscles: JSON.parse(rs.stretch.primaryMuscles),
              secondaryMuscles: rs.stretch.secondaryMuscles
                ? JSON.parse(rs.stretch.secondaryMuscles)
                : []
            }
          : null
      }))
    }));

    res.json({
      routines: formattedRoutines,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/stretching/routines/:id - Get single routine
stretchingRouter.get('/routines/:id', async (req, res, next) => {
  try {
    const routine = await prisma.stretchingRoutine.findUnique({
      where: { id: req.params.id },
      include: {
        stretches: {
          include: {
            stretch: true
          },
          orderBy: { positionOrder: 'asc' }
        }
      }
    });

    if (!routine) {
      throw new ApiError(404, 'ROUTINE_NOT_FOUND', 'Stretching routine not found');
    }

    res.json({
      routine: {
        ...routine,
        targetAreas: routine.targetAreas ? JSON.parse(routine.targetAreas) : [],
        tags: routine.tags ? JSON.parse(routine.tags) : [],
        stretches: routine.stretches.map((rs) => ({
          id: rs.id,
          stretchId: rs.stretchId,
          positionOrder: rs.positionOrder,
          customDurationSeconds: rs.customDurationSeconds,
          stretch: rs.stretch
            ? {
                ...rs.stretch,
                primaryMuscles: JSON.parse(rs.stretch.primaryMuscles),
                secondaryMuscles: rs.stretch.secondaryMuscles
                  ? JSON.parse(rs.stretch.secondaryMuscles)
                  : [],
                tips: rs.stretch.tips ? JSON.parse(rs.stretch.tips) : [],
                commonMistakes: rs.stretch.commonMistakes
                  ? JSON.parse(rs.stretch.commonMistakes)
                  : []
              }
            : null
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/stretching/routines - Create custom routine (auth required)
const createRoutineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  targetAreas: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
  stretches: z.array(
    z.object({
      stretchId: z.string().uuid(),
      customDurationSeconds: z.number().optional()
    })
  )
});

stretchingRouter.post('/routines', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = createRoutineSchema.parse(req.body);

    // Check user's custom routine limit (free tier = 4)
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { subscription: true }
    });

    const existingRoutines = await prisma.stretchingRoutine.count({
      where: { userId: req.userId }
    });

    const isPro = user?.subscription?.planType !== 'free';
    if (!isPro && existingRoutines >= 4) {
      throw new ApiError(403, 'ROUTINE_LIMIT_REACHED', 'Free tier custom routine limit reached (4 max)');
    }

    // Calculate total duration
    const stretchIds = data.stretches.map((s) => s.stretchId);
    const stretches = await prisma.stretch.findMany({
      where: { id: { in: stretchIds } }
    });

    const stretchMap = new Map(stretches.map((s) => [s.id, s]));
    let totalDuration = 0;
    data.stretches.forEach((s) => {
      const stretch = stretchMap.get(s.stretchId);
      totalDuration += s.customDurationSeconds || stretch?.durationSeconds || 30;
    });

    const routine = await prisma.stretchingRoutine.create({
      data: {
        userId: req.userId,
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        durationSeconds: totalDuration,
        targetAreas: data.targetAreas ? JSON.stringify(data.targetAreas) : null,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        isPublic: data.isPublic,
        isSystem: false,
        stretches: {
          create: data.stretches.map((s, index) => ({
            stretchId: s.stretchId,
            positionOrder: index + 1,
            customDurationSeconds: s.customDurationSeconds
          }))
        }
      },
      include: {
        stretches: {
          include: { stretch: true },
          orderBy: { positionOrder: 'asc' }
        }
      }
    });

    res.status(201).json({ routine });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/stretching/routines/:id - Update stretching routine (auth required)
const updateStretchingRoutineSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  targetAreas: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  stretches: z.array(
    z.object({
      stretchId: z.string().uuid(),
      customDurationSeconds: z.number().optional(),
    })
  ).optional(),
});

stretchingRouter.put('/routines/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = updateStretchingRoutineSchema.parse(req.body);

    const existing = await prisma.stretchingRoutine.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      throw new ApiError(404, 'ROUTINE_NOT_FOUND', 'Stretching routine not found');
    }
    if (existing.isSystem) {
      throw new ApiError(403, 'FORBIDDEN', 'Cannot edit system routines');
    }
    if (existing.userId !== req.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Not authorized');
    }

    // If stretches provided, recalculate duration and replace
    let durationSeconds = existing.durationSeconds;
    if (data.stretches) {
      await prisma.routineStretch.deleteMany({ where: { routineId: req.params.id } });

      const stretchIds = data.stretches.map(s => s.stretchId);
      const stretches = await prisma.stretch.findMany({ where: { id: { in: stretchIds } } });
      const stretchMap = new Map(stretches.map(s => [s.id, s]));

      durationSeconds = 0;
      data.stretches.forEach(s => {
        const stretch = stretchMap.get(s.stretchId);
        durationSeconds += s.customDurationSeconds || stretch?.durationSeconds || 30;
      });
    }

    const routine = await prisma.stretchingRoutine.update({
      where: { id: req.params.id },
      data: {
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        durationSeconds,
        targetAreas: data.targetAreas ? JSON.stringify(data.targetAreas) : undefined,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
        isPublic: data.isPublic,
        stretches: data.stretches ? {
          create: data.stretches.map((s, index) => ({
            stretchId: s.stretchId,
            positionOrder: index + 1,
            customDurationSeconds: s.customDurationSeconds,
          })),
        } : undefined,
      },
      include: {
        stretches: {
          include: { stretch: true },
          orderBy: { positionOrder: 'asc' },
        },
      },
    });

    res.json({ routine });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/stretching/routines/:id - Delete stretching routine (auth required)
stretchingRouter.delete('/routines/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.stretchingRoutine.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      throw new ApiError(404, 'ROUTINE_NOT_FOUND', 'Stretching routine not found');
    }
    if (existing.isSystem) {
      throw new ApiError(403, 'FORBIDDEN', 'Cannot delete system routines');
    }
    if (existing.userId !== req.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Not authorized');
    }

    await prisma.stretchingRoutine.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ============================================
// SESSIONS
// ============================================

// POST /api/v1/stretching/sessions - Log stretching session
const createSessionSchema = z.object({
  routineId: z.string().uuid().optional(),
  routineName: z.string().optional(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  linkedWorkoutId: z.string().uuid().optional(),
  notes: z.string().optional(),
  stretches: z.array(
    z.object({
      stretchId: z.string().uuid(),
      heldDurationSeconds: z.number().min(0),
      feltTight: z.boolean().default(false),
      positionInRoutine: z.number()
    })
  )
});

stretchingRouter.post('/sessions', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = createSessionSchema.parse(req.body);

    const startedAt = new Date(data.startedAt);
    const completedAt = data.completedAt ? new Date(data.completedAt) : new Date();
    const durationSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000);

    const session = await prisma.stretchingSession.create({
      data: {
        userId: req.userId!,
        routineId: data.routineId,
        routineName: data.routineName,
        startedAt,
        completedAt,
        durationSeconds,
        completed: true,
        linkedWorkoutId: data.linkedWorkoutId,
        notes: data.notes,
        stretches: {
          create: data.stretches.map((s) => ({
            stretchId: s.stretchId,
            heldDurationSeconds: s.heldDurationSeconds,
            feltTight: s.feltTight,
            positionInRoutine: s.positionInRoutine
          }))
        }
      },
      include: {
        stretches: {
          include: { stretch: true }
        }
      }
    });

    // Increment routine uses count
    if (data.routineId) {
      await prisma.stretchingRoutine.update({
        where: { id: data.routineId },
        data: { usesCount: { increment: 1 } }
      });
    }

    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/stretching/sessions - Get user's session history
stretchingRouter.get('/sessions', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { limit = '20', offset = '0', dateFrom, dateTo } = req.query;

    const where: any = { userId: req.userId };

    if (dateFrom || dateTo) {
      where.completedAt = {};
      if (dateFrom) where.completedAt.gte = new Date(dateFrom as string);
      if (dateTo) where.completedAt.lte = new Date(dateTo as string);
    }

    const [sessions, total] = await Promise.all([
      prisma.stretchingSession.findMany({
        where,
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { completedAt: 'desc' },
        include: {
          stretches: {
            include: { stretch: true }
          }
        }
      }),
      prisma.stretchingSession.count({ where })
    ]);

    res.json({
      sessions,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/stretching/stats - Get user's stretching statistics
stretchingRouter.get('/stats', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { period = 'month' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const sessions = await prisma.stretchingSession.findMany({
      where: {
        userId: req.userId,
        completed: true,
        completedAt: { gte: startDate }
      },
      include: {
        stretches: true
      }
    });

    // Calculate stats
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 60;

    // Calculate unique days
    const uniqueDays = new Set(
      sessions.map((s) => s.completedAt?.toISOString().split('T')[0])
    ).size;

    // Calculate streak
    const sessionDates = sessions
      .filter((s) => s.completedAt)
      .map((s) => s.completedAt!.toISOString().split('T')[0])
      .sort()
      .reverse();

    let streak = 0;
    let currentDate = new Date();

    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (sessionDates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (i === 0) {
        // Allow skipping today if no session yet
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Find tight areas
    const tightAreas: Record<string, number> = {};
    sessions.forEach((s) => {
      s.stretches.forEach((stretch) => {
        if (stretch.feltTight) {
          // Would need to join with stretch data to get muscle groups
          tightAreas['general'] = (tightAreas['general'] || 0) + 1;
        }
      });
    });

    res.json({
      period,
      totalSessions,
      totalMinutes: Math.round(totalMinutes),
      uniqueDays,
      consistencyPercentage: Math.round((uniqueDays / 30) * 100),
      currentStreak: streak,
      tightAreasIdentified: Object.keys(tightAreas)
    });
  } catch (error) {
    next(error);
  }
});
