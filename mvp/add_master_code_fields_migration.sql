-- =====================================================
-- AssetCare24 Database Migration: Add Master Code Fields
-- Version: 2.4
-- Date: 15 January 2026
-- Description: Add code_source, code_master_type, code_value fields to masters table
-- for storing UTM-like parameters from registration codes
-- =====================================================

BEGIN;

-- =====================================================
-- 1. Add code fields to masters table
-- =====================================================

-- Add code_source field (text for source identifier)
ALTER TABLE masters
ADD COLUMN code_source text;

-- Add code_master_type field (text for master type/category)
ALTER TABLE masters
ADD COLUMN code_master_type text;

-- Add code_value field (text for the actual code value)
ALTER TABLE masters
ADD COLUMN code_value text;

-- =====================================================
-- 2. Add comments for new columns
-- =====================================================

COMMENT ON COLUMN masters.code_source IS 'Source identifier from registration code (UTM-like parameter)';
COMMENT ON COLUMN masters.code_master_type IS 'Master type/category from registration code';
COMMENT ON COLUMN masters.code_value IS 'The actual registration code value used';

-- =====================================================
-- 3. Add indexes for code fields (for performance)
-- =====================================================

-- Indexes for masters table code fields
CREATE INDEX idx_masters_code_source ON masters(code_source);
CREATE INDEX idx_masters_code_master_type ON masters(code_master_type);
CREATE INDEX idx_masters_code_value ON masters(code_value);

-- =====================================================
-- 4. Validation queries (run after migration)
-- =====================================================

-- Check that columns were added successfully
SELECT
    'masters' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'masters'
    AND column_name IN ('code_source', 'code_master_type', 'code_value')
ORDER BY ordinal_position;

-- Check indexes were created
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'masters'
    AND indexname LIKE '%code%'
ORDER BY tablename, indexname;

COMMIT;

-- =====================================================
-- Post-migration verification (run these queries manually)
-- =====================================================

/*
-- Check data counts
SELECT
    'masters' as table_name,
    COUNT(*) as total_masters,
    COUNT(CASE WHEN code_source IS NOT NULL THEN 1 END) as masters_with_code_source,
    COUNT(CASE WHEN code_master_type IS NOT NULL THEN 1 END) as masters_with_code_type,
    COUNT(CASE WHEN code_value IS NOT NULL THEN 1 END) as masters_with_code_value
FROM masters;

-- Example usage: Find masters by source
SELECT id, first_name, last_name, code_source, code_master_type, code_value
FROM masters
WHERE code_source = 'partner_website'
LIMIT 10;
*/

-- =====================================================
-- END OF MIGRATION
-- =====================================================
