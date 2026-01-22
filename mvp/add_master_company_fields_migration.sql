-- =====================================================
-- AssetCare24 Database Migration: Add Master Company Fields
-- Version: 2.6
-- Date: 15 January 2026
-- Description: Add company_name and master_type fields to masters table
-- =====================================================

BEGIN;

-- =====================================================
-- 1. Add company fields to masters table
-- =====================================================

-- Add company_name field (text for company name)
ALTER TABLE masters
ADD COLUMN company_name text;

-- Add master_type field (text for master type/category)
ALTER TABLE masters
ADD COLUMN master_type text;

-- =====================================================
-- 2. Add comments for new columns
-- =====================================================

COMMENT ON COLUMN masters.company_name IS 'Name of the company the master works for';
COMMENT ON COLUMN masters.master_type IS 'Type/category of master (individual, company, freelancer, etc.)';

-- =====================================================
-- 3. Add indexes for company fields (for performance)
-- =====================================================

-- Indexes for masters table company fields
CREATE INDEX idx_masters_company_name ON masters(company_name);
CREATE INDEX idx_masters_master_type ON masters(master_type);

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
    AND column_name IN ('company_name', 'master_type')
ORDER BY ordinal_position;

-- Check indexes were created
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'masters'
    AND indexname LIKE '%company%' OR indexname LIKE '%master_type%'
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
    COUNT(CASE WHEN company_name IS NOT NULL THEN 1 END) as with_company_name,
    COUNT(CASE WHEN master_type IS NOT NULL THEN 1 END) as with_master_type
FROM masters;

-- Example usage: Find masters by company
SELECT id, first_name, last_name, company_name, master_type
FROM masters
WHERE company_name IS NOT NULL
LIMIT 10;

-- Update company info for a master
UPDATE masters
SET company_name = 'ABC Services GmbH',
    master_type = 'company'
WHERE id = 'mid_wa_491510416556';
*/

-- =====================================================
-- END OF MIGRATION
-- =====================================================
