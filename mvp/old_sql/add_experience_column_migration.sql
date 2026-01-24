-- =====================================================
-- AssetCare24: Add experience column to master_settings
-- Version: v2.6
-- Date: 2026-01-23
-- Description: Добавление столбца experience (varchar) в таблицу master_settings
-- =====================================================

BEGIN;

-- Добавить столбец experience типа varchar
ALTER TABLE master_settings
ADD COLUMN experience varchar;

-- Добавить комментарий к столбцу для документации
COMMENT ON COLUMN master_settings.experience IS 'Опыт работы мастера (текстовое описание)';

-- Добавить индекс для поиска по опыту работы (опционально, для фильтрации)
CREATE INDEX IF NOT EXISTS idx_master_settings_experience ON master_settings(experience);

-- Проверить, что столбец добавлен успешно
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'master_settings'
        AND column_name = 'experience'
        AND table_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'Столбец experience не был добавлен в таблицу master_settings';
    END IF;

    RAISE NOTICE 'Столбец experience успешно добавлен в таблицу master_settings';
END $$;

COMMIT;
