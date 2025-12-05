/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Parse a date string to Date object, handling various formats
 */
export const parseDate = (dateString: string | Date | null | undefined): Date | null => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  
  try {
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

/**
 * Format date to ISO string, returning null if invalid
 */
export const formatDateISO = (date: Date | string | null | undefined): string | null => {
  const parsed = parseDate(date);
  return parsed ? parsed.toISOString() : null;
};

/**
 * Format date to readable string
 */
export const formatDateReadable = (date: Date | string | null | undefined): string | null => {
  const parsed = parseDate(date);
  if (!parsed) return null;
  
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Check if date is in the past
 */
export const isPastDate = (date: Date | string | null | undefined): boolean => {
  const parsed = parseDate(date);
  if (!parsed) return false;
  return parsed < new Date();
};

/**
 * Check if date is in the future
 */
export const isFutureDate = (date: Date | string | null | undefined): boolean => {
  const parsed = parseDate(date);
  if (!parsed) return false;
  return parsed > new Date();
};

/**
 * Get date difference in days
 */
export const getDaysDifference = (
  date1: Date | string | null | undefined,
  date2: Date | string | null | undefined
): number | null => {
  const parsed1 = parseDate(date1);
  const parsed2 = parseDate(date2);
  
  if (!parsed1 || !parsed2) return null;
  
  const diffTime = Math.abs(parsed2.getTime() - parsed1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

