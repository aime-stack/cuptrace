import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
// These types will be available after Prisma client generation
// import { ProductType, SupplyChainStage, BatchStatus } from '@prisma/client';
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
}

export const createProduct = async (data: CreateProductData) => {
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

  const product = await prisma.productBatch.create({
    data: {
      type: data.type,
      originLocation: data.originLocation,
      farmerId: data.farmerId,
      cooperativeId: data.cooperativeId,
      currentStage: 'farmer',
      // Location fields
      region: data.region ?? null,
      district: data.district ?? null,
      sector: data.sector ?? null,
      cell: data.cell ?? null,
      village: data.village ?? null,
      coordinates: data.coordinates ?? null,
      // Product attributes
      lotId: data.lotId ?? null,
      quantity: data.quantity ?? null,
      quality: data.quality ?? null,
      moisture: data.moisture ?? null,
      harvestDate: data.harvestDate ? new Date(data.harvestDate) : null,
      pluckingDate: data.pluckingDate ? new Date(data.pluckingDate) : null,
      // Coffee-specific
      processingType: data.processingType ?? null,
      grade: data.grade ?? null,
      // Tea-specific
      teaType: data.teaType ?? null,
      // Metadata
      description: data.description ?? null,
      tags: data.tags ?? [],
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

  return product;
};

export const getProductById = async (id: string, type?: ProductType) => {
  const product = await prisma.productBatch.findFirst({
    where: {
      id,
      deletedAt: null,
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
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  const where: {
    deletedAt: null;
    type?: ProductType;
    currentStage?: SupplyChainStage;
  } = {
    deletedAt: null,
  };

  if (type) {
    where.type = type;
  }

  if (stage) {
    where.currentStage = stage;
  }

  const [products, total] = await Promise.all([
    prisma.productBatch.findMany({
      where,
      skip,
      take: limit,
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

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
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

  // Prepare update data, handling date strings and removing undefined values
  const updateData: {
    updatedAt: Date;
    [key: string]: unknown;
  } = {
    updatedAt: new Date(),
  };

  // Only include fields that are provided
  if (data.originLocation !== undefined) updateData.originLocation = data.originLocation;
  if (data.farmerId !== undefined) updateData.farmerId = data.farmerId;
  if (data.washingStationId !== undefined) updateData.washingStationId = data.washingStationId;
  if (data.factoryId !== undefined) updateData.factoryId = data.factoryId;
  if (data.exporterId !== undefined) updateData.exporterId = data.exporterId;
  if (data.importerId !== undefined) updateData.importerId = data.importerId;
  if (data.retailerId !== undefined) updateData.retailerId = data.retailerId;
  if (data.cooperativeId !== undefined) updateData.cooperativeId = data.cooperativeId;
  if (data.region !== undefined) updateData.region = data.region;
  if (data.district !== undefined) updateData.district = data.district;
  if (data.sector !== undefined) updateData.sector = data.sector;
  if (data.cell !== undefined) updateData.cell = data.cell;
  if (data.village !== undefined) updateData.village = data.village;
  if (data.coordinates !== undefined) updateData.coordinates = data.coordinates;
  if (data.lotId !== undefined) updateData.lotId = data.lotId;
  if (data.quantity !== undefined) updateData.quantity = data.quantity;
  if (data.quality !== undefined) updateData.quality = data.quality;
  if (data.moisture !== undefined) updateData.moisture = data.moisture;
  if (data.processingType !== undefined) updateData.processingType = data.processingType;
  if (data.grade !== undefined) updateData.grade = data.grade;
  if (data.teaType !== undefined) updateData.teaType = data.teaType;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.tags !== undefined) updateData.tags = data.tags;

  // Convert date strings to Date objects if provided
  if (data.harvestDate) {
    updateData.harvestDate = new Date(data.harvestDate);
  }
  if (data.pluckingDate) {
    updateData.pluckingDate = new Date(data.pluckingDate);
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
  const product = await prisma.productBatch.findFirst({
    where: {
      id,
      deletedAt: null,
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

