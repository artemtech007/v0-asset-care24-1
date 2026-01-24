-- =====================================================
-- AssetCare24 Database Migration: Add Thread ID Fields
-- Version: 2.5
-- Date: 15 January 2026
-- Description: Add thread_id field to clients and masters tables
-- for linking supergroup topics to specific users
-- =====================================================

BEGIN;

-- =====================================================
-- 1. Add thread_id field to clients table
-- =====================================================

-- Add thread_id field (text for Telegram thread/topic identifier)
ALTER TABLE clients
ADD COLUMN thread_id text;

-- Add comment for thread_id column
COMMENT ON COLUMN clients.thread_id IS 'Telegram supergroup thread/topic ID for this client';

-- =====================================================
-- 2. Add thread_id field to masters table
-- =====================================================

-- Add thread_id field (text for Telegram thread/topic identifier)
ALTER TABLE masters
ADD COLUMN thread_id text;

-- Add comment for thread_id column
COMMENT ON COLUMN masters.thread_id IS 'Telegram supergroup thread/topic ID for this master';

-- =====================================================
-- 3. Add indexes for thread_id fields (for performance)
-- =====================================================

-- Indexes for clients table
CREATE INDEX idx_clients_thread_id ON clients(thread_id);

-- Indexes for masters table
CREATE INDEX idx_masters_thread_id ON masters(thread_id);

-- =====================================================
-- 4. Validation queries (run after migration)
-- =====================================================

-- Check that columns were added successfully
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('clients', 'masters')
    AND column_name = 'thread_id'
ORDER BY table_name;

-- Check indexes were created
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('clients', 'masters')
    AND indexname LIKE '%thread_id%'
ORDER BY tablename, indexname;

COMMIT;

-- =====================================================
-- Post-migration verification (run these queries manually)
-- =====================================================

/*
-- Check data counts
SELECT
    'clients' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN thread_id IS NOT NULL THEN 1 END) as with_thread_id
FROM clients

UNION ALL

SELECT
    'masters' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN thread_id IS NOT NULL THEN 1 END) as with_thread_id
FROM masters;

-- Example usage: Find user by thread ID
SELECT 'client' as user_type, id, first_name, last_name, thread_id
FROM clients
WHERE thread_id = '123456789'
UNION ALL
SELECT 'master' as user_type, id, first_name, last_name, thread_id
FROM masters
WHERE thread_id = '123456789';

-- Update thread_id for a user
UPDATE clients
SET thread_id = '987654321'
WHERE id = 'cid_wa_491510416555';

UPDATE masters
SET thread_id = '987654321'
WHERE id = 'mid_wa_491510416556';
*/

-- =====================================================
-- END OF MIGRATION
-- =====================================================
