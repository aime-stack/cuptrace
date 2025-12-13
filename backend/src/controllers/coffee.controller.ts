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
import { mintBatchNFT, generateNFTMetadata } from '../services/nft.service';
import { uploadJSONToIPFS } from '../utils/ipfs.util';
import { createBatchOnChain, createApprovalUTxO } from '../services/blockchain.service';
import { generateQRCodeForBatch } from '../services/qrGenerator';
import { sendBatchApprovedNotification } from '../services/notifications.service';
import env from '../config/env';
import { sendSuccess, sendPaginatedResponse, sendSuccessWithMessage } from '../utils/response';

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

    return sendPaginatedResponse(res, result);
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

    let product = await updateProduct(id, updateData);

    // WORKFLOW CHANGE: "Lazy Minting" - Real Minting happens here
    if (updateData.status === 'completed' && env.WALLET_PRIVATE_KEY) {
      console.log('[UPDATE BATCH] Batch completed. Triggering Real Blockchain Mint...');
      try {
        // 1. Mint NFT on Cardano
        const nftInfo = await mintBatchNFT(id, env.WALLET_PRIVATE_KEY);
        console.log('[UPDATE BATCH] NFT Minted:', nftInfo.policyId);

        // 2. Generate QR Code
        const qrInfo = await generateQRCodeForBatch(id);
        if (qrInfo && qrInfo.success) {
          console.log('[UPDATE BATCH] QR Generated:', qrInfo.qrCodeUrl);
        }

        // Fetch updated product to return full data
        product = await getProductById(id, 'coffee');

      } catch (e) {
        console.error('[UPDATE BATCH] Post-completion minting failed:', e);
        // We do not throw; the batch is completed even if minting fails (retriable)
      }
    }

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

    // Only Quality Controllers can approve and trigger minting
    if (req.user?.role !== 'qc') {
      return res.status(403).json({ success: false, error: 'Only Quality Controllers may approve batches' });
    }

    const batch = await approveBatch(id);

    // Fetch full batch data to generate metadata
    const fullBatch = await getProductById(id, 'coffee');

    let ipfsCid = '';
    let approvalTxHash = '';
    let nftInfo = null;

    // Generate CIP-25 compliant metadata and upload to IPFS
    try {
      const metadata = generateNFTMetadata(fullBatch);
      ipfsCid = await uploadJSONToIPFS(metadata);

      // Persist IPFS CID inside batch metadata for transparency
      await updateProduct(id, {
        metadata: {
          ...(fullBatch.metadata as Record<string, unknown> || {}),
          ipfsCid,
        },
      });

      console.log('[QC APPROVAL] Successfully uploaded metadata to IPFS:', ipfsCid);
    } catch (ipfsErr) {
      console.warn('[QC APPROVAL] Failed to upload metadata to IPFS:', ipfsErr);
      // Continue without IPFS; this is not a critical failure
    }

    // Create an on-chain QC approval UTxO (so Plutus policies can require it)
    const walletPrivateKey = env.WALLET_PRIVATE_KEY;
    if (walletPrivateKey) {
      try {
        approvalTxHash = await createApprovalUTxO(id, req.user!.id, walletPrivateKey);
        console.log('[QC APPROVAL] Created on-chain approval UTxO:', approvalTxHash);
      } catch (err) {
        console.warn('[QC APPROVAL] Failed to create on-chain approval UTxO:', err);
      }
    } else {
      console.warn('[QC APPROVAL] WALLET_PRIVATE_KEY not configured; skipping creation of on-chain approval UTxO');
    }

    // Trigger NFT minting (uses WALLET_PRIVATE_KEY from env)
    // WORKFLOW CHANGE: Logic moved to "Lazy Minting". 
    // QC Approval now only creates a PENDING (Virtual) status.
    // Real minting happens on Factory Completion.
    if (env.WALLET_PRIVATE_KEY) {
      console.log('[QC APPROVAL] "Lazy Minting" active: Creating Virtual (Pending) NFT record.');

      // Create a deterministic "pending" ID so UI shows "Pending / Local Only"
      const pendingPolicyId = `pending_${Buffer.from(id).toString('hex').substring(0, 56)}`;

      // Update batch to show as 'Pending' in UI (Virtual Record)
      await updateProduct(id, {
        metadata: {
          ...(fullBatch.metadata as Record<string, unknown> || {}),
          nftMinted: false,
          nftPending: true,
          nftPolicyId: pendingPolicyId,
          nftAssetName: 'pending_mint'
        }
      });

      nftInfo = { policyId: pendingPolicyId, assetName: 'pending_mint', txHash: '' };

    } else {
      console.warn('[QC APPROVAL] WALLET_PRIVATE_KEY not configured; skipping NFT minting checks');
    }

    // Auto-generate QR code for approved batch
    // WORKFLOW CHANGE: Moved to Factory Completion.
    let qrInfo = null;
    // We do NOT call generateQRCodeForBatch here anymore.


    // Send notification to farmer
    let notificationSent = false;
    try {
      const notifResult = await sendBatchApprovedNotification(id, true);
      notificationSent = true;
      console.log('[QC APPROVAL] Farmer notification sent:', notifResult.notificationId, 'SMS:', notifResult.smsSent);
    } catch (notifErr) {
      console.warn('[QC APPROVAL] Failed to send notification:', notifErr);
      // Continue; notification is not critical for batch approval
    }

    return sendSuccess(res, {
      batch,
      nft: nftInfo,
      ipfsCid: ipfsCid || undefined,
      approvalTxHash: approvalTxHash || undefined,
      qrCode: qrInfo?.success ? {
        url: qrInfo.qrCodeUrl,
        publicTraceHash: qrInfo.publicTraceHash,
      } : undefined,
      notificationSent,
    });
  } catch (error) {
    console.error('[QC APPROVAL] Unexpected error:', error);
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