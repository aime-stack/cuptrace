import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';
import { AuthenticationError } from '../utils/errors';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    cooperativeId?: string | null;
  };
}

const userCache = new Map<string, { user: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

export const verifyTokenMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Check cache
    const now = Date.now();
    const cached = userCache.get(decoded.userId);
    let user;

    if (cached && now - cached.timestamp < CACHE_TTL) {
      user = cached.user;
    } else {
      // Fetch user from database
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          cooperativeId: true,
        },
      });

      if (user) {
        userCache.set(decoded.userId, { user, timestamp: now });
      }
    }

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated. Please contact administrator.');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      cooperativeId: user.cooperativeId,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('User not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AuthenticationError('Not authorized to access this route'));
    }

    next();
  };
};

