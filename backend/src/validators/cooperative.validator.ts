import { z } from 'zod';

export const createCooperativeSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim(),
    location: z.string()
      .min(2, 'Location must be at least 2 characters')
      .max(200, 'Location must not exceed 200 characters')
      .trim(),
    description: z.string()
      .max(1000, 'Description must not exceed 1000 characters')
      .optional()
      .or(z.literal('')),
  }),
});

export const updateCooperativeSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim()
      .optional(),
    location: z.string()
      .min(2, 'Location must be at least 2 characters')
      .max(200, 'Location must not exceed 200 characters')
      .trim()
      .optional(),
    description: z.string()
      .max(1000, 'Description must not exceed 1000 characters')
      .optional()
      .or(z.literal('')),
  }),
  params: z.object({
    id: z.string().min(1, 'Cooperative ID is required'),
  }),
});

export const getCooperativeSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Cooperative ID is required'),
  }),
});

export const deleteCooperativeSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Cooperative ID is required'),
  }),
});

export const listCooperativesSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
  }),
});

