/**
 * Processing Record Service
 * Handles processing records for product batches
 */

import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { sanitizeString, isValidNonNegativeNumber } from '../utils/validation';
import { normalizePagination, createPaginationResult, PaginationResult } from '../utils/pagination';
import { parseDate } from '../utils/date';

type SupplyChainStage = 'farmer' | 'washing_station' | 'factory' | 'exporter' | 'importer' | 'retailer';

export interface CreateProcessingRecordData {
  batchId: string;
  stage: SupplyChainStage;
  processingType: string;
  notes?: string;
  qualityScore?: number;
  quantityIn?: number;
  quantityOut?: number;
  processedBy: string;
  processedAt?: string | Date;
  blockchainTxHash?: string;
}

export interface UpdateProcessingRecordData {
  processingType?: string;
  notes?: string;
  qualityScore?: number;
  quantityIn?: number;
  quantityOut?: number;
  blockchainTxHash?: string;
}

/**
 * Create a new processing record
 */
export const createProcessingRecord = async (data: CreateProcessingRecordData) => {
  if (!data.batchId) {
    throw new ValidationError('Batch ID is required');
  }

  if (!data.processingType) {
    throw new ValidationError('Processing type is required');
  }

  if (!data.processedBy) {
    throw new ValidationError('Processed by user ID is required');
  }

  // Validate batch exists
  const batch = await prisma.productBatch.findFirst({
    where: {
      id: data.batchId,
      deletedAt: null,
    },
  });

  if (!batch) {
    throw new NotFoundError('Product batch not found');
  }

  // Validate processor exists
  const processor = await prisma.user.findUnique({
    where: { id: data.processedBy },
  });

  if (!processor) {
    throw new NotFoundError('Processor user not found');
  }

  // Validate quantities
  if (data.quantityIn !== undefined && !isValidNonNegativeNumber(data.quantityIn)) {
    throw new ValidationError('Quantity in must be a non-negative number');
  }

  if (data.quantityOut !== undefined && !isValidNonNegativeNumber(data.quantityOut)) {
    throw new ValidationError('Quantity out must be a non-negative number');
  }

  if (data.qualityScore !== undefined && (data.qualityScore < 0 || data.qualityScore > 100)) {
    throw new ValidationError('Quality score must be between 0 and 100');
  }

  // Validate quantity out is not greater than quantity in
  if (data.quantityIn !== undefined && data.quantityOut !== undefined) {
    if (data.quantityOut > data.quantityIn) {
      throw new ValidationError('Quantity out cannot be greater than quantity in');
    }
  }

  const processedAt = parseDate(data.processedAt) || new Date();

  const record = await prisma.processingRecord.create({
    data: {
      batchId: data.batchId,
      stage: data.stage,
      processingType: sanitizeString(data.processingType) || data.processingType,
      notes: sanitizeString(data.notes),
      qualityScore: data.qualityScore ?? null,
      quantityIn: data.quantityIn ?? null,
      quantityOut: data.quantityOut ?? null,
      processedBy: data.processedBy,
      processedAt,
      blockchainTxHash: sanitizeString(data.blockchainTxHash),
    },
    include: {
      batch: {
        select: {
          id: true,
          type: true,
          lotId: true,
          currentStage: true,
        },
      },
      processor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return record;
};

/**
 * Get processing record by ID
 */
export const getProcessingRecordById = async (id: string) => {
  if (!id) {
    throw new ValidationError('Processing record ID is required');
  }

  const record = await prisma.processingRecord.findUnique({
    where: { id },
    include: {
      batch: {
        select: {
          id: true,
          type: true,
          lotId: true,
          currentStage: true,
          status: true,
        },
      },
      processor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!record) {
    throw new NotFoundError('Processing record not found');
  }

  return record;
};

/**
 * List processing records for a batch
 */
export const listProcessingRecordsByBatch = async (
  batchId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResult<unknown>> => {
  if (!batchId) {
    throw new ValidationError('Batch ID is required');
  }

  // Validate batch exists
  const batch = await prisma.productBatch.findFirst({
    where: {
      id: batchId,
      deletedAt: null,
    },
  });

  if (!batch) {
    throw new NotFoundError('Product batch not found');
  }

  const pagination = normalizePagination(page, limit, 1, 10, 100);
  const skip = (pagination.page - 1) * pagination.limit;

  const [records, total] = await Promise.all([
    prisma.processingRecord.findMany({
      where: { batchId },
      skip,
      take: pagination.limit,
      orderBy: {
        processedAt: 'desc',
      },
      include: {
        processor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.processingRecord.count({ where: { batchId } }),
  ]);

  return createPaginationResult(records, total, pagination.page, pagination.limit);
};

/**
 * List all processing records with pagination
 */
export const listProcessingRecords = async (
  page: number = 1,
  limit: number = 10,
  batchId?: string,
  stage?: SupplyChainStage
): Promise<PaginationResult<unknown>> => {
  const pagination = normalizePagination(page, limit, 1, 10, 100);
  const skip = (pagination.page - 1) * pagination.limit;

  const where: Record<string, unknown> = {};

  if (batchId) {
    where.batchId = batchId;
  }

  if (stage) {
    where.stage = stage;
  }

  const [records, total] = await Promise.all([
    prisma.processingRecord.findMany({
      where,
      skip,
      take: pagination.limit,
      orderBy: {
        processedAt: 'desc',
      },
      include: {
        batch: {
          select: {
            id: true,
            type: true,
            lotId: true,
          },
        },
        processor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.processingRecord.count({ where }),
  ]);

  return createPaginationResult(records, total, pagination.page, pagination.limit);
};

/**
 * Update processing record
 */
export const updateProcessingRecord = async (id: string, data: UpdateProcessingRecordData) => {
  if (!id) {
    throw new ValidationError('Processing record ID is required');
  }

  const existing = await prisma.processingRecord.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Processing record not found');
  }

  // Validate quantities
  if (data.quantityIn !== undefined && !isValidNonNegativeNumber(data.quantityIn)) {
    throw new ValidationError('Quantity in must be a non-negative number');
  }

  if (data.quantityOut !== undefined && !isValidNonNegativeNumber(data.quantityOut)) {
    throw new ValidationError('Quantity out must be a non-negative number');
  }

  if (data.qualityScore !== undefined && (data.qualityScore < 0 || data.qualityScore > 100)) {
    throw new ValidationError('Quality score must be between 0 and 100');
  }

  // Validate quantity out is not greater than quantity in
  const quantityIn = data.quantityIn ?? existing.quantityIn;
  const quantityOut = data.quantityOut ?? existing.quantityOut;
  if (quantityIn !== null && quantityOut !== null && quantityOut > quantityIn) {
    throw new ValidationError('Quantity out cannot be greater than quantity in');
  }

  const updateData: Record<string, unknown> = {};

  if (data.processingType !== undefined) {
    updateData.processingType = sanitizeString(data.processingType) || data.processingType;
  }

  if (data.notes !== undefined) {
    updateData.notes = sanitizeString(data.notes);
  }

  if (data.qualityScore !== undefined) {
    updateData.qualityScore = data.qualityScore;
  }

  if (data.quantityIn !== undefined) {
    updateData.quantityIn = data.quantityIn;
  }

  if (data.quantityOut !== undefined) {
    updateData.quantityOut = data.quantityOut;
  }

  if (data.blockchainTxHash !== undefined) {
    updateData.blockchainTxHash = sanitizeString(data.blockchainTxHash);
  }

  const record = await prisma.processingRecord.update({
    where: { id },
    data: updateData,
    include: {
      batch: {
        select: {
          id: true,
          type: true,
          lotId: true,
          currentStage: true,
        },
      },
      processor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return record;
};

/**
 * Delete processing record
 */
export const deleteProcessingRecord = async (id: string) => {
  if (!id) {
    throw new ValidationError('Processing record ID is required');
  }

  const record = await prisma.processingRecord.findUnique({
    where: { id },
  });

  if (!record) {
    throw new NotFoundError('Processing record not found');
  }

  await prisma.processingRecord.delete({
    where: { id },
  });

  return { message: 'Processing record deleted successfully' };
};

