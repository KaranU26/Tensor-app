/**
 * Exercises Routes
 * Serves cached exercises from local database with GIF proxy
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Helper to add proxy GIF URL
const withGifUrl = (exercise: any, req: Request) => {
  if (!exercise) return exercise;
  if (exercise.gifUrl && exercise.gifUrl.startsWith('http')) return exercise;
  
  const baseUrl = `${req.protocol}://${req.get('host')}/api/v1/exercises`;
  return {
    ...exercise,
    gifUrl: `${baseUrl}/${exercise.id}/gif`,
  };
};

/**
 * GET /exercises
 * List all exercises with pagination and filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      bodyPart,
      target,
      equipment,
      search,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (bodyPart) where.bodyPart = bodyPart;
    if (target) where.target = target;
    if (equipment) where.equipment = equipment;
    if (search) where.name = { contains: search as string };

    const [exercisesRaw, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          externalId: true,
          name: true,
          bodyPart: true,
          equipment: true,
          target: true,
          gifUrl: true,
        },
      }),
      prisma.exercise.count({ where }),
    ]);

    const exercises = exercisesRaw.map(ex => withGifUrl(ex, req));

    res.json({
      exercises,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

/**
 * GET /exercises/body-parts
 */
router.get('/body-parts', async (_req: Request, res: Response) => {
  try {
    const bodyParts = await prisma.exercise.findMany({
      select: { bodyPart: true },
      distinct: ['bodyPart'],
      orderBy: { bodyPart: 'asc' },
    });
    res.json(bodyParts.map((bp) => bp.bodyPart));
  } catch (error) {
    console.error('Error fetching body parts:', error);
    res.status(500).json({ error: 'Failed to fetch body parts' });
  }
});

/**
 * GET /exercises/targets
 */
router.get('/targets', async (_req: Request, res: Response) => {
  try {
    const targets = await prisma.exercise.findMany({
      select: { target: true },
      distinct: ['target'],
      orderBy: { target: 'asc' },
    });
    res.json(targets.map((t) => t.target));
  } catch (error) {
    console.error('Error fetching targets:', error);
    res.status(500).json({ error: 'Failed to fetch targets' });
  }
});

/**
 * GET /exercises/equipment
 */
router.get('/equipment', async (_req: Request, res: Response) => {
  try {
    const equipment = await prisma.exercise.findMany({
      select: { equipment: true },
      distinct: ['equipment'],
      orderBy: { equipment: 'asc' },
    });
    res.json(equipment.map((e) => e.equipment));
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

/**
 * GET /exercises/body-part/:bodyPart
 */
router.get('/body-part/:bodyPart', async (req: Request, res: Response) => {
  try {
    const { bodyPart } = req.params;
    const { limit = '50' } = req.query;
    const limitNum = Math.min(parseInt(limit as string, 10), 100);

    const exercisesRaw = await prisma.exercise.findMany({
      where: { bodyPart },
      take: limitNum,
      orderBy: { name: 'asc' },
    });

    res.json(exercisesRaw.map(ex => withGifUrl(ex, req)));
  } catch (error) {
    console.error('Error fetching exercises by body part:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

/**
 * GET /exercises/target/:target
 */
router.get('/target/:target', async (req: Request, res: Response) => {
  try {
    const { target } = req.params;
    const { limit = '50' } = req.query;
    const limitNum = Math.min(parseInt(limit as string, 10), 100);

    const exercisesRaw = await prisma.exercise.findMany({
      where: { target },
      take: limitNum,
      orderBy: { name: 'asc' },
    });

    res.json(exercisesRaw.map(ex => withGifUrl(ex, req)));
  } catch (error) {
    console.error('Error fetching exercises by target:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

/**
 * GET /exercises/:id/gif
 * Serves GIF from local storage, falls back to API if missing
 */
router.get('/:id/gif', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const exercise = await prisma.exercise.findUnique({
      where: { id },
      select: { externalId: true },
    });

    if (!exercise || !exercise.externalId) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const path = await import('path');
    const fs = await import('fs');
    
    // Check if GIF exists locally
    const gifPath = path.join(__dirname, '../../public/gifs', `${exercise.externalId}.gif`);
    
    if (fs.existsSync(gifPath)) {
      // Serve from local file (fast path)
      res.setHeader('Content-Type', 'image/gif');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      return res.sendFile(gifPath);
    }

    // Fallback: Fetch from API and save locally
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    const rapidApiHost = process.env.RAPIDAPI_HOST || 'exercisedb.p.rapidapi.com';

    if (!rapidApiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const imageUrl = `https://${rapidApiHost}/image?exerciseId=${exercise.externalId}&resolution=360`;

    const response = await fetch(imageUrl, {
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': rapidApiHost,
      },
    });

    if (!response.ok) {
      console.error(`Upstream error for GIF ${exercise.externalId}: ${response.status}`);
      return res.status(response.status).send('Failed to fetch image');
    }

    const buffer = await response.arrayBuffer();
    const gifBuffer = Buffer.from(buffer);
    
    // Save to disk for future requests (self-healing cache)
    const gifsDir = path.join(__dirname, '../../public/gifs');
    if (!fs.existsSync(gifsDir)) {
      fs.mkdirSync(gifsDir, { recursive: true });
    }
    fs.writeFileSync(gifPath, gifBuffer);

    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(gifBuffer);
  } catch (error) {
    console.error('Error serving GIF:', error);
    res.status(500).json({ error: 'GIF error' });
  }
});

/**
 * GET /exercises/:id
 * Get single exercise by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const result = {
      ...withGifUrl(exercise, req),
      secondaryMuscles: exercise.secondaryMuscles 
        ? JSON.parse(exercise.secondaryMuscles) 
        : [],
      instructions: exercise.instructions 
        ? JSON.parse(exercise.instructions) 
        : [],
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
});

export default router;
