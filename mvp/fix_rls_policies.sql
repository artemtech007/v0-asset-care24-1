-- =============================================================================
-- Исправление RLS политик - ТОЛЬКО если миграция прервалась на этом этапе
-- Выполнять только если таблицы созданы, но политики RLS не созданы
-- =============================================================================

-- Включаем RLS для таблицы кандидатов
ALTER TABLE public.request_candidates ENABLE ROW LEVEL SECURITY;

-- Создаем политики RLS с проверками существования
DO $$
BEGIN
    -- Создаем политику для админов, если она не существует
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'request_candidates'
        AND policyname = 'Admins can manage request candidates'
    ) THEN
        CREATE POLICY "Admins can manage request candidates"
        ON public.request_candidates
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.admin_users
                WHERE id = current_setting('request.jwt.claims', true)::json->>'sub'
                AND role IN ('admin', 'manager')
            )
        );
        RAISE NOTICE 'Created policy: Admins can manage request candidates';
    ELSE
        RAISE NOTICE 'Policy already exists: Admins can manage request candidates';
    END IF;

    -- Создаем политику для мастеров, если она не существует
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'request_candidates'
        AND policyname = 'Masters can view their own candidates'
    ) THEN
        CREATE POLICY "Masters can view their own candidates"
        ON public.request_candidates
        FOR SELECT USING (
            master_id = current_setting('request.jwt.claims', true)::json->>'sub'
        );
        RAISE NOTICE 'Created policy: Masters can view their own candidates';
    ELSE
        RAISE NOTICE 'Policy already exists: Masters can view their own candidates';
    END IF;
END
$$;

-- =============================================================================
-- Проверка создания политик
-- =============================================================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'request_candidates'
ORDER BY policyname;

-- =============================================================================
-- КОНЕЦ ИСПРАВЛЕНИЯ RLS ПОЛИТИК
-- =============================================================================
