import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createProduct,
  getProductById,
  listProducts,
  updateProduct,
  deleteProduct,
} from '../services/product.service';
import { sendSuccess } from '../utils/response';

export const createTeaController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { originLocation, farmerId } = req.body;

    const product = await createProduct({
      type: 'tea',
      originLocation,
      farmerId,
    });

    return sendSuccess(res, product, 201);
  } catch (error) {
    next(error);
  }
};

export const getTeaController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const product = await getProductById(id, 'tea');

    return sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

export const listTeaController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { stage, page = '1', limit = '10' } = req.query;

    const result = await listProducts(
      'tea',
      stage as any,
      parseInt(page as string, 10),
      parseInt(limit as string, 10)
    );

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const updateTeaController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await updateProduct(id, updateData);

    return sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

export const deleteTeaController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const result = await deleteProduct(id);

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

