-- =====================================================
-- Fix views for admin dashboard testing
-- Выполнить в Supabase SQL Editor
-- =====================================================

-- 1. Обновить view_dispatcher_dashboard для корректной обработки NULL имен
CREATE OR REPLACE VIEW view_dispatcher_dashboard AS
SELECT
    r.id as request_id,
    r.status as request_status,
    r.created_at as request_created,
    r.urgency,
    r.category,
    r.description,
    r.postal_code,
    r.address_snapshot as address,

    -- Информация о клиенте (с правильной обработкой NULL)
    COALESCE(NULLIF(TRIM(CONCAT(COALESCE(c.first_name, ''), ' ', COALESCE(c.last_name, ''))), ''), 'Unbekannt') as client_name,
    c.phone as client_phone,
    c.category as client_category,
    c.subcategory as client_subcategory,

    -- Информация о адресе
    ca.name as address_name,
    ca.postal_code as address_postal_code,

    -- Информация о назначенном мастере (с правильной обработкой NULL)
    COALESCE(NULLIF(TRIM(CONCAT(COALESCE(m.first_name, ''), ' ', COALESCE(m.last_name, ''))), ''), NULL) as master_name,
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

-- 2. Добавить тестовые данные для демонстрации
UPDATE clients
SET first_name = 'Иван', last_name = 'Петров', phone = '+49123456789', email = 'ivan.petrov@email.com'
WHERE id = 'cid_wa_79196811458';

UPDATE requests SET category = 'Сантехника', description = 'Протечка крана в ванной' WHERE id = 1;
UPDATE requests SET category = 'Электрика', description = 'Замена розетки в гостиной' WHERE id = 2;
UPDATE requests SET category = 'Малярные работы', description = 'Покраска стен в спальне' WHERE id = 3;
UPDATE requests SET category = 'Клининговые услуги', description = 'Генеральная уборка квартиры' WHERE id = 4;
UPDATE requests SET category = 'Садово-огородные', description = 'Обрезка кустов в саду' WHERE id = 5;

-- 3. Проверить результат
SELECT 'VIEW UPDATED - Testing admin dashboard...' as status;
