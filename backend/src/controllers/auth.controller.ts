import { Response, NextFunction } from 'express';
import {
  register,
  login,
  getCurrentUser,
  listUsers,
  getUserById,
  updateUser,
  changePassword,
  resetPassword,
  deactivateUser,
  activateUser,
} from '../services/auth.service';
import { sendSuccess, sendPaginatedResponse } from '../utils/response';
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

export const listUsersController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const {
      role,
      isActive,
      cooperativeId,
      page = '1',
      limit = '10',
    } = req.query;

    const result = await listUsers(
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      role as 'farmer' | 'ws' | 'factory' | 'exporter' | 'importer' | 'retailer' | 'admin' | undefined,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      cooperativeId as string | undefined
    );

    return sendPaginatedResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getUserByIdController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const user = await getUserById(id);

    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      address,
      city,
      province,
      country,
      cooperativeId,
      registrationNumber,
    } = req.body;

    const user = await updateUser(id, {
      name,
      phone,
      address,
      city,
      province,
      country,
      cooperativeId,
      registrationNumber,
    });

    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const changePasswordController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const { currentPassword, newPassword } = req.body;

    const result = await changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const result = await resetPassword(id, newPassword);

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const deactivateUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const user = await deactivateUser(id);

    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const activateUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const user = await activateUser(id);

    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

