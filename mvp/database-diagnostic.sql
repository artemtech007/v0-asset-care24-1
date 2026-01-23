-- =====================================================
-- Database Diagnostic - AssetCare24
-- =====================================================
-- Диагностика состояния базы данных
-- Выполнить в Supabase SQL Editor

-- 1. Проверка существования таблиц
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Структура таблицы masters (если существует)
DO $$
DECLARE
    column_info RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'masters' AND table_schema = 'public') THEN
        RAISE NOTICE 'Таблица masters существует';

        -- Показать все колонки masters
        FOR column_info IN
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'masters' AND table_schema = 'public'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE 'Колонка: %, Тип: %, Nullable: %, Default: %',
                column_info.column_name, column_info.data_type,
                column_info.is_nullable, column_info.column_default;
        END LOOP;
    ELSE
        RAISE NOTICE 'Таблица masters НЕ существует';
    END IF;
END $$;

-- 3. Структура таблицы clients (если существует)
DO $$
DECLARE
    client_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients' AND table_schema = 'public') THEN
        RAISE NOTICE 'Таблица clients существует';

        -- Показать количество записей
        SELECT COUNT(*) INTO client_count FROM clients;
        RAISE NOTICE 'Записей в clients: %', client_count;
    ELSE
        RAISE NOTICE 'Таблица clients НЕ существует';
    END IF;
END $$;

-- 4. Проверка наличия поля completed_jobs в masters
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'masters'
            AND column_name = 'completed_jobs'
            AND table_schema = 'public'
        ) THEN 'Поле completed_jobs СУЩЕСТВУЕТ в masters'
        ELSE 'Поле completed_jobs ОТСУТСТВУЕТ в masters'
    END as completed_jobs_status;

-- 5. Проверка всех необходимых таблиц
SELECT
    table_name,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = t.table_name AND table_schema = 'public'
        ) THEN 'Существует'
        ELSE 'ОТСУТСТВУЕТ'
    END as status
FROM (VALUES
    ('clients'),
    ('masters'),
    ('requests'),
    ('client_addresses'),
    ('admin_users'),
    ('request_media'),
    ('client_status'),
    ('master_status'),
    ('master_settings'),
    ('reviews'),
    ('processed_messages')
) as t(table_name);

-- 6. Если таблиц нет - предложить инициализацию
DO $$
DECLARE
    missing_tables TEXT := '';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients' AND table_schema = 'public') THEN
        missing_tables := missing_tables || ' clients';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'masters' AND table_schema = 'public') THEN
        missing_tables := missing_tables || ' masters';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'requests' AND table_schema = 'public') THEN
        missing_tables := missing_tables || ' requests';
    END IF;

    IF missing_tables != '' THEN
        RAISE NOTICE 'База данных не инициализирована. Отсутствуют таблицы: %. Выполните init_database_v2.3.sql', missing_tables;
    ELSE
        RAISE NOTICE 'База данных инициализирована корректно';
    END IF;
END $$;
