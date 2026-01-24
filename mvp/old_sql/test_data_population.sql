-- =============================================================================
-- AssetCare24 MVP - Тестовые данные для админки (МИНИМАЛЬНАЯ ВЕРСИЯ)
-- =============================================================================
-- Этот скрипт заполняет базу данных базовыми тестовыми данными для демонстрации
-- работы админской панели. Используются только гарантированно существующие таблицы
-- и поля из базовой схемы MVP.
--
-- Включает:
-- ✅ Клиенты (4 разных статуса)
-- ✅ Мастера (4 разных статуса)
-- ✅ Адреса клиентов
-- ✅ Заявки (6 разных статусов)
--
-- Исключены потенциально проблемные поля: thread_id, wa_verified, master_settings, etc.
-- =============================================================================

-- Очистка существующих данных (только для тестов!)
-- DELETE FROM reviews;
-- DELETE FROM request_media;
-- DELETE FROM client_status;
-- DELETE FROM master_status;
-- DELETE FROM requests;
-- DELETE FROM client_addresses;
-- DELETE FROM master_settings;
-- DELETE FROM user_links;
-- DELETE FROM clients WHERE id LIKE 'cid_wa_%';
-- DELETE FROM masters WHERE id LIKE 'mid_wa_%';

-- =============================================================================
-- 1. ТЕСТОВЫЕ КЛИЕНТЫ (clients)
-- =============================================================================

-- Активный верифицированный клиент
INSERT INTO public.clients (
    id, phone, email, whatsapp_id, telegram_id,
    first_name, last_name, status, category, subcategory, source,
    wa_verified, email_verified, phone_verified,
    first_contact_at, last_activity_at
) VALUES (
    'cid_wa_49123456789', '+49123456789', 'anna.mueller@email.de', 'whatsapp_anna_001', 'tg_anna_001',
    'Anna', 'Müller', 'active', 'existing_client', 'house_1', 'qr_code',
    true, true, true,
    '2026-01-20 10:00:00+00', '2026-01-23 14:30:00+00'
);

-- Новый клиент (недавно зарегистрировался)
INSERT INTO public.clients (
    id, phone, email, whatsapp_id, telegram_id,
    first_name, last_name, status, category, subcategory, source,
    wa_verified, email_verified, phone_verified,
    first_contact_at, last_activity_at
) VALUES (
    'cid_wa_49123456790', '+49123456790', 'max.schmidt@email.de', 'whatsapp_max_002', 'tg_max_002',
    'Max', 'Schmidt', 'active', 'new_client', 'apartment_3a', 'advertisement',
    true, false, false,
    '2026-01-22 09:15:00+00', '2026-01-23 11:45:00+00'
);

-- Заблокированный клиент
INSERT INTO public.clients (
    id, phone, email, whatsapp_id, telegram_id,
    first_name, last_name, status, category, subcategory, source,
    wa_verified, email_verified, phone_verified,
    first_contact_at, last_activity_at
) VALUES (
    'cid_wa_49123456791', '+49123456791', 'peter.wagner@email.de', 'whatsapp_peter_003', null,
    'Peter', 'Wagner', 'blocked', 'existing_client', 'house_15', 'website',
    true, true, true,
    '2026-01-15 16:20:00+00', '2026-01-21 08:10:00+00'
);

-- Неактивный клиент (долго не было активности)
INSERT INTO public.clients (
    id, phone, whatsapp_id,
    first_name, last_name, status, category, subcategory, source,
    first_contact_at, last_activity_at
) VALUES (
    'cid_wa_49123456792', '+49123456792', 'whatsapp_old_004',
    'Maria', 'Koch', 'inactive', 'existing_client', 'complex_a', 'referral',
    '2026-01-10 12:00:00+00', '2026-01-18 10:00:00+00'
);

-- =============================================================================
-- 2. АДРЕСА КЛИЕНТОВ (client_addresses)
-- =============================================================================

-- Адрес для Анны Мюллер (основной)
INSERT INTO public.client_addresses (
    client_id, name, postal_code, address_text, location, is_default
) VALUES (
    'cid_wa_49123456789', 'Zuhause', '10115', 'Friedrichstraße 123, Berlin',
    ST_GeomFromText('POINT(13.3888599 52.5170365)', 4326), true
);

-- Второй адрес Анны (офис)
INSERT INTO public.client_addresses (
    client_id, name, postal_code, address_text, location, is_default
) VALUES (
    'cid_wa_49123456789', 'Büro', '10557', 'Kurfürstendamm 45, Berlin',
    ST_GeomFromText('POINT(13.2956 52.5031)', 4326), false
);

-- Адрес для Макса Шмидта
INSERT INTO public.client_addresses (
    client_id, name, postal_code, address_text, location, is_default
) VALUES (
    'cid_wa_49123456790', 'Wohnung', '10243', 'Karl-Marx-Allee 78, Berlin',
    ST_GeomFromText('POINT(13.4421 52.5187)', 4326), true
);

-- Адрес для Марии Кох
INSERT INTO public.client_addresses (
    client_id, name, postal_code, address_text, location, is_default
) VALUES (
    'cid_wa_49123456792', 'Wohnsitz', '10318', 'Lichtenberger Straße 22, Berlin',
    ST_GeomFromText('POINT(13.4991 52.5162)', 4326), true
);

-- =============================================================================
-- 3. МАСТЕРА (masters)
-- =============================================================================

-- Активный мастер-электрик (одобрен)
INSERT INTO public.masters (
    id, phone, email, whatsapp_id, telegram_id,
    first_name, last_name, status,
    last_activity_at
) VALUES (
    'mid_wa_49987654321', '+49987654321', 'hans.meier@handwerker.de', 'whatsapp_hans_101', 'tg_hans_101',
    'Hans', 'Meier', 'active',
    '2026-01-23 13:00:00+00'
);

-- Мастер-сантехник (на рассмотрении)
INSERT INTO public.masters (
    id, phone, email, whatsapp_id,
    first_name, last_name, status,
    last_activity_at
) VALUES (
    'mid_wa_49987654322', '+49987654322', 'fritz.schulz@handwerker.de', 'whatsapp_fritz_102',
    'Fritz', 'Schulz', 'pending_approval',
    '2026-01-22 16:30:00+00'
);

-- Мастер-маляр (активный, но с низким рейтингом)
INSERT INTO public.masters (
    id, phone, email, whatsapp_id, telegram_id,
    first_name, last_name, status,
    last_activity_at
) VALUES (
    'mid_wa_49987654323', '+49987654323', 'werner.becker@handwerker.de', 'whatsapp_werner_103', 'tg_werner_103',
    'Werner', 'Becker', 'active',
    '2026-01-23 09:15:00+00'
);

-- Заблокированный мастер
INSERT INTO public.masters (
    id, phone, whatsapp_id,
    first_name, last_name, status,
    last_activity_at
) VALUES (
    'mid_wa_49987654324', '+49987654324', 'whatsapp_blocked_104',
    'Karl', 'Fischer', 'blocked',
    '2026-01-20 11:00:00+00'
);

-- =============================================================================
-- 4. ЗАЯВКИ (requests) - РАЗНЫЕ СТАТУСЫ
-- =============================================================================


-- =============================================================================
-- 4. ЗАЯВКИ (requests) - РАЗНЫЕ СТАТУСЫ
-- =============================================================================

-- Новая заявка (ожидает назначения)
INSERT INTO public.requests (
    client_id, address_snapshot, postal_code,
    status, category, description, urgency,
    admin_comment, created_at
) VALUES (
    'cid_wa_49123456789', 'Friedrichstraße 123, Berlin', '10115',
    'new', 'Elektrik', 'Замена розетки в гостиной, искрит и греется', 'normal',
    'Новая заявка, ожидает назначения мастера', '2026-01-23 10:00:00+00'
);

-- Назначенная заявка (ждет выполнения)
INSERT INTO public.requests (
    client_id, address_snapshot, postal_code, master_id,
    status, category, description, urgency,
    admin_comment, assigned_at, created_at
) VALUES (
    'cid_wa_49123456789', 'Friedrichstraße 123, Berlin', '10115', 'mid_wa_49987654321',
    'assigned', 'Elektrik', 'Ремонт проводки в ванной комнате', 'high',
    'Назначен мастер Ханс Мейер, ожидает подтверждения', '2026-01-23 10:30:00+00', '2026-01-22 15:00:00+00'
);

-- Заявка в работе
INSERT INTO public.requests (
    client_id, address_snapshot, postal_code, master_id,
    status, category, description, urgency,
    admin_comment, assigned_at, started_at, created_at
) VALUES (
    'cid_wa_49123456790', 'Karl-Marx-Allee 78, Berlin', '10243', 'mid_wa_49987654321',
    'in_progress', 'Sanitär', 'Установка нового смесителя в кухне', 'normal',
    'Мастер на объекте, работает над установкой', '2026-01-22 14:00:00+00', '2026-01-22 15:30:00+00', '2026-01-22 11:00:00+00'
);

-- Завершенная заявка
INSERT INTO public.requests (
    client_id, address_snapshot, postal_code, master_id,
    status, category, description, urgency,
    admin_comment, assigned_at, started_at, completed_at, created_at
) VALUES (
    'cid_wa_49123456792', 'Lichtenberger Straße 22, Berlin', '10318', 'mid_wa_49987654323',
    'completed', 'Maler', 'Покраска стен в детской комнате', 'low',
    'Завершено успешно, клиент доволен качеством', '2026-01-20 09:00:00+00', '2026-01-20 10:00:00+00', '2026-01-21 16:00:00+00', '2026-01-19 14:00:00+00'
);

-- Отмененная заявка
INSERT INTO public.requests (
    client_id, address_snapshot, postal_code, master_id,
    status, category, description, urgency,
    admin_comment, assigned_at, created_at
) VALUES (
    'cid_wa_49123456791', 'Friedrichstraße 123, Berlin', '10115', 'mid_wa_49987654324',
    'canceled', 'Heizung', 'Ремонт системы отопления', 'urgent',
    'Отменено клиентом из-за изменения планов', '2026-01-21 11:00:00+00', '2026-01-20 16:00:00+00'
);

-- Приостановленная заявка
INSERT INTO public.requests (
    client_id, address_snapshot, postal_code, master_id,
    status, category, description, urgency,
    admin_comment, assigned_at, started_at, created_at
) VALUES (
    'cid_wa_49123456789', 'Kurfürstendamm 45, Berlin', '10557', 'mid_wa_49987654322',
    'paused', 'Elektrik', 'Установка системы безопасности', 'high',
    'Приостановлено - ожидание материалов от поставщика', '2026-01-22 08:00:00+00', '2026-01-22 09:00:00+00', '2026-01-21 13:00:00+00'
);


-- =============================================================================
-- ПРОВЕРКА РЕЗУЛЬТАТОВ
-- =============================================================================

-- Посмотреть созданные данные
SELECT 'Клиенты:' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'Мастера:', COUNT(*) FROM masters
UNION ALL
SELECT 'Заявки:', COUNT(*) FROM requests
UNION ALL
SELECT 'Адреса:', COUNT(*) FROM client_addresses;

-- =============================================================================
-- КОНЕЦ СКРИПТА
-- =============================================================================
