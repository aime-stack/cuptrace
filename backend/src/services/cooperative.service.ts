/**
 * Cooperative Service
 * Handles CRUD operations for cooperatives
 */

import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { sanitizeString } from '../utils/validation';
import { normalizePagination, createPaginationResult, PaginationResult } from '../utils/pagination';

export interface CreateCooperativeData {
  name: string;
  location: string;
  description?: string;
}

export interface UpdateCooperativeData {
  name?: string;
  location?: string;
  description?: string;
}

/**
 * Create a new cooperative
 */
export const createCooperative = async (data: CreateCooperativeData) => {
  const name = sanitizeString(data.name);
  if (!name) {
    throw new ValidationError('Cooperative name is required');
  }

  const location = sanitizeString(data.location);
  if (!location) {
    throw new ValidationError('Cooperative location is required');
  }

  // Check if cooperative with same name already exists
  const existing = await prisma.cooperative.findUnique({
    where: { name },
  });

  if (existing) {
    throw new ValidationError('Cooperative with this name already exists');
  }

  const cooperative = await prisma.cooperative.create({
    data: {
      name,
      location,
      description: sanitizeString(data.description),
    },
    include: {
      farmers: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      batches: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          type: true,
          status: true,
          currentStage: true,
        },
        take: 10,
      },
    },
  });

  return cooperative;
};

/**
 * Get cooperative by ID
 */
export const getCooperativeById = async (id: string) => {
  if (!id) {
    throw new ValidationError('Cooperative ID is required');
  }

  const cooperative = await prisma.cooperative.findUnique({
    where: { id },
    include: {
      farmers: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
      batches: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          type: true,
          status: true,
          currentStage: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      },
    },
  });

  if (!cooperative) {
    throw new NotFoundError('Cooperative not found');
  }

  return cooperative;
};

/**
 * List all cooperatives with pagination
 */
export const listCooperatives = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<PaginationResult<unknown>> => {
  const pagination = normalizePagination(page, limit, 1, 10, 100);
  const skip = (pagination.page - 1) * pagination.limit;

  const where: Record<string, unknown> = {};

  if (search) {
    const searchTerm = sanitizeString(search);
    where.OR = [
      { name: { contains: searchTerm || '', mode: 'insensitive' } },
      { location: { contains: searchTerm || '', mode: 'insensitive' } },
      { description: { contains: searchTerm || '', mode: 'insensitive' } },
    ];
  }

  const [cooperatives, total] = await Promise.all([
    prisma.cooperative.findMany({
      where,
      skip,
      take: pagination.limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            farmers: true,
            batches: true,
          },
        },
      },
    }),
    prisma.cooperative.count({ where }),
  ]);

  return createPaginationResult(cooperatives, total, pagination.page, pagination.limit);
};

/**
 * Update cooperative
 */
export const updateCooperative = async (id: string, data: UpdateCooperativeData) => {
  if (!id) {
    throw new ValidationError('Cooperative ID is required');
  }

  const existing = await prisma.cooperative.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Cooperative not found');
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) {
    const name = sanitizeString(data.name);
    if (!name) {
      throw new ValidationError('Cooperative name cannot be empty');
    }

    // Check if name is already taken by another cooperative
    const nameExists = await prisma.cooperative.findFirst({
      where: {
        name,
        id: { not: id },
      },
    });

    if (nameExists) {
      throw new ValidationError('Cooperative with this name already exists');
    }

    updateData.name = name;
  }

  if (data.location !== undefined) {
    const location = sanitizeString(data.location);
    if (!location) {
      throw new ValidationError('Cooperative location cannot be empty');
    }
    updateData.location = location;
  }

  if (data.description !== undefined) {
    updateData.description = sanitizeString(data.description);
  }

  const cooperative = await prisma.cooperative.update({
    where: { id },
    data: updateData,
    include: {
      farmers: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return cooperative;
};

/**
 * Delete cooperative (soft delete)
 */
export const deleteCooperative = async (id: string) => {
  if (!id) {
    throw new ValidationError('Cooperative ID is required');
  }

  const cooperative = await prisma.cooperative.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          farmers: true,
          batches: true,
        },
      },
    },
  });

  if (!cooperative) {
    throw new NotFoundError('Cooperative not found');
  }

  // Check if cooperative has associated active farmers or batches
  const activeFarmers = await prisma.user.count({
    where: {
      cooperativeId: id,
      isActive: true,
    },
  });

  const activeBatches = await prisma.productBatch.count({
    where: {
      cooperativeId: id,
      deletedAt: null,
    },
  });

  if (activeFarmers > 0) {
    throw new ValidationError('Cannot delete cooperative with active associated farmers');
  }

  if (activeBatches > 0) {
    throw new ValidationError('Cannot delete cooperative with active associated batches');
  }

  // Soft delete by updating name to make it unique (add deleted timestamp)
  // Since name is unique, we need to handle this carefully
  const deletedName = `${cooperative.name}_deleted_${Date.now()}`;
  
  await prisma.cooperative.update({
    where: { id },
    data: {
      name: deletedName,
      description: cooperative.description 
        ? `${cooperative.description} [DELETED]`
        : '[DELETED]',
    },
  });

  // Note: If Cooperative model had deletedAt field, we would use:
  // await prisma.cooperative.update({
  //   where: { id },
  //   data: { deletedAt: new Date() },
  // });

  return { message: 'Cooperative deleted successfully' };
};

