-- =====================================================
-- AssetCare24: Remove NOT NULL constraint from address_snapshot
-- Version: v2.8
-- Date: 2026-01-23
-- Description: Снятие обязательности поля address_snapshot в таблице requests
-- =====================================================

BEGIN;

-- Снять констрейнт NOT NULL с поля address_snapshot
ALTER TABLE requests
ALTER COLUMN address_snapshot DROP NOT NULL;

-- Обновить комментарий к столбцу
COMMENT ON COLUMN requests.address_snapshot IS 'Копия адреса для истории (опционально)';

-- Проверить, что констрейнт снят успешно
DO $$
DECLARE
    column_is_nullable boolean;
BEGIN
    SELECT c.is_nullable = 'YES'
    INTO column_is_nullable
    FROM information_schema.columns c
    WHERE c.table_name = 'requests'
    AND c.column_name = 'address_snapshot'
    AND c.table_schema = 'public';

    IF NOT column_is_nullable THEN
        RAISE EXCEPTION 'Констрейнт NOT NULL не был снят с поля address_snapshot';
    END IF;

    RAISE NOTICE 'Констрейнт NOT NULL успешно снят с поля address_snapshot';
END $$;

COMMIT;
