/**
 * Certificate Service
 * Handles certificate management for product batches
 */

import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { sanitizeString } from '../utils/validation';
import { normalizePagination, createPaginationResult, PaginationResult } from '../utils/pagination';
import { parseDate } from '../utils/date';

type CertificateType = 'organic' | 'fair_trade' | 'quality_grade' | 'export_permit' | 'health_certificate' | 'origin_certificate' | 'other';

export interface CreateCertificateData {
  batchId: string;
  certificateType: CertificateType;
  certificateNumber: string;
  issuedBy: string;
  issuedDate: string | Date;
  expiryDate?: string | Date;
  documentUrl?: string;
  blockchainTxHash?: string;
}

export interface UpdateCertificateData {
  certificateType?: CertificateType;
  certificateNumber?: string;
  issuedBy?: string;
  issuedDate?: string | Date;
  expiryDate?: string | Date;
  documentUrl?: string;
  blockchainTxHash?: string;
}

/**
 * Create a new certificate
 */
export const createCertificate = async (data: CreateCertificateData) => {
  if (!data.batchId) {
    throw new ValidationError('Batch ID is required');
  }

  const certificateNumber = sanitizeString(data.certificateNumber);
  if (!certificateNumber) {
    throw new ValidationError('Certificate number is required');
  }

  const issuedBy = sanitizeString(data.issuedBy);
  if (!issuedBy) {
    throw new ValidationError('Issued by is required');
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

  // Check if certificate number already exists
  const existing = await prisma.certificate.findUnique({
    where: { certificateNumber },
  });

  if (existing) {
    throw new ValidationError('Certificate with this number already exists');
  }

  const issuedDate = parseDate(data.issuedDate);
  if (!issuedDate) {
    throw new ValidationError('Valid issued date is required');
  }

  const expiryDate = parseDate(data.expiryDate);

  // Validate expiry date is after issued date
  if (expiryDate && expiryDate < issuedDate) {
    throw new ValidationError('Expiry date must be after issued date');
  }

  const certificate = await prisma.certificate.create({
    data: {
      batchId: data.batchId,
      certificateType: data.certificateType,
      certificateNumber,
      issuedBy,
      issuedDate,
      expiryDate,
      documentUrl: sanitizeString(data.documentUrl),
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
    },
  });

  return certificate;
};

/**
 * Get certificate by ID
 */
export const getCertificateById = async (id: string) => {
  if (!id) {
    throw new ValidationError('Certificate ID is required');
  }

  const certificate = await prisma.certificate.findUnique({
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
    },
  });

  if (!certificate) {
    throw new NotFoundError('Certificate not found');
  }

  return certificate;
};

/**
 * Get certificate by certificate number
 */
export const getCertificateByNumber = async (certificateNumber: string) => {
  if (!certificateNumber) {
    throw new ValidationError('Certificate number is required');
  }

  const certificate = await prisma.certificate.findUnique({
    where: { certificateNumber },
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
    },
  });

  if (!certificate) {
    throw new NotFoundError('Certificate not found');
  }

  return certificate;
};

/**
 * List certificates for a batch
 */
export const listCertificatesByBatch = async (
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

  const [certificates, total] = await Promise.all([
    prisma.certificate.findMany({
      where: { batchId },
      skip,
      take: pagination.limit,
      orderBy: {
        issuedDate: 'desc',
      },
      include: {
        batch: {
          select: {
            id: true,
            type: true,
            lotId: true,
          },
        },
      },
    }),
    prisma.certificate.count({ where: { batchId } }),
  ]);

  return createPaginationResult(certificates, total, pagination.page, pagination.limit);
};

/**
 * List all certificates with pagination
 */
export const listCertificates = async (
  page: number = 1,
  limit: number = 10,
  batchId?: string,
  certificateType?: CertificateType
): Promise<PaginationResult<unknown>> => {
  const pagination = normalizePagination(page, limit, 1, 10, 100);
  const skip = (pagination.page - 1) * pagination.limit;

  const where: Record<string, unknown> = {};

  if (batchId) {
    where.batchId = batchId;
  }

  if (certificateType) {
    where.certificateType = certificateType;
  }

  const [certificates, total] = await Promise.all([
    prisma.certificate.findMany({
      where,
      skip,
      take: pagination.limit,
      orderBy: {
        issuedDate: 'desc',
      },
      include: {
        batch: {
          select: {
            id: true,
            type: true,
            lotId: true,
          },
        },
      },
    }),
    prisma.certificate.count({ where }),
  ]);

  return createPaginationResult(certificates, total, pagination.page, pagination.limit);
};

/**
 * Update certificate
 */
export const updateCertificate = async (id: string, data: UpdateCertificateData) => {
  if (!id) {
    throw new ValidationError('Certificate ID is required');
  }

  const existing = await prisma.certificate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Certificate not found');
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.certificateType !== undefined) {
    updateData.certificateType = data.certificateType;
  }

  if (data.certificateNumber !== undefined) {
    const certificateNumber = sanitizeString(data.certificateNumber);
    if (!certificateNumber) {
      throw new ValidationError('Certificate number cannot be empty');
    }

    // Check if certificate number is already taken by another certificate
    const numberExists = await prisma.certificate.findFirst({
      where: {
        certificateNumber,
        id: { not: id },
      },
    });

    if (numberExists) {
      throw new ValidationError('Certificate with this number already exists');
    }

    updateData.certificateNumber = certificateNumber;
  }

  if (data.issuedBy !== undefined) {
    const issuedBy = sanitizeString(data.issuedBy);
    if (!issuedBy) {
      throw new ValidationError('Issued by cannot be empty');
    }
    updateData.issuedBy = issuedBy;
  }

  if (data.issuedDate !== undefined) {
    const issuedDate = parseDate(data.issuedDate);
    if (!issuedDate) {
      throw new ValidationError('Valid issued date is required');
    }
    updateData.issuedDate = issuedDate;
  }

  if (data.expiryDate !== undefined) {
    const expiryDate = parseDate(data.expiryDate);
    const issuedDate = data.issuedDate ? parseDate(data.issuedDate) : existing.issuedDate;
    
    if (expiryDate && issuedDate && expiryDate < issuedDate) {
      throw new ValidationError('Expiry date must be after issued date');
    }
    updateData.expiryDate = expiryDate;
  }

  if (data.documentUrl !== undefined) {
    updateData.documentUrl = sanitizeString(data.documentUrl);
  }

  if (data.blockchainTxHash !== undefined) {
    updateData.blockchainTxHash = sanitizeString(data.blockchainTxHash);
  }

  const certificate = await prisma.certificate.update({
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
    },
  });

  return certificate;
};

/**
 * Delete certificate
 */
export const deleteCertificate = async (id: string) => {
  if (!id) {
    throw new ValidationError('Certificate ID is required');
  }

  const certificate = await prisma.certificate.findUnique({
    where: { id },
  });

  if (!certificate) {
    throw new NotFoundError('Certificate not found');
  }

  await prisma.certificate.delete({
    where: { id },
  });

  return { message: 'Certificate deleted successfully' };
};

