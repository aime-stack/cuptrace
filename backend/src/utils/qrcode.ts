/**
 * QR Code utility functions
 */

import env from '../config/env';

/**
 * Generate unique QR code string for a batch
 */
export const generateQRCode = (batchId: string, type: 'coffee' | 'tea'): string => {
  const prefix = type === 'coffee' ? 'CF' : 'TE';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${batchId.substring(0, 8).toUpperCase()}-${timestamp}-${random}`;
};

/**
 * Generate verification URL for a batch
 */
export const generateVerificationUrl = (batchId: string, baseUrl?: string): string => {
  const base = baseUrl || env.APP_URL;
  return `${base}/verify/${batchId}`;
};

/**
 * Validate QR code format
 */
export const isValidQRCode = (qrCode: string): boolean => {
  const qrRegex = /^(CF|TE)-[A-Z0-9]{8}-[A-Z0-9]+-[A-Z0-9]+$/;
  return qrRegex.test(qrCode);
};

/**
 * Extract batch ID from QR code
 */
export const extractBatchIdFromQR = (qrCode: string): string | null => {
  if (!isValidQRCode(qrCode)) return null;
  
  const parts = qrCode.split('-');
  if (parts.length < 2) return null;
  
  // The batch ID is typically embedded in the QR code
  // This is a simplified extraction - adjust based on your QR code structure
  return parts[1] || null;
};

