import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export const sendSuccess = <T>(res: Response, data: T, statusCode: number = 200): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
  } as ApiResponse<T>);
};

export const sendError = (res: Response, error: string, statusCode: number = 500): Response => {
  return res.status(statusCode).json({
    success: false,
    error,
  } as ApiResponse);
};

