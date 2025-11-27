import { Response, NextFunction } from 'express';
import { register, login } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const registerController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { name, email, password, role } = req.body;

    const result = await register({
      name,
      email,
      password,
      role,
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

