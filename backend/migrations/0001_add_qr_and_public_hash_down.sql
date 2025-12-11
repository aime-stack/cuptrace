-- Migration: Rollback QR Code URL and Public Hash columns
-- Date: 2025-12-11
-- Description: Reverts the changes made by 0001_add_qr_and_public_hash_up.sql

-- ============================================
-- DOWN MIGRATION (ROLLBACK)
-- ============================================

-- WARNING: This will delete all data in these columns!
-- Make sure to backup data if needed before running.

-- Drop indexes first
DROP INDEX IF EXISTS idx_users_phone_hash;
DROP INDEX IF EXISTS idx_product_batches_public_trace_hash;

-- Remove columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS public_hash;
ALTER TABLE users DROP COLUMN IF EXISTS phone_hash;

-- Remove columns from product_batches table
ALTER TABLE product_batches DROP COLUMN IF EXISTS qr_code_url;
ALTER TABLE product_batches DROP COLUMN IF EXISTS public_trace_hash;

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this query to verify columns were removed:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name IN ('users', 'product_batches') 
-- AND column_name IN ('public_hash', 'phone_hash', 'qr_code_url', 'public_trace_hash');
-- Should return 0 rows.
