import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';

export const authRouter = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Helper to generate tokens
function generateTokens(userId: string) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
}

// POST /api/v1/auth/register
authRouter.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ApiError(409, 'EMAIL_ALREADY_EXISTS', 'Email address is already registered');
    }

    // Check username if provided
    if (data.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: data.username }
      });

      if (existingUsername) {
        throw new ApiError(409, 'USERNAME_TAKEN', 'Username is already taken');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        // Create default subscription (free tier)
        subscription: {
          create: {
            planType: 'free',
            status: 'active'
          }
        },
        // Create default notification preferences
        notificationPrefs: {
          create: {}
        }
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true
      }
    });

    const tokens = generateTokens(user.id);

    res.status(201).json({
      user,
      ...tokens
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/login
authRouter.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const tokens = generateTokens(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt
      },
      ...tokens
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/refresh
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(400, 'MISSING_REQUIRED_FIELD', 'Refresh token is required');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'secret') as {
      userId: string;
      type: string;
    };

    if (decoded.type !== 'refresh') {
      throw new ApiError(401, 'AUTH_TOKEN_INVALID', 'Invalid refresh token');
    }

    // Check user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      throw new ApiError(401, 'USER_NOT_FOUND', 'User not found');
    }

    const tokens = generateTokens(user.id);

    res.json(tokens);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'AUTH_TOKEN_INVALID', 'Invalid refresh token'));
    } else {
      next(error);
    }
  }
});

// GET /api/v1/auth/me
authRouter.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'AUTH_REQUIRED', 'Authentication required');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        onboarding: true,
        subscription: {
          select: {
            planType: true,
            status: true,
            expiresAt: true
          }
        }
      }
    });

    if (!user) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    }

    res.json({ user });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'AUTH_TOKEN_INVALID', 'Invalid token'));
    } else {
      next(error);
    }
  }
});
