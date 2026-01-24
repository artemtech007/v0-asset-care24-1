-- =====================================================
-- AssetCare24 Database Migration: Remove NOT NULL Constraints from Clients
-- Version: 2.3.1
-- Date: 15 January 2026
-- Description: Remove NOT NULL constraints from first_name and last_name in clients table
-- to allow creating client records without knowing customer name initially
-- =====================================================

BEGIN;

-- =====================================================
-- 1. Remove NOT NULL constraints from clients table
-- =====================================================

-- Remove NOT NULL from first_name
ALTER TABLE clients
ALTER COLUMN first_name DROP NOT NULL;

-- Remove NOT NULL from last_name
ALTER TABLE clients
ALTER COLUMN last_name DROP NOT NULL;

-- =====================================================
-- 2. Update comments to reflect the change
-- =====================================================

COMMENT ON COLUMN clients.first_name IS 'First name of the client (optional - can be filled later)';
COMMENT ON COLUMN clients.last_name IS 'Last name of the client (optional - can be filled later)';

-- =====================================================
-- 3. Validation queries (run after migration)
-- =====================================================

-- Check that constraints were removed
SELECT
    table_name,
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_name = 'clients'
    AND column_name IN ('first_name', 'last_name')
ORDER BY column_name;

-- Check current data (should show NULL values are allowed)
SELECT
    COUNT(*) as total_clients,
    COUNT(first_name) as clients_with_first_name,
    COUNT(last_name) as clients_with_last_name,
    COUNT(*) - COUNT(first_name) as clients_missing_first_name,
    COUNT(*) - COUNT(last_name) as clients_missing_last_name
FROM clients;

COMMIT;

-- =====================================================
-- Post-migration verification (run these queries manually)
-- =====================================================

/*
-- Test creating a client without name (should work now)
INSERT INTO clients (id, whatsapp_id, phone, status, source)
VALUES ('cid_wa_test123', 'wa_test_123', '+49123456789', 'active', 'test')
RETURNING id, first_name, last_name, phone;

-- Clean up test data
DELETE FROM clients WHERE id = 'cid_wa_test123';
*/

-- =====================================================
-- END OF MIGRATION
-- =====================================================
