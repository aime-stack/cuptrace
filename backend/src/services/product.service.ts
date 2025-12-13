import prisma from '../config/database';
import crypto from 'crypto';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parseDate } from '../utils/date';
import { sanitizeString, isValidCoordinates, isValidNonNegativeNumber } from '../utils/validation';
import { normalizePagination, createPaginationResult, PaginationResult } from '../utils/pagination';
import { buildSoftDeleteFilter } from '../utils/query';
import { generateQRCode, generateVerificationUrl } from '../utils/qrcode';
import { createBatchOnChain } from './blockchain.service';
import env from '../config/env';

type ProductType = 'coffee' | 'tea';
type SupplyChainStage = 'farmer' | 'washing_station' | 'factory' | 'exporter' | 'importer' | 'retailer';
type BatchStatus = 'pending' | 'approved' | 'rejected' | 'in_transit' | 'completed';

export interface CreateProductData {
  type: ProductType;
  originLocation: string;
  farmerId?: string;
  cooperativeId?: string;
  // Location fields
  region?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  coordinates?: string;
  // Product attributes
  lotId?: string;
  quantity?: number;
  quality?: string;
  moisture?: number;
  harvestDate?: string;
  pluckingDate?: string;
  // Coffee-specific
  processingType?: string;
  grade?: string;
  // Tea-specific
  teaType?: string;
  // Metadata
  description?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateProductData {
  originLocation?: string;
  farmerId?: string;
  washingStationId?: string;
  factoryId?: string;
  exporterId?: string;
  importerId?: string;
  retailerId?: string;
  cooperativeId?: string;
  // Location fields
  region?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  coordinates?: string;
  // Product attributes
  lotId?: string;
  quantity?: number;
  quality?: string;
  moisture?: number;
  harvestDate?: string;
  pluckingDate?: string;
  // Coffee-specific
  processingType?: string;
  grade?: string;
  // Tea-specific
  teaType?: string;
  // Status
  status?: BatchStatus;
  // Metadata
  description?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export const createProduct = async (data: CreateProductData) => {
  // Validate and sanitize input
  const originLocation = sanitizeString(data.originLocation);
  if (!originLocation) {
    throw new ValidationError('Origin location is required');
  }

  // Validate farmer exists if provided
  if (data.farmerId) {
    const farmer = await prisma.user.findUnique({
      where: { id: data.farmerId },
    });

    if (!farmer) {
      throw new ValidationError('Farmer not found');
    }

    if (farmer.role !== 'farmer') {
      throw new ValidationError('User is not a farmer');
    }
  }

  // Validate cooperative exists if provided
  if (data.cooperativeId) {
    const cooperative = await prisma.cooperative.findUnique({
      where: { id: data.cooperativeId },
    });

    if (!cooperative) {
      throw new ValidationError('Cooperative not found');
    }
  }

  // Validate coordinates if provided
  if (data.coordinates && !isValidCoordinates(data.coordinates)) {
    throw new ValidationError('Invalid coordinates format. Expected format: lat,lng');
  }

  // Validate quantity if provided
  if (data.quantity !== undefined && !isValidNonNegativeNumber(data.quantity)) {
    throw new ValidationError('Quantity must be a non-negative number');
  }

  // Validate moisture if provided
  if (data.moisture !== undefined && (data.moisture < 0 || data.moisture > 100)) {
    throw new ValidationError('Moisture must be between 0 and 100');
  }

  // Parse dates
  const harvestDate = parseDate(data.harvestDate);
  const pluckingDate = parseDate(data.pluckingDate);

  // Create product first (we'll update QR code after we have the ID)
  const product = await prisma.productBatch.create({
    data: {
      type: data.type,
      originLocation,
      farmerId: data.farmerId || null,
      cooperativeId: data.cooperativeId || null,
      currentStage: 'farmer',
      status: 'pending',
      // Location fields
      region: sanitizeString(data.region),
      district: sanitizeString(data.district),
      sector: sanitizeString(data.sector),
      cell: sanitizeString(data.cell),
      village: sanitizeString(data.village),
      coordinates: data.coordinates ? sanitizeString(data.coordinates) : null,
      // Product attributes
      lotId: sanitizeString(data.lotId),
      quantity: data.quantity ?? null,
      quality: sanitizeString(data.quality),
      moisture: data.moisture ?? null,
      harvestDate,
      pluckingDate,
      // Coffee-specific
      processingType: sanitizeString(data.processingType),
      grade: sanitizeString(data.grade),
      // Tea-specific
      teaType: sanitizeString(data.teaType),
      // Metadata
      description: sanitizeString(data.description),
      tags: data.tags || [],
      metadata: data.metadata ? (data.metadata as any) : undefined,
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

  // Generate QR code and verification URL with actual batch ID
  const qrCode = generateQRCode(product.id, data.type);
  const verificationUrl = generateVerificationUrl(product.id);

  // Get wallet private key from environment for blockchain operations
  // For now, use system wallet. In future, this could be per-user wallet
  const walletPrivateKey = env.WALLET_PRIVATE_KEY;

  // Mint NFT for the batch (async, don't block on failure)
  // Only attempt if wallet is configured
  // NOTE: NFT minting is intentionally deferred until quality control approval.
  // The Quality Controller (QC) will trigger minting after batch approval to
  // ensure NFTs are only minted for quality-approved batches. See QC workflow.

  // Create batch on blockchain (async, don't block on failure)
  // Only attempt if wallet is configured
  if (walletPrivateKey) {
    createBatchOnChain(
      product.id,
      {
        type: data.type,
        originLocation,
        farmerId: data.farmerId,
        timestamp: new Date().toISOString(),
      },
      walletPrivateKey
    )
      .then((txHash) => {
        console.log(`✅ Batch ${product.id} recorded on blockchain: ${txHash}`);
      })
      .catch((error) => {
        console.error(`❌ Failed to create batch on blockchain for ${product.id}:`, error);
        // Blockchain failure is logged but doesn't block batch creation
        // User can retry manually later
      });
  } else {
    console.warn(`⚠️  WALLET_PRIVATE_KEY not configured. Blockchain record skipped for batch ${product.id}`);
  }

  // Update product with QR code
  const updatedProduct = await prisma.productBatch.update({
    where: { id: product.id },
    data: {
      qrCode,
      qrCodeGeneratedAt: new Date(),
      verificationUrl,
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
      cooperative: {
        select: {
          id: true,
          name: true,
          location: true,
        },
      },
    },
  });

  return updatedProduct;
};

export const getProductById = async (id: string, type?: ProductType) => {
  if (!id) {
    throw new ValidationError('Product ID is required');
  }

  const product = await prisma.productBatch.findFirst({
    where: {
      id,
      ...buildSoftDeleteFilter(),
      ...(type && { type }),
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
      history: {
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
      },
      cooperative: {
        select: {
          id: true,
          name: true,
          location: true,
        },
      },
      events: {
        orderBy: {
          timestamp: 'desc',
        },
        include: {
          operator: {
            select: {
              id: true,
              name: true,
              role: true,
            }
          }
        }
      },
      documents: {
        orderBy: {
          createdAt: 'desc',
        }
      },
      integrity: true,
    },
  });

  if (!product) {
    throw new NotFoundError('Product batch not found');
  }

  return product;
};

export const listProducts = async (
  type?: ProductType,
  stage?: SupplyChainStage,
  page: number = 1,
  limit: number = 10,
  status?: BatchStatus,
  farmerId?: string,
  cooperativeId?: string,
  search?: string
): Promise<PaginationResult<unknown>> => {
  const pagination = normalizePagination(page, limit, 1, 10, 100);
  const skip = (pagination.page - 1) * pagination.limit;

  const where: Record<string, unknown> = {
    ...buildSoftDeleteFilter(),
  };

  if (type) {
    where.type = type;
  }

  if (stage) {
    where.currentStage = stage;
  }

  if (status) {
    where.status = status;
  }

  if (farmerId) {
    where.farmerId = farmerId;
  }

  if (cooperativeId) {
    where.cooperativeId = cooperativeId;
  }

  if (search) {
    const searchTerm = sanitizeString(search);
    where.OR = [
      { lotId: { contains: searchTerm || '', mode: 'insensitive' } },
      { originLocation: { contains: searchTerm || '', mode: 'insensitive' } },
      { description: { contains: searchTerm || '', mode: 'insensitive' } },
      { quality: { contains: searchTerm || '', mode: 'insensitive' } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.productBatch.findMany({
      where,
      skip,
      take: pagination.limit,
      orderBy: {
        createdAt: 'desc',
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
        cooperative: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    }),
    prisma.productBatch.count({ where }),
  ]);

  return createPaginationResult(products, total, pagination.page, pagination.limit);
};

export const updateProduct = async (id: string, data: UpdateProductData) => {
  // Check if product exists
  const existingProduct = await prisma.productBatch.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existingProduct) {
    throw new NotFoundError('Product batch not found');
  }

  // Validate user IDs if provided
  const userIds = [
    data.farmerId,
    data.washingStationId,
    data.factoryId,
    data.exporterId,
    data.importerId,
    data.retailerId,
  ].filter(Boolean) as string[];

  if (userIds.length > 0) {
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
    });

    if (users.length !== userIds.length) {
      throw new ValidationError('One or more users not found');
    }
  }

  // Validate coordinates if provided
  if (data.coordinates !== undefined && data.coordinates !== null && !isValidCoordinates(data.coordinates)) {
    throw new ValidationError('Invalid coordinates format. Expected format: lat,lng');
  }

  // Validate quantity if provided
  if (data.quantity !== undefined && !isValidNonNegativeNumber(data.quantity)) {
    throw new ValidationError('Quantity must be a non-negative number');
  }

  // Validate moisture if provided
  if (data.moisture !== undefined && (data.moisture < 0 || data.moisture > 100)) {
    throw new ValidationError('Moisture must be between 0 and 100');
  }

  // Validate cooperative exists if provided
  if (data.cooperativeId !== undefined && data.cooperativeId !== null) {
    const cooperative = await prisma.cooperative.findUnique({
      where: { id: data.cooperativeId },
    });

    if (!cooperative) {
      throw new ValidationError('Cooperative not found');
    }
  }

  // Prepare update data, handling date strings and removing undefined values
  const updateData: {
    updatedAt: Date;
    [key: string]: unknown;
  } = {
    updatedAt: new Date(),
  };

  // Only include fields that are provided, with sanitization
  if (data.originLocation !== undefined) updateData.originLocation = sanitizeString(data.originLocation) || data.originLocation;
  if (data.farmerId !== undefined) updateData.farmerId = data.farmerId || null;
  if (data.washingStationId !== undefined) updateData.washingStationId = data.washingStationId || null;
  if (data.factoryId !== undefined) updateData.factoryId = data.factoryId || null;
  if (data.exporterId !== undefined) updateData.exporterId = data.exporterId || null;
  if (data.importerId !== undefined) updateData.importerId = data.importerId || null;
  if (data.retailerId !== undefined) updateData.retailerId = data.retailerId || null;
  if (data.cooperativeId !== undefined) updateData.cooperativeId = data.cooperativeId || null;
  if (data.region !== undefined) updateData.region = sanitizeString(data.region);
  if (data.district !== undefined) updateData.district = sanitizeString(data.district);
  if (data.sector !== undefined) updateData.sector = sanitizeString(data.sector);
  if (data.cell !== undefined) updateData.cell = sanitizeString(data.cell);
  if (data.village !== undefined) updateData.village = sanitizeString(data.village);
  if (data.coordinates !== undefined) updateData.coordinates = data.coordinates ? sanitizeString(data.coordinates) : null;
  if (data.lotId !== undefined) updateData.lotId = sanitizeString(data.lotId);
  if (data.quantity !== undefined) updateData.quantity = data.quantity;
  if (data.quality !== undefined) updateData.quality = sanitizeString(data.quality);
  if (data.moisture !== undefined) updateData.moisture = data.moisture;
  if (data.processingType !== undefined) updateData.processingType = sanitizeString(data.processingType);
  if (data.grade !== undefined) updateData.grade = sanitizeString(data.grade);
  if (data.teaType !== undefined) updateData.teaType = sanitizeString(data.teaType);
  if (data.status !== undefined) updateData.status = data.status;
  if (data.description !== undefined) updateData.description = sanitizeString(data.description);
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.metadata !== undefined) {
    updateData.metadata = data.metadata ? (data.metadata as Record<string, unknown>) : null;
  }

  // Convert date strings to Date objects if provided
  if (data.harvestDate !== undefined) {
    const parsedDate = parseDate(data.harvestDate);
    updateData.harvestDate = parsedDate;
  }
  if (data.pluckingDate !== undefined) {
    const parsedDate = parseDate(data.pluckingDate);
    updateData.pluckingDate = parsedDate;
  }

  if (data.pluckingDate !== undefined) {
    const parsedDate = parseDate(data.pluckingDate);
    updateData.pluckingDate = parsedDate;
  }

  // Lock-in Logic: If status is changing to 'approved', freeze data and create integrity record
  if (data.status === 'approved' && existingProduct.status !== 'approved') {
    // 1. Gather data to freeze (merge existing with updates)
    const frozenData = {
      batchId: id,
      farmerId: updateData.farmerId !== undefined ? updateData.farmerId : existingProduct.farmerId,
      cooperativeId: updateData.cooperativeId !== undefined ? updateData.cooperativeId : existingProduct.cooperativeId,
      quantity: updateData.quantity !== undefined ? updateData.quantity : existingProduct.quantity,
      grade: updateData.grade !== undefined ? updateData.grade : existingProduct.grade,
      quality: updateData.quality !== undefined ? updateData.quality : existingProduct.quality,
      approvedAt: new Date().toISOString(),
    };

    // 2. Calculate SHA256 hash
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(frozenData))
      .digest('hex');

    // 3. Create BatchIntegrity record (transactional with update would be better, but keeping simple for now)
    // We'll do it in a transaction if possible, or just create it here
    await prisma.batchIntegrity.create({
      data: {
        batchId: id,
        hash,
        frozenData: frozenData as any,
      },
    });

    console.log(`[BATCH LOCK-IN] Batch ${id} frozen with hash: ${hash}`);
  }

  const product = await prisma.productBatch.update({
    where: { id },
    data: updateData,
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
      cooperative: {
        select: {
          id: true,
          name: true,
          location: true,
        },
      },
    },
  });

  return product;
};

export const deleteProduct = async (id: string) => {
  if (!id) {
    throw new ValidationError('Product ID is required');
  }

  const product = await prisma.productBatch.findFirst({
    where: {
      id,
      ...buildSoftDeleteFilter(),
    },
  });

  if (!product) {
    throw new NotFoundError('Product batch not found');
  }

  // Soft delete
  await prisma.productBatch.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return { message: 'Product batch deleted successfully' };
};

/**
 * Approve batch
 * When QC approves a batch, it moves to the washing_station stage
 */
export const approveBatch = async (id: string) => {
  if (!id) {
    throw new ValidationError('Batch ID is required');
  }

  const batch = await prisma.productBatch.findFirst({
    where: {
      id,
      ...buildSoftDeleteFilter(),
    },
  });

  if (!batch) {
    throw new NotFoundError('Product batch not found');
  }

  if (batch.status === 'approved') {
    throw new ValidationError('Batch is already approved');
  }

  // When approved, batch moves to washing_station stage
  const updated = await prisma.productBatch.update({
    where: { id },
    data: {
      status: 'approved',
      currentStage: 'washing_station', // Advance to next stage on approval
    },
    include: {
      farmer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      cooperative: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  console.log(`[BATCH APPROVED] Batch ${id} approved and moved to washing_station stage`);

  return updated;
};

/**
 * Reject batch
 */
export const rejectBatch = async (id: string, reason?: string) => {
  if (!id) {
    throw new ValidationError('Batch ID is required');
  }

  const batch = await prisma.productBatch.findFirst({
    where: {
      id,
      ...buildSoftDeleteFilter(),
    },
  });

  if (!batch) {
    throw new NotFoundError('Product batch not found');
  }

  if (batch.status === 'rejected') {
    throw new ValidationError('Batch is already rejected');
  }

  const updateData: Record<string, unknown> = {
    status: 'rejected',
  };

  // Store rejection reason in metadata
  if (reason) {
    const currentMetadata = (batch.metadata as Record<string, unknown>) || {};
    updateData.metadata = {
      ...currentMetadata,
      rejectionReason: sanitizeString(reason),
      rejectedAt: new Date().toISOString(),
    };
  }

  const updated = await prisma.productBatch.update({
    where: { id },
    data: updateData,
    include: {
      farmer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      cooperative: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return updated;
};

/**
 * Verify batch by QR code
 */
export const verifyBatchByQRCode = async (qrCode: string) => {
  if (!qrCode) {
    throw new ValidationError('QR code is required');
  }

  const batch = await prisma.productBatch.findFirst({
    where: {
      qrCode,
      ...buildSoftDeleteFilter(),
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
      cooperative: {
        select: {
          id: true,
          name: true,
          location: true,
        },
      },
      certificates: {
        select: {
          id: true,
          certificateType: true,
          certificateNumber: true,
          issuedBy: true,
          issuedDate: true,
          expiryDate: true,
        },
        orderBy: {
          issuedDate: 'desc',
        },
      },
      integrity: true,
      events: {
        orderBy: {
          timestamp: 'desc',
        },
        include: {
          operator: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      },
      documents: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      history: {
        select: {
          id: true,
          stage: true,
          timestamp: true,
          notes: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 10,
      },
    },
  });

  if (!batch) {
    throw new NotFoundError('Batch not found or invalid QR code');
  }

  // Verification Logic
  const verificationResult = {
    isValid: true,
    issues: [] as string[],
    tampered: false
  };

  if (batch.integrity) {
    const frozen = batch.integrity.frozenData as any;

    // Check for data tampering (Current vs Frozen)
    if (frozen.farmerId !== batch.farmerId) verificationResult.issues.push('Farmer ID has been modified');
    if (frozen.quantity !== batch.quantity) verificationResult.issues.push('Quantity has been modified');
    if (frozen.grade !== batch.grade) verificationResult.issues.push('Grade has been modified');

    // Re-calculate hash to ensure integrity record itself is valid
    const recalculateHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(frozen))
      .digest('hex');

    if (recalculateHash !== batch.integrity.hash) {
      verificationResult.issues.push('Integrity record corrupted');
      verificationResult.tampered = true;
    }

    if (verificationResult.issues.length > 0) {
      verificationResult.isValid = false;
    }
  }

  return {
    verified: true, // Batch exists
    batch,
    verificationResult,
    verifiedAt: new Date().toISOString(),
  };
};

/**
 * Get batch by lot ID
 */
export const getProductByLotId = async (lotId: string) => {
  if (!lotId) {
    throw new ValidationError('Lot ID is required');
  }

  const product = await prisma.productBatch.findFirst({
    where: {
      lotId,
      ...buildSoftDeleteFilter(),
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
      cooperative: {
        select: {
          id: true,
          name: true,
          location: true,
        },
      },
      history: {
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
      },
    },
  });

  if (!product) {
    throw new NotFoundError('Product batch not found');
  }

  return product;
};

