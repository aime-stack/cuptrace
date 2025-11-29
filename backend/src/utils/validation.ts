/**
 * Validation utility functions for common validation patterns
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Normalize email (lowercase, trim)
 */
export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

/**
 * Validate phone number (basic validation)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate GPS coordinates format (lat,lng)
 */
export const isValidCoordinates = (coordinates: string): boolean => {
  const coordRegex = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
  if (!coordRegex.test(coordinates)) return false;
  
  const [lat, lng] = coordinates.split(',').map(Number);
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Parse coordinates string to object
 */
export const parseCoordinates = (coordinates: string | null | undefined): { lat: number; lng: number } | null => {
  if (!coordinates) return null;
  
  const parts = coordinates.split(',');
  if (parts.length !== 2) return null;
  
  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());
  
  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  
  return { lat, lng };
};

/**
 * Validate UUID/CUID format
 */
export const isValidId = (id: string): boolean => {
  return id.length > 0 && id.length <= 50;
};

/**
 * Sanitize string input (trim, remove extra spaces)
 */
export const sanitizeString = (input: string | null | undefined): string | null => {
  if (!input) return null;
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Validate positive number
 */
export const isValidPositiveNumber = (value: number | null | undefined): boolean => {
  if (value === null || value === undefined) return false;
  return !isNaN(value) && value > 0;
};

/**
 * Validate non-negative number
 */
export const isValidNonNegativeNumber = (value: number | null | undefined): boolean => {
  if (value === null || value === undefined) return false;
  return !isNaN(value) && value >= 0;
};

