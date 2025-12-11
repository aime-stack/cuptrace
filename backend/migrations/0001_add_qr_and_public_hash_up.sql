-- Migration: Add QR Code URL and Public Hash columns
-- Date: 2025-12-11
-- Description: Adds columns for QR code storage URLs, public trace hashes, and phone hashes for privacy

-- ============================================
-- UP MIGRATION
-- ============================================

-- Add public_hash column to users table (for public farmer identity)
ALTER TABLE users ADD COLUMN IF NOT EXISTS public_hash VARCHAR(64) UNIQUE;

-- Add phone_hash column to users table (for USSD lookup)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_hash VARCHAR(128);

-- Create index on phone_hash for efficient USSD lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_hash ON users(phone_hash);

-- Add qr_code_url column to product_batches table (Supabase storage URL)
ALTER TABLE product_batches ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- Add public_trace_hash column to product_batches table (for public trace URLs)
ALTER TABLE product_batches ADD COLUMN IF NOT EXISTS public_trace_hash VARCHAR(64) UNIQUE;

-- Create index on public_trace_hash for efficient trace lookups
CREATE INDEX IF NOT EXISTS idx_product_batches_public_trace_hash ON product_batches(public_trace_hash);

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this query to verify columns were added:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name IN ('users', 'product_batches') 
-- AND column_name IN ('public_hash', 'phone_hash', 'qr_code_url', 'public_trace_hash');
