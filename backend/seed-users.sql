-- CupTrace Test Users SQL Script
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add 'agent' role to the UserRole enum if it doesn't exist
DO $$
BEGIN
    -- Check if 'agent' already exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'agent' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
    ) THEN
        ALTER TYPE "UserRole" ADD VALUE 'agent';
    END IF;
END $$;

-- Step 2: Create/Update users with password "test123"
-- The hash below is for password: test123

-- FARMER
INSERT INTO users (id, name, email, password, role, phone, city, province, country, "isActive", "createdAt", "updatedAt")
VALUES (
    'usr-farmer-001',
    'Jean Farmer',
    'jean.farmer@cuptrace.rw',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WX.qnL8.xgb9G8ynJm.Q6',
    'farmer',
    '+250788111111',
    'Huye',
    'Southern Province',
    'Rwanda',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET 
    password = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WX.qnL8.xgb9G8ynJm.Q6',
    "isActive" = true,
    "updatedAt" = NOW();

-- WASHING STATION
INSERT INTO users (id, name, email, password, role, phone, city, province, country, "isActive", "createdAt", "updatedAt")
VALUES (
    'usr-ws-001',
    'Huye Washing Station',
    'huye.station@cuptrace.rw',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WX.qnL8.xgb9G8ynJm.Q6',
    'ws',
    '+250788333333',
    'Huye',
    'Southern Province',
    'Rwanda',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET 
    password = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WX.qnL8.xgb9G8ynJm.Q6',
    role = 'ws',
    "isActive" = true,
    "updatedAt" = NOW();

-- EXPORTER
INSERT INTO users (id, name, email, password, role, phone, city, province, country, "isActive", "createdAt", "updatedAt")
VALUES (
    'usr-export-001',
    'Rwanda Coffee Exports',
    'exports@cuptrace.rw',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WX.qnL8.xgb9G8ynJm.Q6',
    'exporter',
    '+250788444444',
    'Kigali',
    'Kigali City',
    'Rwanda',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET 
    password = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WX.qnL8.xgb9G8ynJm.Q6',
    role = 'exporter',
    "isActive" = true,
    "updatedAt" = NOW();

-- ADMIN
INSERT INTO users (id, name, email, password, role, phone, city, province, country, "isActive", "createdAt", "updatedAt")
VALUES (
    'usr-admin-001',
    'System Admin',
    'admin@cuptrace.rw',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WX.qnL8.xgb9G8ynJm.Q6',
    'admin',
    '+250788000000',
    'Kigali',
    'Kigali City',
    'Rwanda',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET 
    password = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WX.qnL8.xgb9G8ynJm.Q6',
    role = 'admin',
    "isActive" = true,
    "updatedAt" = NOW();

-- Verify users
SELECT email, role, "isActive" FROM users ORDER BY role;

-- ============================================
-- ALL TEST CREDENTIALS USE PASSWORD: test123
-- ============================================
-- Farmer:   jean.farmer@cuptrace.rw / test123
-- WS:       huye.station@cuptrace.rw / test123
-- Exporter: exports@cuptrace.rw / test123
-- Admin:    admin@cuptrace.rw / test123
-- ============================================

-- ============================================
-- STEP 3: RUN THIS SEPARATELY AFTER THE ABOVE!
-- (PostgreSQL requires adding enum values in a separate transaction)
-- ============================================
-- ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'agent';
-- 
-- Then run:
-- INSERT INTO users (id, name, email, password, role, phone, city, province, country, "isActive", "createdAt", "updatedAt")
-- VALUES (
--     'usr-agent-001',
--     'Claude Agent',
--     'agent.huye@cuptrace.rw',
--     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WX.qnL8.xgb9G8ynJm.Q6',
--     'agent',
--     '+250788222222',
--     'Huye',
--     'Southern Province',
--     'Rwanda',
--     true,
--     NOW(),
--     NOW()
-- )
-- ON CONFLICT (email) DO UPDATE SET 
--     password = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WX.qnL8.xgb9G8ynJm.Q6',
--     role = 'agent',
--     "isActive" = true,
--     "updatedAt" = NOW();
