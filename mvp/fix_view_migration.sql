-- =============================================================================
-- Исправление view_dispatcher_dashboard - ТОЛЬКО 7-й блок миграции
-- Выполнять только если первые 6 блоков уже прошли успешно
-- =============================================================================

-- Удаляем старую view перед созданием новой (чтобы избежать конфликтов колонок)
DROP VIEW IF EXISTS public.view_dispatcher_dashboard;

-- Создаем view_dispatcher_dashboard для работы с новыми статусами
CREATE VIEW public.view_dispatcher_dashboard AS
SELECT
  r.id as request_id,
  r.status as request_status,
  r.created_at as request_created,
  r.urgency,
  r.category,
  r.description,
  r.postal_code,
  r.address_snapshot as address,
  r.published_at as request_published_at,
  r.telegram_message_id as request_telegram_message_id,

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
-- Проверка создания view
-- =============================================================================

SELECT
    'View created successfully' as status,
    COUNT(*) as records_count
FROM view_dispatcher_dashboard;

-- =============================================================================
-- КОНЕЦ ИСПРАВЛЕНИЯ VIEW
-- =============================================================================
