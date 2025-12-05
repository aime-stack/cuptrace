import { Response } from 'express';
import { PaginationResult } from './pagination';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Send successful response
 */
export const sendSuccess = <T>(res: Response, data: T, statusCode: number = 200): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
  } as ApiResponse<T>);
};

/**
 * Send success response with message
 */
export const sendSuccessWithMessage = <T>(
  res: Response,
  data: T,
  message: string,
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  } as ApiResponse<T>);
};

/**
 * Send paginated response
 */
export const sendPaginatedResponse = <T>(
  res: Response,
  result: PaginationResult<T>,
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
};

/**
 * Send error response
 */
export const sendError = (res: Response, error: string, statusCode: number = 500): Response => {
  return res.status(statusCode).json({
    success: false,
    error,
  } as ApiResponse);
};

/**
 * Send validation error response
 */
export const sendValidationError = (res: Response, errors: string[] | string): Response => {
  const errorMessage = Array.isArray(errors) ? errors.join(', ') : errors;
  return res.status(400).json({
    success: false,
    error: errorMessage,
  } as ApiResponse);
};

