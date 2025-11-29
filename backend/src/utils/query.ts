/**
 * Query building utilities for Prisma queries
 */

import { Prisma } from '@prisma/client';

/**
 * Build where clause with soft delete filter
 */
export const buildSoftDeleteFilter = (includeDeleted: boolean = false): { deletedAt: null } | Record<string, never> => {
  return includeDeleted ? ({} as Record<string, never>) : { deletedAt: null };
};

/**
 * Build date range filter
 */
export const buildDateRangeFilter = (
  startDate?: Date | string | null,
  endDate?: Date | string | null,
  field: string = 'createdAt'
): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};
  
  if (startDate || endDate) {
    const dateFilter: Record<string, unknown> = {};
    
    if (startDate) {
      dateFilter.gte = startDate instanceof Date ? startDate : new Date(startDate);
    }
    
    if (endDate) {
      dateFilter.lte = endDate instanceof Date ? endDate : new Date(endDate);
    }
    
    filter[field] = dateFilter;
  }
  
  return filter;
};

/**
 * Build search filter for text fields
 */
export const buildSearchFilter = (
  searchTerm?: string | null,
  fields: string[] = ['name', 'description']
): Record<string, unknown> | {} => {
  if (!searchTerm || !fields.length) return {};
  
  return {
    OR: fields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as Prisma.QueryMode,
      },
    })),
  };
};

/**
 * Build include relations object
 */
export const buildIncludeRelations = (relations: string[]): Record<string, boolean> => {
  const include: Record<string, boolean> = {};
  relations.forEach(relation => {
    include[relation] = true;
  });
  return include;
};

/**
 * Build select fields object
 */
export const buildSelectFields = (fields: string[]): Record<string, boolean> => {
  const select: Record<string, boolean> = {};
  fields.forEach(field => {
    select[field] = true;
  });
  return select;
};

