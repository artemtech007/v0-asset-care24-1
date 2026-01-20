-- =====================================================
-- AssetCare24 Database Migration: Add Verification Columns
-- Version: 2.3
-- Date: 15 January 2026
-- Description: Add verification fields for WhatsApp, email, phone and COD value
-- =====================================================

BEGIN;

-- =====================================================
-- 1. Add verification columns to masters table
-- =====================================================

-- Add wa_norm column (text 32 chars for normalized WhatsApp number)
ALTER TABLE masters
ADD COLUMN wa_norm varchar(32);

-- Add wa_verified column (boolean)
ALTER TABLE masters
ADD COLUMN wa_verified boolean DEFAULT false;

-- Add email_verified column (boolean)
ALTER TABLE masters
ADD COLUMN email_verified boolean DEFAULT false;

-- Add phone_verified column (boolean)
ALTER TABLE masters
ADD COLUMN phone_verified boolean DEFAULT false;

-- Add comment for wa_norm column
COMMENT ON COLUMN masters.wa_norm IS 'Normalized WhatsApp number (32 chars max)';
COMMENT ON COLUMN masters.wa_verified IS 'Whether WhatsApp number is verified';
COMMENT ON COLUMN masters.email_verified IS 'Whether email address is verified';
COMMENT ON COLUMN masters.phone_verified IS 'Whether phone number is verified';

-- =====================================================
-- 2. Add verification columns to clients table
-- =====================================================

-- Add wa_verified column (boolean)
ALTER TABLE clients
ADD COLUMN wa_verified boolean DEFAULT false;

-- Add email_verified column (boolean)
ALTER TABLE clients
ADD COLUMN email_verified boolean DEFAULT false;

-- Add phone_verified column (boolean)
ALTER TABLE clients
ADD COLUMN phone_verified boolean DEFAULT false;

-- Add cod_value column (text 20 chars for COD value)
ALTER TABLE clients
ADD COLUMN cod_value varchar(20);

-- Add comments for new columns
COMMENT ON COLUMN clients.wa_verified IS 'Whether WhatsApp number is verified';
COMMENT ON COLUMN clients.email_verified IS 'Whether email address is verified';
COMMENT ON COLUMN clients.phone_verified IS 'Whether phone number is verified';
COMMENT ON COLUMN clients.cod_value IS 'COD (Cash on Delivery) value identifier (20 chars max)';

-- =====================================================
-- 3. Add indexes for verification fields (for performance)
-- =====================================================

-- Indexes for masters table
CREATE INDEX idx_masters_wa_norm ON masters(wa_norm);
CREATE INDEX idx_masters_wa_verified ON masters(wa_verified);
CREATE INDEX idx_masters_email_verified ON masters(email_verified);
CREATE INDEX idx_masters_phone_verified ON masters(phone_verified);

-- Indexes for clients table
CREATE INDEX idx_clients_wa_verified ON clients(wa_verified);
CREATE INDEX idx_clients_email_verified ON clients(email_verified);
CREATE INDEX idx_clients_phone_verified ON clients(phone_verified);
CREATE INDEX idx_clients_cod_value ON clients(cod_value);

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
    AND column_name IN ('wa_norm', 'wa_verified', 'email_verified', 'phone_verified')
ORDER BY ordinal_position;

SELECT
    'clients' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'clients'
    AND column_name IN ('wa_verified', 'email_verified', 'phone_verified', 'cod_value')
ORDER BY ordinal_position;

-- Check indexes were created
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('masters', 'clients')
    AND indexname LIKE '%verified%'
ORDER BY tablename, indexname;

-- =====================================================
-- 5. Sample data population (optional)
-- =====================================================

-- Example: Mark some existing records as verified (uncomment if needed)
-- UPDATE masters SET wa_verified = true WHERE whatsapp_id IS NOT NULL AND whatsapp_id != '';
-- UPDATE masters SET email_verified = true WHERE email IS NOT NULL AND email LIKE '%@%';
-- UPDATE masters SET phone_verified = true WHERE phone IS NOT NULL AND length(phone) > 5;

-- UPDATE clients SET wa_verified = true WHERE whatsapp_id IS NOT NULL AND whatsapp_id != '';
-- UPDATE clients SET email_verified = true WHERE email IS NOT NULL AND email LIKE '%@%';
-- UPDATE clients SET phone_verified = true WHERE phone IS NOT NULL AND length(phone) > 5;

COMMIT;

-- =====================================================
-- Post-migration verification (run these queries manually)
-- =====================================================

/*
-- Check data counts
SELECT
    'masters' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN wa_verified THEN 1 END) as wa_verified_count,
    COUNT(CASE WHEN email_verified THEN 1 END) as email_verified_count,
    COUNT(CASE WHEN phone_verified THEN 1 END) as phone_verified_count
FROM masters

UNION ALL

SELECT
    'clients' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN wa_verified THEN 1 END) as wa_verified_count,
    COUNT(CASE WHEN email_verified THEN 1 END) as email_verified_count,
    COUNT(CASE WHEN phone_verified THEN 1 END) as phone_verified_count
FROM clients;
*/

-- =====================================================
-- END OF MIGRATION
-- =====================================================
