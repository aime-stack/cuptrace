import prisma from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { buildSoftDeleteFilter } from '../utils/query.js';
import { sanitizeString, isValidNonNegativeNumber } from '../utils/validation.js';
import { updateBatchStageOnChain } from './blockchain.service.js';

type SupplyChainStage = 'farmer' | 'washing_station' | 'factory' | 'exporter' | 'importer' | 'retailer';

// Define valid stage transitions
const STAGE_ORDER: SupplyChainStage[] = [
  'farmer',
  'washing_station',
  'factory',
  'exporter',
  'importer',
  'retailer',
];

export interface UpdateStageData {
  stage: SupplyChainStage;
  blockchainTxHash?: string;
  changedBy: string;
  notes?: string;
  quantity?: number;
  quality?: string;
  location?: string;
  metadata?: Record<string, unknown>;
}

export const validateStageTransition = (
  currentStage: SupplyChainStage,
  newStage: SupplyChainStage
): boolean => {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const newIndex = STAGE_ORDER.indexOf(newStage);

  // Allow moving forward in the chain or staying at the same stage
  return newIndex >= currentIndex;
};

export const updateBatchStage = async (
  batchId: string,
  data: UpdateStageData
) => {
  if (!batchId) {
    throw new ValidationError('Batch ID is required');
  }

  if (!data.changedBy) {
    throw new ValidationError('Changed by user ID is required');
  }

  // Find the batch
  const batch = await prisma.productBatch.findFirst({
    where: {
      id: batchId,
      ...buildSoftDeleteFilter(),
    },
  });

  if (!batch) {
    throw new NotFoundError('Product batch not found');
  }

  // Validate stage transition
  if (!validateStageTransition(batch.currentStage, data.stage)) {
    throw new ValidationError(
      `Invalid stage transition: cannot move from ${batch.currentStage} to ${data.stage}`
    );
  }

  // Validate enhanced fields if provided (BEFORE database update to prevent inconsistent state)
  if (data.quantity !== undefined && !isValidNonNegativeNumber(data.quantity)) {
    throw new ValidationError('Quantity must be a non-negative number');
  }

  // Update the batch stage
  const updatedBatch = await prisma.productBatch.update({
    where: { id: batchId },
    data: {
      currentStage: data.stage,
      blockchainTxHash: data.blockchainTxHash || batch.blockchainTxHash,
      // Update the appropriate participant ID based on stage
      ...(data.stage === 'washing_station' && {
        washingStationId: data.changedBy,
      }),
      ...(data.stage === 'factory' && {
        factoryId: data.changedBy,
      }),
      ...(data.stage === 'exporter' && {
        exporterId: data.changedBy,
      }),
      ...(data.stage === 'importer' && {
        importerId: data.changedBy,
      }),
      ...(data.stage === 'retailer' && {
        retailerId: data.changedBy,
      }),
    },
    include: {
      farmer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      washingStation: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      factory: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      exporter: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      importer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      retailer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  // Create history entry with enhanced fields
  await prisma.batchHistory.create({
    data: {
      batchId: batchId,
      stage: data.stage,
      changedBy: data.changedBy,
      blockchainTxHash: sanitizeString(data.blockchainTxHash) || null,
      notes: sanitizeString(data.notes),
      quantity: data.quantity ?? null,
      quality: sanitizeString(data.quality),
      location: sanitizeString(data.location),
      metadata: data.metadata ? (data.metadata as any) : undefined,
    },
  });

  // Update stage on blockchain (async, don't block on failure)
  updateBatchStageOnChain(
    batchId,
    data.stage,
    batch.currentStage,
    data.changedBy
  ).catch((error) => {
    console.error(`Failed to update batch stage on blockchain for ${batchId}:`, error);
    // Don't throw - blockchain failure shouldn't block stage update
  });

  return updatedBatch;
};

export const getBatchHistory = async (batchId: string) => {
  if (!batchId) {
    throw new ValidationError('Batch ID is required');
  }

  const batch = await prisma.productBatch.findFirst({
    where: {
      id: batchId,
      ...buildSoftDeleteFilter(),
    },
  });

  if (!batch) {
    throw new NotFoundError('Product batch not found');
  }

  const history = await prisma.batchHistory.findMany({
    where: { batchId },
    orderBy: {
      timestamp: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return history;
};

