-- =====================================================
-- Check Current Database Tables
-- =====================================================
-- Проверить какие таблицы существуют в текущей БД
-- Выполнить в Supabase SQL Editor

-- 1. Список всех таблиц в схеме public
SELECT
    tablename as table_name,
    schemaname as schema_name,
    tableowner as owner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Проверить существование основных таблиц
SELECT
    'clients' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
                     WHERE table_name = 'clients' AND table_schema = 'public')
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT
    'masters' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
                     WHERE table_name = 'masters' AND table_schema = 'public')
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT
    'requests' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
                     WHERE table_name = 'requests' AND table_schema = 'public')
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 3. Если таблицы существуют - показать количество записей
SELECT
    'clients' as table_name,
    COUNT(*) as record_count
FROM clients
UNION ALL
SELECT
    'masters' as table_name,
    COUNT(*) as record_count
FROM masters
UNION ALL
SELECT
    'requests' as table_name,
    COUNT(*) as record_count
FROM requests;
