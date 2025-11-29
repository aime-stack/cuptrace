import { Response, NextFunction } from 'express';
import { register, login, getCurrentUser } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const registerController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { 
      name, 
      email, 
      password, 
      role,
      phone,
      address,
      city,
      province,
      country,
      cooperativeId,
      registrationNumber,
    } = req.body;

    const result = await register({
      name,
      email,
      password,
      role,
      phone,
      address,
      city,
      province,
      country,
      cooperativeId,
      registrationNumber,
    });

    return sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    const result = await login({
      email,
      password,
    });

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const user = await getCurrentUser(req.user.id);

    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

