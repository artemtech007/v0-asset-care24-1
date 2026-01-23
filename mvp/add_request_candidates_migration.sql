-- =============================================================================
-- AssetCare24 MVP - Миграция для кандидатов на заявки
-- Добавление таблицы request_candidates и обновление статусов requests
-- =============================================================================

-- =============================================================================
-- 1. Создание таблицы request_candidates
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.request_candidates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id bigint NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    master_id text NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
    applied_at timestamptz DEFAULT now(),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'rejected', 'withdrawn')),
    master_comment text,
    admin_comment text,
    selected_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- 2. Индексы для производительности
-- =============================================================================

-- Уникальный индекс: один мастер может откликнуться на заявку только один раз
CREATE UNIQUE INDEX IF NOT EXISTS idx_request_candidates_unique
ON public.request_candidates(request_id, master_id);

-- Индексы для поиска
CREATE INDEX IF NOT EXISTS idx_request_candidates_request
ON public.request_candidates(request_id);

CREATE INDEX IF NOT EXISTS idx_request_candidates_master
ON public.request_candidates(master_id);

CREATE INDEX IF NOT EXISTS idx_request_candidates_status
ON public.request_candidates(status);

-- =============================================================================
-- 3. Обновление таблицы requests - новые поля
-- =============================================================================

-- Добавляем новые поля для Telegram интеграции
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS published_at timestamptz;

ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS telegram_message_id text;

-- =============================================================================
-- 4. Обновление статусов существующих заявок
-- =============================================================================

-- Маппинг старых статусов на новые
UPDATE public.requests
SET status = CASE
    WHEN status = 'new' THEN 'waiting_candidates'
    WHEN status = 'assigned' THEN 'master_assigned'
    WHEN status = 'in_progress' THEN 'in_progress'
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'canceled' THEN 'canceled'
    WHEN status = 'paused' THEN 'paused'
    ELSE 'waiting_candidates'
END;

-- =============================================================================
-- 5. Создание существующих кандидатов для заявок с назначенными мастерами
-- =============================================================================

-- Для заявок, где уже назначен мастер, создаем запись кандидата
INSERT INTO public.request_candidates (
    request_id,
    master_id,
    applied_at,
    status,
    admin_comment,
    selected_at
)
SELECT
    r.id as request_id,
    r.master_id,
    r.assigned_at as applied_at,
    'selected' as status,
    'Автоматически создан при миграции' as admin_comment,
    r.assigned_at as selected_at
FROM public.requests r
WHERE r.master_id IS NOT NULL
  AND r.status IN ('master_assigned', 'scheduled', 'in_progress', 'completed')
  AND NOT EXISTS (
      SELECT 1 FROM public.request_candidates rc
      WHERE rc.request_id = r.id AND rc.master_id = r.master_id
  );

-- =============================================================================
-- 6. Row Level Security для новой таблицы
-- =============================================================================

ALTER TABLE public.request_candidates ENABLE ROW LEVEL SECURITY;

-- Политики RLS (адаптировать под нужды безопасности)
CREATE POLICY "Admins can manage request candidates"
ON public.request_candidates
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND role IN ('admin', 'manager')
    )
);

CREATE POLICY "Masters can view their own candidates"
ON public.request_candidates
FOR SELECT USING (
    master_id = current_setting('request.jwt.claims', true)::json->>'sub'
);

-- =============================================================================
-- 7. Обновление views для админки
-- =============================================================================

-- Обновляем view_dispatcher_dashboard для работы с новыми статусами
CREATE OR REPLACE VIEW public.view_dispatcher_dashboard AS
SELECT
  r.id as request_id,
  r.status as request_status,
  r.created_at as request_created,
  r.urgency,
  r.category,
  r.description,
  r.postal_code,
  r.address_snapshot as address,
  r.published_at,
  r.telegram_message_id,

  -- Информация о клиенте
  CONCAT(c.first_name, ' ', c.last_name) as client_name,
  c.phone as client_phone,
  c.category as client_category,
  c.subcategory as client_subcategory,

  -- Информация о адресе
  ca.name as address_name,
  ca.postal_code as address_postal_code,

  -- Информация о назначенном мастере
  CONCAT(m.first_name, ' ', m.last_name) as master_name,
  m.phone as master_phone,
  m.rating as master_rating,
  r.assigned_at,

  -- Статистика кандидатов
  COALESCE(rc.candidates_count, 0) as candidates_count,

  -- Сроки
  EXTRACT(EPOCH FROM (now() - r.created_at))/3600 as hours_since_created,
  CASE
      WHEN r.status IN ('scheduled', 'in_progress', 'completed') THEN
          EXTRACT(EPOCH FROM (now() - r.assigned_at))/3600
      ELSE NULL
  END as hours_since_assigned

FROM public.requests r
JOIN public.clients c ON r.client_id = c.id
LEFT JOIN public.client_addresses ca ON r.address_id = ca.id
LEFT JOIN public.masters m ON r.master_id = m.id
LEFT JOIN (
    SELECT
        request_id,
        COUNT(*) as candidates_count
    FROM public.request_candidates
    GROUP BY request_id
) rc ON r.id = rc.request_id
WHERE r.status NOT IN ('completed', 'canceled', 'feedback_received')
ORDER BY
    CASE r.status
        WHEN 'waiting_candidates' THEN 1
        WHEN 'candidates_collecting' THEN 2
        WHEN 'master_selection' THEN 3
        WHEN 'master_assigned' THEN 4
        WHEN 'scheduled' THEN 5
        WHEN 'in_progress' THEN 6
        WHEN 'paused' THEN 7
        WHEN 'feedback_pending' THEN 8
        ELSE 9
    END,
    r.urgency DESC,
    r.created_at DESC;

-- =============================================================================
-- 8. Проверка результатов миграции
-- =============================================================================

-- Проверяем созданные таблицы
SELECT
    'Requests table updated' as check_name,
    COUNT(*) as requests_count
FROM public.requests
WHERE status IN ('waiting_candidates', 'master_assigned', 'completed')

UNION ALL

SELECT
    'Candidates table created' as check_name,
    COUNT(*) as candidates_count
FROM public.request_candidates

UNION ALL

SELECT
    'View updated' as check_name,
    COUNT(*) as view_records
FROM public.view_dispatcher_dashboard;

-- =============================================================================
-- КОНЕЦ МИГРАЦИИ
-- =============================================================================
