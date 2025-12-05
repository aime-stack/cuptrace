import { z } from 'zod';

export const createCertificateSchema = z.object({
  body: z.object({
    batchId: z.string().min(1, 'Batch ID is required'),
    certificateType: z.enum([
      'organic',
      'fair_trade',
      'quality_grade',
      'export_permit',
      'health_certificate',
      'origin_certificate',
      'other',
    ]),
    certificateNumber: z.string()
      .min(1, 'Certificate number is required')
      .max(100, 'Certificate number must not exceed 100 characters')
      .trim(),
    issuedBy: z.string()
      .min(2, 'Issued by must be at least 2 characters')
      .max(200, 'Issued by must not exceed 200 characters')
      .trim(),
    issuedDate: z.string().datetime('Invalid issued date format').or(z.date()),
    expiryDate: z.string().datetime('Invalid expiry date format').optional().or(z.date()),
    documentUrl: z.string()
      .url('Invalid document URL')
      .max(500, 'Document URL must not exceed 500 characters')
      .optional()
      .or(z.literal('')),
    blockchainTxHash: z.string().optional(),
  }),
});

export const updateCertificateSchema = z.object({
  body: z.object({
    certificateType: z.enum([
      'organic',
      'fair_trade',
      'quality_grade',
      'export_permit',
      'health_certificate',
      'origin_certificate',
      'other',
    ]).optional(),
    certificateNumber: z.string()
      .min(1, 'Certificate number is required')
      .max(100, 'Certificate number must not exceed 100 characters')
      .trim()
      .optional(),
    issuedBy: z.string()
      .min(2, 'Issued by must be at least 2 characters')
      .max(200, 'Issued by must not exceed 200 characters')
      .trim()
      .optional(),
    issuedDate: z.string().datetime('Invalid issued date format').optional().or(z.date()),
    expiryDate: z.string().datetime('Invalid expiry date format').optional().or(z.date()),
    documentUrl: z.string()
      .url('Invalid document URL')
      .max(500, 'Document URL must not exceed 500 characters')
      .optional()
      .or(z.literal('')),
    blockchainTxHash: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Certificate ID is required'),
  }),
});

export const getCertificateSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Certificate ID is required'),
  }),
});

export const getCertificateByNumberSchema = z.object({
  params: z.object({
    certificateNumber: z.string().min(1, 'Certificate number is required'),
  }),
});

export const deleteCertificateSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Certificate ID is required'),
  }),
});

export const listCertificatesSchema = z.object({
  query: z.object({
    batchId: z.string().optional(),
    certificateType: z.enum([
      'organic',
      'fair_trade',
      'quality_grade',
      'export_permit',
      'health_certificate',
      'origin_certificate',
      'other',
    ]).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const listCertificatesByBatchSchema = z.object({
  params: z.object({
    batchId: z.string().min(1, 'Batch ID is required'),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

