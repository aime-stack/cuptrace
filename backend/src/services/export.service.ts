/**
 * Export Record Service
 * Handles export records for product batches
 */

import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { sanitizeString, isValidEmail, normalizeEmail } from '../utils/validation';
import { normalizePagination, createPaginationResult } from '../utils/pagination';
import { parseDate } from '../utils/date';

export interface CreateExportRecordData {
  batchId: string;
  exporterId: string;
  buyerName: string;
  buyerAddress?: string;
  buyerEmail?: string;
  shippingMethod: string;
  shippingDate: string | Date;
  expectedArrival?: string | Date;
  trackingNumber?: string;
  certificates?: string[];
  blockchainTxHash?: string;
}

export interface UpdateExportRecordData {
  buyerName?: string;
  buyerAddress?: string;
  buyerEmail?: string;
  shippingMethod?: string;
  shippingDate?: string | Date;
  expectedArrival?: string | Date;
  trackingNumber?: string;
  certificates?: string[];
  blockchainTxHash?: string;
}

/**
 * Create a new export record
 */
export const createExportRecord = async (data: CreateExportRecordData) => {
  if (!data.batchId) {
    throw new ValidationError('Batch ID is required');
  }

  if (!data.exporterId) {
    throw new ValidationError('Exporter ID is required');
  }

  const buyerName = sanitizeString(data.buyerName);
  if (!buyerName) {
    throw new ValidationError('Buyer name is required');
  }

  if (!data.shippingMethod) {
    throw new ValidationError('Shipping method is required');
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

  // Check if export record already exists for this batch
  const existing = await prisma.exportRecord.findUnique({
    where: { batchId: data.batchId },
  });

  if (existing) {
    throw new ValidationError('Export record already exists for this batch');
  }

  // Validate exporter exists
  const exporter = await prisma.user.findUnique({
    where: { id: data.exporterId },
  });

  if (!exporter) {
    throw new NotFoundError('Exporter not found');
  }

  if (exporter.role !== 'exporter') {
    throw new ValidationError('User is not an exporter');
  }

  // Validate buyer email if provided
  if (data.buyerEmail && !isValidEmail(data.buyerEmail)) {
    throw new ValidationError('Invalid buyer email format');
  }

  // Validate shipping method
  const validShippingMethods = ['air', 'sea', 'road'];
  if (!validShippingMethods.includes(data.shippingMethod.toLowerCase())) {
    throw new ValidationError('Shipping method must be one of: air, sea, road');
  }

  const shippingDate = parseDate(data.shippingDate);
  if (!shippingDate) {
    throw new ValidationError('Valid shipping date is required');
  }

  const expectedArrival = parseDate(data.expectedArrival);

  // Validate expected arrival is after shipping date
  if (expectedArrival && expectedArrival < shippingDate) {
    throw new ValidationError('Expected arrival date must be after shipping date');
  }

  const exportRecord = await prisma.exportRecord.create({
    data: {
      batchId: data.batchId,
      exporterId: data.exporterId,
      buyerName,
      buyerAddress: sanitizeString(data.buyerAddress),
      buyerEmail: data.buyerEmail ? normalizeEmail(data.buyerEmail) : null,
      shippingMethod: data.shippingMethod.toLowerCase(),
      shippingDate,
      expectedArrival,
      trackingNumber: sanitizeString(data.trackingNumber),
      certificates: data.certificates ? JSON.stringify(data.certificates) : null,
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
      exporter: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return exportRecord;
};

/**
 * Get export record by batch ID
 */
export const getExportRecordByBatchId = async (batchId: string) => {
  if (!batchId) {
    throw new ValidationError('Batch ID is required');
  }

  const exportRecord = await prisma.exportRecord.findUnique({
    where: { batchId },
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
      exporter: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!exportRecord) {
    throw new NotFoundError('Export record not found');
  }

  // Parse certificates JSON string to array if present
  const parsedRecord = {
    ...exportRecord,
    certificates: exportRecord.certificates 
      ? (JSON.parse(exportRecord.certificates) as string[])
      : null,
  };

  return parsedRecord;
};

/**
 * Get export record by ID
 */
export const getExportRecordById = async (id: string) => {
  if (!id) {
    throw new ValidationError('Export record ID is required');
  }

  const exportRecord = await prisma.exportRecord.findUnique({
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
      exporter: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!exportRecord) {
    throw new NotFoundError('Export record not found');
  }

  // Parse certificates JSON string to array if present
  const parsedRecord = {
    ...exportRecord,
    certificates: exportRecord.certificates 
      ? (JSON.parse(exportRecord.certificates) as string[])
      : null,
  };

  return parsedRecord;
};

/**
 * List export records with pagination
 */
export const listExportRecords = async (
  page: number = 1,
  limit: number = 10,
  exporterId?: string
) => {
  const pagination = normalizePagination(page, limit, 1, 10, 100);
  const skip = (pagination.page - 1) * pagination.limit;

  const where: Record<string, unknown> = {};

  if (exporterId) {
    where.exporterId = exporterId;
  }

  const [records, total] = await Promise.all([
    prisma.exportRecord.findMany({
      where,
      skip,
      take: pagination.limit,
      orderBy: {
        shippingDate: 'desc',
      },
      include: {
        batch: {
          select: {
            id: true,
            type: true,
            lotId: true,
          },
        },
        exporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.exportRecord.count({ where }),
  ]);

  // Parse certificates JSON string to array for each record
  const parsedRecords = records.map((record) => ({
    ...record,
    certificates: record.certificates 
      ? (JSON.parse(record.certificates) as string[])
      : null,
  }));

  return createPaginationResult(parsedRecords, total, pagination.page, pagination.limit);
};

/**
 * Update export record
 */
export const updateExportRecord = async (id: string, data: UpdateExportRecordData) => {
  if (!id) {
    throw new ValidationError('Export record ID is required');
  }

  const existing = await prisma.exportRecord.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Export record not found');
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.buyerName !== undefined) {
    const buyerName = sanitizeString(data.buyerName);
    if (!buyerName) {
      throw new ValidationError('Buyer name cannot be empty');
    }
    updateData.buyerName = buyerName;
  }

  if (data.buyerAddress !== undefined) {
    updateData.buyerAddress = sanitizeString(data.buyerAddress);
  }

  if (data.buyerEmail !== undefined) {
    if (data.buyerEmail && !isValidEmail(data.buyerEmail)) {
      throw new ValidationError('Invalid buyer email format');
    }
    updateData.buyerEmail = data.buyerEmail ? normalizeEmail(data.buyerEmail) : null;
  }

  if (data.shippingMethod !== undefined) {
    const validShippingMethods = ['air', 'sea', 'road'];
    if (!validShippingMethods.includes(data.shippingMethod.toLowerCase())) {
      throw new ValidationError('Shipping method must be one of: air, sea, road');
    }
    updateData.shippingMethod = data.shippingMethod.toLowerCase();
  }

  if (data.shippingDate !== undefined) {
    const shippingDate = parseDate(data.shippingDate);
    if (!shippingDate) {
      throw new ValidationError('Valid shipping date is required');
    }
    updateData.shippingDate = shippingDate;
  }

  if (data.expectedArrival !== undefined) {
    const expectedArrival = parseDate(data.expectedArrival);
    const shippingDate = data.shippingDate ? parseDate(data.shippingDate) : existing.shippingDate;
    
    if (expectedArrival && shippingDate && expectedArrival < shippingDate) {
      throw new ValidationError('Expected arrival date must be after shipping date');
    }
    updateData.expectedArrival = expectedArrival;
  }

  if (data.trackingNumber !== undefined) {
    updateData.trackingNumber = sanitizeString(data.trackingNumber);
  }

  if (data.certificates !== undefined) {
    updateData.certificates = data.certificates ? JSON.stringify(data.certificates) : null;
  }

  if (data.blockchainTxHash !== undefined) {
    updateData.blockchainTxHash = sanitizeString(data.blockchainTxHash);
  }

  const exportRecord = await prisma.exportRecord.update({
    where: { id },
    data: updateData,
    include: {
      batch: {
        select: {
          id: true,
          type: true,
          lotId: true,
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
    },
  });

  return exportRecord;
};

/**
 * Delete export record
 */
export const deleteExportRecord = async (id: string) => {
  if (!id) {
    throw new ValidationError('Export record ID is required');
  }

  const exportRecord = await prisma.exportRecord.findUnique({
    where: { id },
  });

  if (!exportRecord) {
    throw new NotFoundError('Export record not found');
  }

  await prisma.exportRecord.delete({
    where: { id },
  });

  return { message: 'Export record deleted successfully' };
};

