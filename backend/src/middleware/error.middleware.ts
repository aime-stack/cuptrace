import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import env from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  // Don't leak error details in production
  const message = env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  return sendError(res, message, 500);
};

