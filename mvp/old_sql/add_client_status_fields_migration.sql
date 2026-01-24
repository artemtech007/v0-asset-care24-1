-- =====================================================
-- AssetCare24: Add new fields to client_status table
-- Version: v2.7
-- Date: 2026-01-23
-- Description: Добавление полей для отслеживания последней заявки и дополнительных статусов
-- =====================================================

BEGIN;

-- Добавить поле для номера последней заявки
ALTER TABLE client_status
ADD COLUMN last_request_id bigint REFERENCES requests(id);

-- Добавить поле для статуса последней заявки
ALTER TABLE client_status
ADD COLUMN last_request_status text;

-- Добавить дополнительные поля статуса
ALTER TABLE client_status
ADD COLUMN status_1 varchar(50);

-- Добавить дополнительные поля статуса
ALTER TABLE client_status
ADD COLUMN status_2 varchar(50);

-- Добавить комментарии к новым столбцам для документации
COMMENT ON COLUMN client_status.last_request_id IS 'ID последней заявки клиента';
COMMENT ON COLUMN client_status.last_request_status IS 'Статус последней заявки клиента';
COMMENT ON COLUMN client_status.status_1 IS 'Дополнительное поле состояния #1';
COMMENT ON COLUMN client_status.status_2 IS 'Дополнительное поле состояния #2';

-- Добавить индексы для производительности
CREATE INDEX IF NOT EXISTS idx_client_status_last_request ON client_status(last_request_id);
CREATE INDEX IF NOT EXISTS idx_client_status_last_request_status ON client_status(last_request_status);

-- Проверить, что столбцы добавлены успешно
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'client_status'
        AND column_name = 'last_request_id'
        AND table_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'Столбец last_request_id не был добавлен в таблицу client_status';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'client_status'
        AND column_name = 'last_request_status'
        AND table_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'Столбец last_request_status не был добавлен в таблицу client_status';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'client_status'
        AND column_name = 'status_1'
        AND table_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'Столбец status_1 не был добавлен в таблицу client_status';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'client_status'
        AND column_name = 'status_2'
        AND table_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'Столбец status_2 не был добавлен в таблицу client_status';
    END IF;

    RAISE NOTICE 'Все новые поля успешно добавлены в таблицу client_status';
END $$;

COMMIT;
