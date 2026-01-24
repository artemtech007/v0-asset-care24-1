-- =====================================================
-- AssetCare24 Database Migration: Fix Requests Status Constraint
-- Version: 2.11
-- Date: 27 January 2026
-- Description: Update requests table to use new status workflow and add constraint
-- =====================================================

BEGIN;

-- =====================================================
-- 1. Update default status for new requests
-- =====================================================

-- Change default value for status column to 'waiting_candidates'
ALTER TABLE requests
ALTER COLUMN status SET DEFAULT 'waiting_candidates';

-- =====================================================
-- 2. Update existing records with 'new' status
-- =====================================================

-- Convert old 'new' status to 'waiting_candidates'
UPDATE requests
SET status = 'waiting_candidates'
WHERE status = 'new';

-- Convert old 'assigned' status to 'master_assigned'
UPDATE requests
SET status = 'master_assigned'
WHERE status = 'assigned';

-- =====================================================
-- 3. Add CHECK constraint for new status values
-- =====================================================

-- Drop existing constraint if it exists
ALTER TABLE requests
DROP CONSTRAINT IF EXISTS requests_status_check;

-- Add new constraint with expanded status list
ALTER TABLE requests
ADD CONSTRAINT requests_status_check CHECK (status IN (
    'waiting_candidates',     -- заявка создана, опубликована в Telegram, ждем откликов мастеров
    'candidates_collecting',  -- собираем кандидатов (мастера откликаются)
    'master_selection',       -- администратор выбирает мастера из кандидатов
    'master_assigned',        -- мастер назначен, но еще не приступил
    'scheduled',              -- запланирована дата выполнения
    'in_progress',            -- мастер приступил к работе
    'paused',                 -- работа приостановлена (ждет материалов/инструментов)
    'completed',              -- работа завершена
    'feedback_pending',       -- ждем оценки от клиента
    'feedback_received',      -- оценка получена
    'canceled'                -- заявка отменена
));

-- =====================================================
-- 4. Validation queries (run after migration)
-- =====================================================

-- Check that constraint was added and all records comply
SELECT
    'requests' as table_name,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'waiting_candidates' THEN 1 END) as waiting_candidates_count,
    COUNT(CASE WHEN status = 'master_assigned' THEN 1 END) as master_assigned_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN status NOT IN (
        'waiting_candidates', 'candidates_collecting', 'master_selection',
        'master_assigned', 'scheduled', 'in_progress', 'paused',
        'completed', 'feedback_pending', 'feedback_received', 'canceled'
    ) THEN 1 END) as invalid_status_count
FROM requests;

-- Check constraint definition
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'requests_status_check';

COMMIT;

-- =====================================================
-- Post-migration verification (run these queries manually)
-- =====================================================

/*
-- Test creating a new request (should work now)
INSERT INTO requests (client_id, address_snapshot, description)
VALUES ('cid_wa_79196811458', 'Test Address', 'Test request description')
RETURNING id, status;

-- Clean up test data
DELETE FROM requests WHERE description = 'Test request description';

-- Check status distribution after migration
SELECT status, COUNT(*) as count
FROM requests
GROUP BY status
ORDER BY count DESC;
*/

-- =====================================================
-- END OF MIGRATION
-- =====================================================
