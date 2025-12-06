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
    role: z.enum(['farmer', 'agent', 'ws', 'factory', 'exporter', 'importer', 'retailer', 'admin', 'qc'], {
      errorMap: () => ({ message: 'Invalid role. Must be one of: farmer, agent, ws, factory, exporter, importer, retailer, admin, qc' })
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
      .optional()
      .refine((val) => !val || val.trim().length > 0, {
        message: 'Cooperative ID cannot be empty if provided',
      })
      .transform((val) => val && val.trim() !== '' ? val.trim() : undefined),
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

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim()
      .optional(),
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
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string()
      .min(1, 'Current password is required')
      .max(128, 'Password is too long'),
    newPassword: z.string()
      .min(8, 'New password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters'),
  }),
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    role: z.enum(['farmer', 'agent', 'ws', 'factory', 'exporter', 'importer', 'retailer', 'admin']).optional(),
    cooperativeId: z.string().optional(),
    isActive: z.string().transform((val) => val === 'true').optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const deactivateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

export const activateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

export const getCurrentUserSchema = z.object({
  // No params or body needed - uses token from middleware
});

