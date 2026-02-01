/**
 * Exercises Routes
 * Serves cached exercises from local database
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
// ... imports

// ... proxy endpoint logic:
    // 3. Send response
    const contentType = response.headers.get('content-type') || 'image/gif';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h
    
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
// ...

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

    // Parse JSON fields
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
