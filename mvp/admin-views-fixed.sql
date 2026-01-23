-- =====================================================
-- Admin Dashboard Views Setup - FIXED VERSION
-- =====================================================
-- Исправленная версия без сложного PL/pgSQL
-- Выполнить в Supabase SQL Editor

-- =====================================================
-- 1. VIEW_ALL_USERS - Объединенный список пользователей
-- =====================================================
-- Упрощенная версия: используем подсчет заказов вместо поля completed_jobs
-- Это надежнее и точнее отражает реальное состояние
CREATE OR REPLACE VIEW view_all_users AS
SELECT
    'client' as user_type,
    id,
    first_name,
    last_name,
    email,
    phone,
    status,
    created_at as registered_at,
    last_activity_at as last_active,
    wa_verified as verified,
    email_verified,
    phone_verified,
    -- Подсчет заказов для клиентов
    COALESCE((SELECT COUNT(*) FROM requests WHERE client_id = c.id), 0) as orders_count,
    NULL as rating
FROM clients c

UNION ALL

SELECT
    'master' as user_type,
    id,
    first_name,
    last_name,
    email,
    phone,
    status,
    created_at as registered_at,
    last_activity_at as last_active,
    wa_verified as verified,
    email_verified,
    phone_verified,
    -- Подсчет завершенных заказов для мастеров
    COALESCE((SELECT COUNT(*) FROM requests WHERE master_id = m.id AND status = 'completed'), 0) as orders_count,
    rating
FROM masters m;

-- =====================================================
-- 2. VIEW_DISPATCHER_DASHBOARD - Заказы для админки
-- =====================================================
CREATE OR REPLACE VIEW view_dispatcher_dashboard AS
SELECT
    r.id as request_id,
    r.status as request_status,
    r.created_at as request_created,
    r.urgency,
    r.category,
    r.description,
    r.postal_code,
    COALESCE(r.address_snapshot, ca.address_text) as address,

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

    -- Сроки
    EXTRACT(EPOCH FROM (now() - r.created_at))/3600 as hours_since_created,
    CASE
        WHEN r.status = 'assigned' THEN EXTRACT(EPOCH FROM (now() - r.assigned_at))/3600
        ELSE NULL
    END as hours_since_assigned

FROM requests r
JOIN clients c ON r.client_id = c.id
LEFT JOIN client_addresses ca ON r.address_id = ca.id
LEFT JOIN masters m ON r.master_id = m.id
WHERE r.status IN ('new', 'assigned', 'in_progress')
ORDER BY
    CASE r.urgency
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 3
        WHEN 'low' THEN 4
    END,
    r.created_at ASC;

-- =====================================================
-- 3. VIEW_ADMIN_STATS - Статистика для дашборда
-- =====================================================
CREATE OR REPLACE VIEW view_admin_stats AS
SELECT
    -- Активные пользователи
    (SELECT COUNT(*) FROM clients WHERE status = 'active') as active_clients,
    (SELECT COUNT(*) FROM masters WHERE status IN ('active', 'approved', 'verified')) as active_masters,

    -- Заблокированные пользователи
    (SELECT COUNT(*) FROM clients WHERE status = 'blocked') +
    (SELECT COUNT(*) FROM masters WHERE status = 'blocked') as blocked_users,

    -- Заказы
    (SELECT COUNT(*) FROM requests) as total_orders,
    (SELECT COUNT(*) FROM requests WHERE status IN ('new', 'assigned', 'in_progress')) as open_orders,
    (SELECT COUNT(*) FROM requests WHERE status = 'completed') as completed_orders,

    -- Доход (пока 0, так как поле price может отсутствовать)
    0 as total_revenue;

-- =====================================================
-- ПРОВЕРКА СОЗДАННЫХ VIEWS
-- =====================================================

-- Проверка view_all_users
SELECT 'view_all_users created successfully' as status,
       COUNT(*) as total_users,
       COUNT(CASE WHEN user_type = 'client' THEN 1 END) as clients,
       COUNT(CASE WHEN user_type = 'master' THEN 1 END) as masters
FROM view_all_users;

-- Проверка view_dispatcher_dashboard
SELECT 'view_dispatcher_dashboard created successfully' as status,
       COUNT(*) as total_requests
FROM view_dispatcher_dashboard;

-- Проверка view_admin_stats
SELECT * FROM view_admin_stats;

-- =====================================================
-- ДОПОЛНИТЕЛЬНЫЕ VIEWS (опционально)
-- =====================================================

-- View для детальной информации о мастерах
CREATE OR REPLACE VIEW view_master_details AS
SELECT
    m.*,
    COALESCE((SELECT COUNT(*) FROM requests WHERE master_id = m.id), 0) as total_requests,
    COALESCE((SELECT COUNT(*) FROM requests WHERE master_id = m.id AND status = 'completed'), 0) as completed_requests,
    COALESCE((SELECT AVG(rating) FROM reviews WHERE master_id = m.id), 0) as avg_rating
FROM masters m;
