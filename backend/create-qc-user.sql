-- Create Quality Controller User
-- Run this in Supabase SQL Editor

-- 1. Add 'qc' role to enum if not exists (PostgreSQL requires separate transaction for enum alteration)
-- ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'qc';

-- 2. Create QC User (password: quality123)
-- Hash for 'quality123': $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WX.qnL8.xgb9G8ynJm.Q6 (placeholder, will be reset by script)

INSERT INTO users (id, name, email, password, role, phone, city, province, country, "isActive", "createdAt", "updatedAt")
VALUES (
    'usr-qc-001',
    'Sarah Quality',
    'qc@cuptrace.rw',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WX.qnL8.xgb9G8ynJm.Q6', -- quality123 (placeholder)
    'qc',
    '+250788999999',
    'Kigali',
    'Kigali City',
    'Rwanda',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET 
    password = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WX.qnL8.xgb9G8ynJm.Q6',
    role = 'qc',
    "isActive" = true,
    "updatedAt" = NOW();

-- Verify
SELECT email, role FROM users WHERE role = 'qc';
