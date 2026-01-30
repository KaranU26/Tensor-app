import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'AUTH_REQUIRED', 'Authentication required');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: string;
    };

    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, 'AUTH_TOKEN_EXPIRED', 'Authentication token has expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'AUTH_TOKEN_INVALID', 'Invalid authentication token'));
    } else {
      next(error);
    }
  }
}
