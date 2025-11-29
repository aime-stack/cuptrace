import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createProduct,
  getProductById,
  listProducts,
  updateProduct,
  deleteProduct,
  approveBatch,
  rejectBatch,
  verifyBatchByQRCode,
  getProductByLotId,
} from '../services/product.service';
import { sendSuccess } from '../utils/response';
// SupplyChainStage will be available after Prisma client generation
type SupplyChainStage = 'farmer' | 'washing_station' | 'factory' | 'exporter' | 'importer' | 'retailer';

export const createCoffeeController = async (
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
      harvestDate,
      processingType,
      grade,
      description,
      tags,
      metadata,
    } = req.body;

    const product = await createProduct({
      type: 'coffee',
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
      harvestDate,
      processingType,
      grade,
      description,
      tags,
      metadata,
    });

    return sendSuccess(res, product, 201);
  } catch (error) {
    next(error);
  }
};

export const getCoffeeController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const product = await getProductById(id, 'coffee');

    return sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

export const listCoffeeController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { 
      stage, 
      status,
      farmerId,
      cooperativeId,
      search,
      page = '1', 
      limit = '10' 
    } = req.query;

    const result = await listProducts(
      'coffee',
      stage ? (stage as SupplyChainStage) : undefined,
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      status as 'pending' | 'approved' | 'rejected' | 'in_transit' | 'completed' | undefined,
      farmerId as string | undefined,
      cooperativeId as string | undefined,
      search as string | undefined
    );

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const updateCoffeeController = async (
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

export const deleteCoffeeController = async (
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

export const approveCoffeeBatchController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const batch = await approveBatch(id);

    return sendSuccess(res, batch);
  } catch (error) {
    next(error);
  }
};

export const rejectCoffeeBatchController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const batch = await rejectBatch(id, reason);

    return sendSuccess(res, batch);
  } catch (error) {
    next(error);
  }
};

export const verifyCoffeeByQRCodeController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { qrCode } = req.params;

    const result = await verifyBatchByQRCode(qrCode);

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getCoffeeByLotIdController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { lotId } = req.params;

    const product = await getProductByLotId(lotId);

    return sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

