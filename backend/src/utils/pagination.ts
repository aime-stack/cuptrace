/**
 * Pagination utility functions
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Calculate pagination skip value
 */
export const calculateSkip = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

/**
 * Validate and normalize pagination parameters
 */
export const normalizePagination = (
  page?: string | number,
  limit?: string | number,
  defaultPage: number = 1,
  defaultLimit: number = 10,
  maxLimit: number = 100
): PaginationParams => {
  const normalizedPage = Math.max(1, parseInt(String(page || defaultPage), 10) || defaultPage);
  let normalizedLimit = parseInt(String(limit || defaultLimit), 10) || defaultLimit;
  
  // Enforce maximum limit
  if (normalizedLimit > maxLimit) {
    normalizedLimit = maxLimit;
  }
  
  // Ensure limit is positive
  if (normalizedLimit < 1) {
    normalizedLimit = defaultLimit;
  }
  
  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
};

/**
 * Create pagination result
 */
export const createPaginationResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

