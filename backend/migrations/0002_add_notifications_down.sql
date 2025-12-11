-- CupTrace Notifications Rollback
-- Run this in Supabase SQL Editor to undo migration
-- ============================================

-- Drop indexes
DROP INDEX IF EXISTS idx_notifications_user_read;
DROP INDEX IF EXISTS idx_notifications_created;

-- Drop table
DROP TABLE IF EXISTS notifications;
