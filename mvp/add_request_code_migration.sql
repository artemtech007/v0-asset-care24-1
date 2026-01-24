-- =====================================================
-- AssetCare24 Database Migration: Add Request Code Field
-- Version: 2.10
-- Date: 27 January 2026
-- Description: Add request_code field to requests table for unique request identification
-- =====================================================

BEGIN;

-- =====================================================
-- 1. Add request_code field to requests table
-- =====================================================

-- Add request_code field (text for unique request identifier/code)
ALTER TABLE requests
ADD COLUMN request_code text;

-- Add comment for request_code column
COMMENT ON COLUMN requests.request_code IS 'Unique code for request identification (for QR codes, short links, etc.)';

-- =====================================================
-- 2. Add index for request_code field (for performance)
-- =====================================================

-- Index for requests table request_code field
CREATE UNIQUE INDEX idx_requests_request_code ON requests(request_code);

-- =====================================================
-- 3. Validation queries (run after migration)
-- =====================================================

-- Check that column was added successfully
SELECT
    'requests' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'requests'
    AND column_name = 'request_code'
ORDER BY ordinal_position;

-- Check index was created
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'requests'
    AND indexname LIKE '%request_code%'
ORDER BY tablename, indexname;

COMMIT;

-- =====================================================
-- Post-migration verification (run these queries manually)
-- =====================================================

/*
-- Check data counts
SELECT
    'requests' as table_name,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN request_code IS NOT NULL THEN 1 END) as with_request_code
FROM requests;

-- Example usage: Generate and assign request codes
-- (This should be done by application logic, not manually)

-- Find request by code
SELECT id, client_id, status, category, request_code
FROM requests
WHERE request_code = 'ABC123456'
LIMIT 5;

-- Update request code for existing request
UPDATE requests
SET request_code = 'REQ-001-2026'
WHERE id = 1;
*/

-- =====================================================
-- END OF MIGRATION
-- =====================================================
