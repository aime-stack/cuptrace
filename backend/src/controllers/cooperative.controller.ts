import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import {
  createCooperative,
  getCooperativeById,
  listCooperatives,
  updateCooperative,
  deleteCooperative,
} from '../services/cooperative.service.js';
import { sendSuccess, sendPaginatedResponse } from '../utils/response.js';

export const createCooperativeController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { name, location, description } = req.body;

    const cooperative = await createCooperative({
      name,
      location,
      description,
    });

    return sendSuccess(res, cooperative, 201);
  } catch (error) {
    next(error);
  }
};

export const getCooperativeController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const cooperative = await getCooperativeById(id);

    return sendSuccess(res, cooperative);
  } catch (error) {
    next(error);
  }
};

export const listCooperativesController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { page = '1', limit = '10', search } = req.query;

    const result = await listCooperatives(
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      search as string | undefined
    );

    return sendPaginatedResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const updateCooperativeController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { name, location, description } = req.body;

    const cooperative = await updateCooperative(id, {
      name,
      location,
      description,
    });

    return sendSuccess(res, cooperative);
  } catch (error) {
    next(error);
  }
};

export const deleteCooperativeController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const result = await deleteCooperative(id);

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

