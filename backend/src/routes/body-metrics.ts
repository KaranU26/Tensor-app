import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const router = Router();

const createBodyMetricSchema = z.object({
  weight: z.number().positive().optional(),
  weightUnit: z.enum(['lbs', 'kg']).default('lbs'),
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  hips: z.number().positive().optional(),
  arms: z.number().positive().optional(),
  thighs: z.number().positive().optional(),
  measurementUnit: z.enum(['inches', 'cm']).default('inches'),
  measurementDate: z.string().optional(),
  notes: z.string().optional(),
});

const updateBodyMetricSchema = createBodyMetricSchema.partial();

// POST /api/v1/body-metrics - Create a body metric entry
router.post('/', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createBodyMetricSchema.parse(req.body);

    const bodyMetric = await prisma.bodyMetric.create({
      data: {
        userId: req.userId!,
        weight: data.weight,
        weightUnit: data.weightUnit,
        bodyFatPercentage: data.bodyFatPercentage,
        chest: data.chest,
        waist: data.waist,
        hips: data.hips,
        arms: data.arms,
        thighs: data.thighs,
        measurementUnit: data.measurementUnit,
        measurementDate: data.measurementDate ? new Date(data.measurementDate) : new Date(),
        notes: data.notes,
      },
    });

    res.status(201).json({ bodyMetric });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/body-metrics - List user's metrics
router.get('/', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const { limit = '20', offset = '0' } = req.query;

    const [bodyMetrics, total] = await Promise.all([
      prisma.bodyMetric.findMany({
        where: { userId: req.userId },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { measurementDate: 'desc' },
      }),
      prisma.bodyMetric.count({ where: { userId: req.userId } }),
    ]);

    res.json({ bodyMetrics, total });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/body-metrics/latest - Get most recent entry
router.get('/latest', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const bodyMetric = await prisma.bodyMetric.findFirst({
      where: { userId: req.userId },
      orderBy: { measurementDate: 'desc' },
    });

    res.json({ bodyMetric });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/body-metrics/:id - Update entry
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const data = updateBodyMetricSchema.parse(req.body);

    const existing = await prisma.bodyMetric.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', 'Body metric not found');
    }
    if (existing.userId !== req.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Not authorized');
    }

    const bodyMetric = await prisma.bodyMetric.update({
      where: { id },
      data: {
        ...data,
        measurementDate: data.measurementDate ? new Date(data.measurementDate) : undefined,
      },
    });

    res.json({ bodyMetric });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/body-metrics/:id - Delete entry
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.bodyMetric.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', 'Body metric not found');
    }
    if (existing.userId !== req.userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Not authorized');
    }

    await prisma.bodyMetric.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
