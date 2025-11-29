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
// SupplyChainStage will be available after Prisma client generation
type SupplyChainStage = 'farmer' | 'washing_station' | 'factory' | 'exporter' | 'importer' | 'retailer';

export const createTeaController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { 
      originLocation, 
      farmerId,
      cooperativeId,
      region,
      district,
      sector,
      cell,
      village,
      coordinates,
      lotId,
      quantity,
      quality,
      moisture,
      pluckingDate,
      teaType,
      description,
      tags,
    } = req.body;

    const product = await createProduct({
      type: 'tea',
      originLocation,
      farmerId,
      cooperativeId,
      region,
      district,
      sector,
      cell,
      village,
      coordinates,
      lotId,
      quantity,
      quality,
      moisture,
      pluckingDate,
      teaType,
      description,
      tags,
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
      stage ? (stage as SupplyChainStage) : undefined,
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

