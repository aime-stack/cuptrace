/**
 * Hashing Utilities for CupTrace
 * 
 * Provides HMAC-based hashing for privacy-preserving identity:
 * - Farmer public hash (F-XXXX format)
 * - Phone hash for USSD lookup
 * - Batch trace hash (B-XXXX format)
 */

import crypto from 'crypto';
// Environment variables are read directly from process.env

// Get salts from environment (fallback to defaults for testing only)
const FARMER_HASH_SALT = process.env.FARMER_HASH_SALT || 'default-farmer-salt-change-in-production';
const PHONE_HASH_SALT = process.env.PHONE_HASH_SALT || 'default-phone-salt-change-in-production';

/**
 * Generate HMAC-SHA256 hash
 */
function hmacSha256(data: string, salt: string): string {
    return crypto.createHmac('sha256', salt).update(data).digest('hex');
}

/**
 * Generate public hash for farmer identity
 * Returns F- prefixed 12-character hash
 * 
 * @param farmerId - The farmer's internal ID
 * @returns Public hash in format F-XXXXXXXXXXXX
 */
export function generateFarmerPublicHash(farmerId: string): string {
    const hash = hmacSha256(farmerId, FARMER_HASH_SALT);
    return `F-${hash.slice(0, 12)}`;
}

/**
 * Generate phone hash for USSD lookup
 * Returns full 64-character HMAC hash for secure phone lookup
 * 
 * @param phone - Phone number (will be normalized)
 * @returns 64-character hex hash
 */
export function generatePhoneHash(phone: string): string {
    // Normalize phone: remove spaces, dashes, and leading zeros
    const normalizedPhone = phone.replace(/[\s\-]/g, '').replace(/^0+/, '');
    return hmacSha256(normalizedPhone, PHONE_HASH_SALT);
}

/**
 * Generate public trace hash for batch
 * Returns B- prefixed 12-character hash
 * 
 * @param batchId - The batch's internal ID
 * @returns Public trace hash in format B-XXXXXXXXXXXX
 */
export function generateBatchTraceHash(batchId: string): string {
    const hash = hmacSha256(batchId, FARMER_HASH_SALT);
    return `B-${hash.slice(0, 12)}`;
}

/**
 * Mask phone number for logging
 * Shows only last 4 digits
 * 
 * @param phone - Full phone number
 * @returns Masked phone like ****1234
 */
export function maskPhone(phone: string): string {
    if (!phone || phone.length < 4) {
        return '****';
    }
    const last4 = phone.slice(-4);
    return `****${last4}`;
}

/**
 * Generate a secure random salt
 * Use this to generate FARMER_HASH_SALT and PHONE_HASH_SALT values
 * 
 * @param length - Length of the salt in bytes (default 32)
 * @returns Hex-encoded random salt
 */
export function generateSecureSalt(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Verify if a given hash matches a value
 * Useful for verifying phone numbers in USSD flow
 * 
 * @param value - Original value to check
 * @param hash - Hash to verify against
 * @param type - 'phone' | 'farmer' | 'batch'
 * @returns boolean indicating match
 */
export function verifyHash(value: string, hash: string, type: 'phone' | 'farmer' | 'batch'): boolean {
    let computedHash: string;

    switch (type) {
        case 'phone':
            computedHash = generatePhoneHash(value);
            break;
        case 'farmer':
            computedHash = generateFarmerPublicHash(value);
            break;
        case 'batch':
            computedHash = generateBatchTraceHash(value);
            break;
        default:
            return false;
    }

    // Use timing-safe comparison to prevent timing attacks
    try {
        return crypto.timingSafeEqual(
            Buffer.from(computedHash),
            Buffer.from(hash)
        );
    } catch {
        return false;
    }
}

/**
 * Format farmer display name for public consumption
 * 
 * @param publicHash - The farmer's public hash (F-XXXX format)
 * @returns Friendly display name
 */
export function formatFarmerDisplayName(publicHash: string): string {
    if (!publicHash) {
        return 'Unknown Farmer';
    }
    return `Farmer ${publicHash}`;
}

export default {
    generateFarmerPublicHash,
    generatePhoneHash,
    generateBatchTraceHash,
    maskPhone,
    generateSecureSalt,
    verifyHash,
    formatFarmerDisplayName,
};
