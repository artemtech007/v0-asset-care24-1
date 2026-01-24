-- =====================================================
-- Quick Database Check - AssetCare24
-- =====================================================
-- Быстрая проверка состояния базы данных
-- Выполнить в Supabase SQL Editor

-- 1. Проверка существования основных таблиц
SELECT
    'Таблица существует?' as check_type,
    table_name,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = t.table_name AND table_schema = 'public'
        ) THEN '✅ ДА'
        ELSE '❌ НЕТ'
    END as status
FROM (VALUES
    ('clients'),
    ('masters'),
    ('requests'),
    ('client_addresses')
) as t(table_name);

-- 2. Проверка поля completed_jobs в masters
SELECT
    'Поле completed_jobs в masters:' as check_type,
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'masters'
            AND column_name = 'completed_jobs'
            AND table_schema = 'public'
        ) THEN '✅ СУЩЕСТВУЕТ'
        ELSE '❌ ОТСУТСТВУЕТ'
    END as status;

-- 3. Количество записей в основных таблицах
SELECT
    'clients' as table_name,
    COUNT(*) as records_count
FROM clients
UNION ALL
SELECT
    'masters' as table_name,
    COUNT(*) as records_count
FROM masters
UNION ALL
SELECT
    'requests' as table_name,
    COUNT(*) as records_count
FROM requests;

-- 4. Структура таблицы masters (простая версия)
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'masters'
AND table_schema = 'public'
ORDER BY ordinal_position;
