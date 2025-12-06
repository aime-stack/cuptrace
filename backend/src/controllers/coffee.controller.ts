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
import { mintBatchNFT } from '../services/nft.service';
import { createBatchOnChain } from '../services/blockchain.service';
import env from '../config/env';
import { sendSuccess, sendSuccessWithMessage } from '../utils/response';
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

    console.log('[CREATE BATCH] User:', req.user?.email, 'Role:', req.user?.role);
    console.log('[CREATE BATCH] Request body:', req.body);

    // Determine farmerId and cooperativeId based on authenticated user
    let finalFarmerId = farmerId;
    let finalCooperativeId = cooperativeId;

    if (req.user?.role === 'farmer') {
      // Farmer creating their own batch
      finalFarmerId = req.user.id;
      if (req.user.cooperativeId) {
        finalCooperativeId = req.user.cooperativeId;
      }
    } else if (req.user?.role === 'agent') {
      // Agent creating batch on behalf of a farmer
      // farmerId should be provided in request body
      if (!farmerId) {
        return res.status(400).json({
          success: false,
          error: 'Farmer ID is required when agent creates a batch',
        });
      }
      // Use agent's cooperative if not specified
      if (!cooperativeId && req.user.cooperativeId) {
        finalCooperativeId = req.user.cooperativeId;
      }
    }

    console.log('[CREATE BATCH] Final farmerId:', finalFarmerId, 'cooperativeId:', finalCooperativeId);

    const product = await createProduct({
      type: 'coffee',
      originLocation,
      farmerId: finalFarmerId,
      cooperativeId: finalCooperativeId,
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

    console.log('[CREATE BATCH] Success! Batch ID:', product.id);
    return sendSuccess(res, product, 201);
  } catch (error) {
    console.error('[CREATE BATCH] Error:', error);
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

/**
 * Retry NFT minting for a batch
 */
export const retryMintNFTCoffeeController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const walletPrivateKey = env.WALLET_PRIVATE_KEY;

    if (!walletPrivateKey) {
      return res.status(400).json({
        success: false,
        error: 'WALLET_PRIVATE_KEY not configured. Cannot mint NFT.',
      });
    }

    const nftInfo = await mintBatchNFT(id, walletPrivateKey);
    return sendSuccessWithMessage(res, nftInfo, 'NFT minted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Retry blockchain record creation for a batch
 */
export const retryBlockchainRecordCoffeeController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const batch = await getProductById(id, 'coffee');
    const walletPrivateKey = env.WALLET_PRIVATE_KEY;

    if (!walletPrivateKey) {
      return res.status(400).json({
        success: false,
        error: 'WALLET_PRIVATE_KEY not configured. Cannot create blockchain record.',
      });
    }

    const txHash = await createBatchOnChain(
      id,
      {
        type: 'coffee',
        originLocation: batch.originLocation,
        farmerId: batch.farmerId || undefined,
        timestamp: new Date().toISOString(),
      },
      walletPrivateKey
    );

    return sendSuccessWithMessage(res, { txHash }, 'Blockchain record created successfully');
  } catch (error) {
    next(error);
  }
};

