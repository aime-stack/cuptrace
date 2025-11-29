import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
// SupplyChainStage will be available after Prisma client generation
// import { SupplyChainStage } from '@prisma/client';
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
  // Find the batch
  const batch = await prisma.productBatch.findFirst({
    where: {
      id: batchId,
      deletedAt: null,
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

  // Create history entry
  await prisma.batchHistory.create({
    data: {
      batchId: batchId,
      stage: data.stage,
      changedBy: data.changedBy,
      blockchainTxHash: data.blockchainTxHash,
    },
  });

  return updatedBatch;
};

export const getBatchHistory = async (batchId: string) => {
  const batch = await prisma.productBatch.findFirst({
    where: {
      id: batchId,
      deletedAt: null,
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

