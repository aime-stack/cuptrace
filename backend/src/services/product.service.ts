import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { ProductType, SupplyChainStage } from '@prisma/client';

export interface CreateProductData {
  type: ProductType;
  originLocation: string;
  farmerId?: string;
}

export interface UpdateProductData {
  originLocation?: string;
  farmerId?: string;
  washingStationId?: string;
  factoryId?: string;
  exporterId?: string;
  importerId?: string;
  retailerId?: string;
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
      currentStage: 'farmer',
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

  const where: any = {
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

  const product = await prisma.productBatch.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
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

