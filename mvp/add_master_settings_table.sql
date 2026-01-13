-- =====================================================
-- Добавление таблицы master_settings в существующую БД
-- Запускать после применения init_database_v2.1.sql
-- =====================================================

-- Создание таблицы master_settings
CREATE TABLE IF NOT EXISTS public.master_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    master_id text REFERENCES public.masters(id) ON DELETE CASCADE UNIQUE,

    -- Зона обслуживания
    service_area text,

    -- Рабочие дни недели (булевы поля)
    work_mo boolean DEFAULT false,
    work_di boolean DEFAULT false,
    work_mi boolean DEFAULT false,
    work_do boolean DEFAULT false,
    work_fr boolean DEFAULT false,
    work_sa boolean DEFAULT false,
    work_so boolean DEFAULT false,

    -- Время работы по дням недели
    work_start_mo time,
    work_end_mo time,
    work_start_di time,
    work_end_di time,
    work_start_mi time,
    work_end_mi time,
    work_start_do time,
    work_end_do time,
    work_start_fr time,
    work_end_fr time,
    work_start_sa time,
    work_end_sa time,
    work_start_so time,
    work_end_so time,

    -- Специализации (булевы поля)
    spec_elektrik boolean DEFAULT false,
    spec_sanitaer boolean DEFAULT false,
    spec_heizung boolean DEFAULT false,
    spec_maler boolean DEFAULT false,
    spec_elektriker boolean DEFAULT false,
    spec_klempner boolean DEFAULT false,
    spec_schlosser boolean DEFAULT false,
    spec_garten boolean DEFAULT false,
    spec_reinigung boolean DEFAULT false,
    spec_other boolean DEFAULT false,

    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Добавление индексов
CREATE INDEX IF NOT EXISTS idx_master_settings_master ON master_settings(master_id);
CREATE INDEX IF NOT EXISTS idx_master_settings_service_area ON master_settings(service_area);
CREATE INDEX IF NOT EXISTS idx_master_settings_work_days ON master_settings(work_mo, work_di, work_mi, work_do, work_fr, work_sa, work_so);
CREATE INDEX IF NOT EXISTS idx_master_settings_specs ON master_settings(spec_elektrik, spec_sanitaer, spec_heizung, spec_maler);

-- Включение RLS
ALTER TABLE public.master_settings ENABLE ROW LEVEL SECURITY;

-- Добавление политик RLS
CREATE POLICY "Masters can read own settings" ON public.master_settings
FOR SELECT USING (master_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Masters can update own settings" ON public.master_settings
FOR UPDATE USING (master_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Добавление view для детальной информации о мастерах
CREATE OR REPLACE VIEW view_master_details AS
SELECT
    m.id as master_id,
    CONCAT(m.first_name, ' ', m.last_name) as full_name,
    m.phone,
    m.email,
    m.status as master_status,
    m.rating,
    m.completed_jobs,
    m.created_at as registered_at,

    -- Настройки графика работы
    ms.service_area,
    -- Общее время работы (для совместимости, берем из понедельника)
    ms.work_start_mo as work_start,
    ms.work_end_mo as work_end,
    ms.work_mo, ms.work_di, ms.work_mi, ms.work_do, ms.work_fr, ms.work_sa, ms.work_so,

    -- Специализации
    ms.spec_elektrik, ms.spec_sanitaer, ms.spec_heizung, ms.spec_maler,
    ms.spec_elektriker, ms.spec_klempner, ms.spec_schlosser, ms.spec_garten, ms.spec_reinigung, ms.spec_other,

    -- Статистика
    COUNT(r.id) as total_requests,
    COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_requests,
    COUNT(CASE WHEN r.status = 'in_progress' THEN 1 END) as active_requests,
    AVG(rv.rating) as avg_client_rating,
    MAX(r.completed_at) as last_job_date

FROM masters m
LEFT JOIN master_settings ms ON m.id = ms.master_id
LEFT JOIN requests r ON m.id = r.master_id
LEFT JOIN reviews rv ON r.id = rv.request_id
GROUP BY m.id, m.first_name, m.last_name, m.phone, m.email, m.status, m.rating, m.completed_jobs, m.created_at,
         ms.service_area, ms.work_start_mo, ms.work_end_mo,
         ms.work_mo, ms.work_di, ms.work_mi, ms.work_do, ms.work_fr, ms.work_sa, ms.work_so,
         ms.spec_elektrik, ms.spec_sanitaer, ms.spec_heizung, ms.spec_maler,
         ms.spec_elektriker, ms.spec_klempner, ms.spec_schlosser, ms.spec_garten, ms.spec_reinigung, ms.spec_other;

-- =====================================================
-- ПРИМЕР МИГРАЦИИ СУЩЕСТВУЮЩИХ МАСТЕРОВ
-- Запускать только если есть мастера без настроек
-- =====================================================

-- Найти мастеров без настроек
-- SELECT m.* FROM masters m LEFT JOIN master_settings ms ON m.id = ms.master_id WHERE ms.id IS NULL;

-- Создать базовые настройки для существующих мастеров (пример)
-- INSERT INTO master_settings (master_id, work_mo, work_di, work_mi, work_do, work_fr)
-- SELECT id, true, true, true, true, true FROM masters
-- WHERE id NOT IN (SELECT master_id FROM master_settings WHERE master_id IS NOT NULL);

-- =====================================================
-- КОНЕЦ СКРИПТА
-- =====================================================
