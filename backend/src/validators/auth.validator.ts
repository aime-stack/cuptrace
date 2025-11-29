import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim(),
    email: z.string()
      .email('Invalid email address')
      .toLowerCase()
      .trim(),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters'),
    role: z.enum(['farmer', 'ws', 'factory', 'exporter', 'importer', 'retailer', 'admin'], {
      errorMap: () => ({ message: 'Invalid role. Must be one of: farmer, ws, factory, exporter, importer, retailer, admin' })
    }),
    // New user profile fields
    phone: z.string()
      .max(20, 'Phone number must not exceed 20 characters')
      .optional()
      .or(z.literal('')),
    address: z.string()
      .max(200, 'Address must not exceed 200 characters')
      .optional()
      .or(z.literal('')),
    city: z.string()
      .max(100, 'City must not exceed 100 characters')
      .optional()
      .or(z.literal('')),
    province: z.string()
      .max(100, 'Province must not exceed 100 characters')
      .optional()
      .or(z.literal('')),
    country: z.string()
      .max(100, 'Country must not exceed 100 characters')
      .optional()
      .or(z.literal('')),
    cooperativeId: z.string()
      .min(1, 'Cooperative ID cannot be empty if provided')
      .optional()
      .or(z.literal('')),
    registrationNumber: z.string()
      .max(50, 'Registration number must not exceed 50 characters')
      .optional()
      .or(z.literal('')),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email address')
      .toLowerCase()
      .trim(),
    password: z.string()
      .min(1, 'Password is required')
      .max(128, 'Password is too long'),
  }),
});

