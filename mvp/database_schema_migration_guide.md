# Руководство по миграциям схемы базы данных AssetCare24

**Версия:** 1.0
**Дата:** 13 января 2026 г.
**Автор:** AI Assistant

## 1. Обзор

Этот документ содержит **регламент** безопасного внесения изменений в схему базы данных без потери данных и нарушения работы системы. Вместо пересоздания таблиц мы используем **миграции** - поэтапное изменение структуры БД.

---

## 2. Основные принципы

### 2.1 Безопасность данных
- ✅ **Никогда не удалять данные** без подтверждения
- ✅ **Всегда делать бэкап** перед изменениями
- ✅ **Тестировать на копии** production базы
- ✅ **Использовать транзакции** для отката при ошибках

### 2.2 Порядок изменений
1. **Разработка** - изменение схемы в тестовой среде
2. **Тестирование** - проверка работоспособности
3. **Бэкап** - создание резервной копии
4. **Миграция** - применение изменений
5. **Валидация** - проверка целостности данных

### 2.3 Типы изменений
- **Деструктивные** (опасные): удаление данных, изменение типов
- **Конструктивные** (безопасные): добавление столбцов, индексов
- **Модифицирующие** (рискованные): изменение существующих данных

---

## 3. Добавление новых столбцов

### 3.1 Синтаксис
```sql
ALTER TABLE table_name
ADD COLUMN column_name data_type [constraints] [DEFAULT default_value];
```

### 3.2 Примеры

#### Добавление простого столбца
```sql
-- Добавить столбец для хранения URL профиля мастера
ALTER TABLE masters
ADD COLUMN profile_url text;
```

#### Добавление столбца с ограничениями
```sql
-- Добавить столбец для рейтинга с проверкой диапазона
ALTER TABLE masters
ADD COLUMN review_score numeric(3,2)
CHECK (review_score >= 0 AND review_score <= 5);
```

#### Добавление столбца с дефолтным значением
```sql
-- Добавить булевый столбец с дефолтом
ALTER TABLE masters
ADD COLUMN is_verified boolean DEFAULT false;
```

### 3.3 В master_settings
```sql
-- Добавить новый тип специализации
ALTER TABLE master_settings
ADD COLUMN spec_new_specialization boolean DEFAULT false;

-- Добавить индекс для нового поля
CREATE INDEX idx_master_settings_new_spec ON master_settings(spec_new_specialization);
```

---

## 4. Удаление столбцов

### 4.1 Безопасная последовательность

#### Шаг 1: Проверка зависимостей
```sql
-- Проверить, используется ли столбец в представлениях
SELECT * FROM information_schema.view_column_usage
WHERE table_name = 'masters' AND column_name = 'old_column';

-- Проверить индексы на столбце
SELECT * FROM pg_indexes
WHERE tablename = 'masters' AND indexdef LIKE '%old_column%';
```

#### Шаг 2: Удаление индексов (если есть)
```sql
-- Удалить индекс перед удалением столбца
DROP INDEX IF EXISTS idx_masters_old_column;
```

#### Шаг 3: Удаление столбца
```sql
-- Удалить столбец
ALTER TABLE masters DROP COLUMN old_column;
```

### 4.2 Примеры из нашего проекта

#### Удаление дублирующихся полей из masters
```sql
-- Удалить поля, которые теперь в master_settings
ALTER TABLE masters DROP COLUMN specializations;
ALTER TABLE masters DROP COLUMN working_hours;
ALTER TABLE masters DROP COLUMN working_days;
ALTER TABLE masters DROP COLUMN service_area;
ALTER TABLE masters DROP COLUMN has_vehicle;
ALTER TABLE masters DROP COLUMN experience_years;
ALTER TABLE masters DROP COLUMN qualifications;
ALTER TABLE masters DROP COLUMN documents_verified;
ALTER TABLE masters DROP COLUMN approval_date;
ALTER TABLE masters DROP COLUMN admin_comment;
```

---

## 5. Изменение существующих столбцов

### 5.1 Изменение типа данных

#### Безопасный способ (с промежуточным столбцом)
```sql
-- 1. Добавить новый столбец с правильным типом
ALTER TABLE table_name
ADD COLUMN column_name_new new_data_type;

-- 2. Скопировать данные с преобразованием
UPDATE table_name
SET column_name_new = column_name::new_data_type;

-- 3. Проверить данные
SELECT column_name, column_name_new FROM table_name LIMIT 10;

-- 4. Переименовать столбцы
ALTER TABLE table_name RENAME COLUMN column_name TO column_name_old;
ALTER TABLE table_name RENAME COLUMN column_name_new TO column_name;

-- 5. Удалить старый столбец (позже, после тестирования)
ALTER TABLE table_name DROP COLUMN column_name_old;
```

#### Простое изменение типа (если совместимо)
```sql
-- Изменить тип, если PostgreSQL может преобразовать
ALTER TABLE table_name
ALTER COLUMN column_name TYPE new_data_type;
```

### 5.2 Добавление/изменение ограничений

#### Добавление NOT NULL
```sql
-- 1. Заполнить NULL значения
UPDATE table_name
SET column_name = default_value
WHERE column_name IS NULL;

-- 2. Добавить ограничение
ALTER TABLE table_name
ALTER COLUMN column_name SET NOT NULL;
```

#### Добавление CHECK constraint
```sql
ALTER TABLE masters
ADD CONSTRAINT check_rating_range
CHECK (rating >= 0 AND rating <= 5);
```

---

## 6. Работа с индексами

### 6.1 Добавление индексов

#### Простой индекс
```sql
CREATE INDEX idx_table_column ON table_name(column_name);
```

#### Составной индекс
```sql
CREATE INDEX idx_masters_status_rating ON masters(status, rating);
```

#### Частичный индекс
```sql
CREATE INDEX idx_active_masters ON masters(id)
WHERE status = 'active';
```

### 6.2 Удаление индексов
```sql
DROP INDEX IF EXISTS idx_table_column;
```

### 6.3 Полезные индексы для нашего проекта
```sql
-- Для поиска по статусу и рейтингу
CREATE INDEX idx_masters_status_rating ON masters(status, rating);

-- Для поиска мастеров по специализациям (в master_settings)
CREATE INDEX idx_master_settings_specs ON master_settings(spec_elektrik, spec_sanitaer, spec_heizung);

-- Для поиска по зоне обслуживания
CREATE INDEX idx_master_settings_area ON master_settings(service_area);

-- Для поиска по рабочим дням
CREATE INDEX idx_master_settings_work_days ON master_settings(work_mo, work_di, work_mi, work_do, work_fr);
```

---

## 7. Работа с внешними ключами

### 7.1 Добавление внешнего ключа
```sql
ALTER TABLE child_table
ADD CONSTRAINT fk_child_parent
FOREIGN KEY (parent_id) REFERENCES parent_table(id)
ON DELETE CASCADE;
```

### 7.2 Удаление внешнего ключа
```sql
ALTER TABLE child_table
DROP CONSTRAINT fk_child_parent;
```

### 7.3 Изменение поведения ON DELETE
```sql
-- Изменить с CASCADE на SET NULL
ALTER TABLE child_table
DROP CONSTRAINT fk_child_parent,
ADD CONSTRAINT fk_child_parent
FOREIGN KEY (parent_id) REFERENCES parent_table(id)
ON DELETE SET NULL;
```

---

## 8. Миграции в транзакциях

### 8.1 Безопасная миграция
```sql
BEGIN;

-- Шаг 1: Создать бэкап важных данных (опционально)
CREATE TABLE masters_backup AS
SELECT * FROM masters;

-- Шаг 2: Выполнить изменения
ALTER TABLE masters ADD COLUMN new_column text;

-- Шаг 3: Проверить изменения
SELECT column_name FROM information_schema.columns
WHERE table_name = 'masters' AND column_name = 'new_column';

-- Подтвердить или откатить
COMMIT;  -- или ROLLBACK;
```

### 8.2 Миграция с данными
```sql
BEGIN;

-- Добавить новый столбец
ALTER TABLE masters ADD COLUMN full_name text;

-- Заполнить данными
UPDATE masters
SET full_name = CONCAT(first_name, ' ', last_name);

-- Проверить
SELECT id, first_name, last_name, full_name FROM masters LIMIT 5;

COMMIT;
```

---

## 9. Проверка и валидация

### 9.1 Проверка структуры таблицы
```sql
-- Посмотреть все столбцы таблицы
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'masters'
ORDER BY ordinal_position;

-- Посмотреть индексы
SELECT * FROM pg_indexes WHERE tablename = 'masters';

-- Посмотреть ограничения
SELECT * FROM information_schema.table_constraints
WHERE table_name = 'masters';
```

### 9.2 Проверка данных
```sql
-- Проверить NULL значения в новом столбце
SELECT COUNT(*) as null_count
FROM masters
WHERE new_column IS NULL;

-- Проверить диапазон значений
SELECT MIN(column) as min_value, MAX(column) as max_value
FROM masters;
```

### 9.3 Проверка работы представлений
```sql
-- Проверить, что представления работают после изменений
SELECT * FROM view_master_details LIMIT 5;

-- Проверить производительность
EXPLAIN ANALYZE
SELECT * FROM masters WHERE status = 'active';
```

---

## 10. Откат изменений

### 10.1 Откат добавления столбца
```sql
ALTER TABLE table_name DROP COLUMN new_column;
```

### 10.2 Откат удаления столбца (если данные сохранены)
```sql
-- Добавить столбец обратно
ALTER TABLE table_name ADD COLUMN old_column old_data_type;

-- Восстановить данные из бэкапа
UPDATE table_name
SET old_column = backup_table.old_column
FROM backup_table
WHERE table_name.id = backup_table.id;
```

### 10.3 Использование бэкапов
```sql
-- Создать бэкап перед изменениями
CREATE TABLE masters_backup_20260113 AS
SELECT * FROM masters;

-- Восстановить при необходимости
INSERT INTO masters SELECT * FROM masters_backup_20260113
ON CONFLICT (id) DO UPDATE SET
    column1 = EXCLUDED.column1,
    column2 = EXCLUDED.column2;
```

---

## 11. Шаблоны миграций

### 11.1 Добавление новой специализации
```sql
BEGIN;

-- Добавить булевый столбец для новой специализации
ALTER TABLE master_settings
ADD COLUMN spec_new_type boolean DEFAULT false;

-- Добавить индекс для поиска
CREATE INDEX idx_master_settings_new_type ON master_settings(spec_new_type);

-- Обновить комментарий к таблице
COMMENT ON COLUMN master_settings.spec_new_type IS 'Новая специализация: описание';

COMMIT;
```

### 11.2 Добавление нового статуса мастера
```sql
BEGIN;

-- Добавить проверку в существующее ограничение CHECK
-- (PostgreSQL не позволяет модифицировать CHECK, поэтому создаем новый)

ALTER TABLE masters
DROP CONSTRAINT masters_status_check,
ADD CONSTRAINT masters_status_check
CHECK (status IN ('pending_approval', 'approved', 'active', 'suspended', 'blocked', 'new_status'));

COMMIT;
```

### 11.3 Добавление поля для геолокации
```sql
BEGIN;

-- Добавить географическое поле (требует PostGIS)
ALTER TABLE master_settings
ADD COLUMN current_location geography(Point, 4326);

-- Добавить индекс для геопоиска
CREATE INDEX idx_master_settings_location ON master_settings USING gist(current_location);

COMMIT;
```

---

## 12. Лучшие практики

### 12.1 Порядок действий
1. **Создать задачу** в таск-менеджере
2. **Проанализировать влияние** на существующий код
3. **Создать бэкап** данных
4. **Протестировать** на development среде
5. **Задокументировать** изменения
6. **Применить** на production с мониторингом

### 12.2 Безопасность
- Всегда работайте в транзакциях
- Тестируйте на копии production данных
- Имейте план отката
- Делайте изменения в нерабочее время

### 12.3 Мониторинг
- Следите за производительностью после изменений
- Мониторьте использование дискового пространства
- Проверяйте логи на ошибки

### 12.4 Документация
- Обновляйте `03_database_schema_mvp.md`
- Добавляйте комментарии к новым столбцам
- Ведите changelog изменений

---

## 13. Частые ошибки и их исправление

### 13.1 "Cannot drop column because it is referenced"
```sql
-- Найти зависимости
SELECT * FROM information_schema.view_column_usage
WHERE table_name = 'masters' AND column_name = 'column_name';

-- Удалить представление или изменить его
DROP VIEW dependent_view;
-- или
CREATE OR REPLACE VIEW dependent_view AS ... -- без проблемного столбца
```

### 13.2 "Column does not exist"
```sql
-- Проверить имя столбца
SELECT column_name FROM information_schema.columns
WHERE table_name = 'masters';
```

### 13.3 "Permission denied"
```sql
-- Проверить права пользователя
SELECT * FROM information_schema.role_table_grants
WHERE grantee = current_user AND table_name = 'masters';
```

---

## 14. Контакты и поддержка

- **Технический архитектор:** Artem Tihonov
- **Документация:** Всегда актуализируется в `mvp/` папке
- **Репозиторий:** https://github.com/artemtech007/v0-asset-care24-1

---

**Помните:** Любые изменения схемы БД - это **критические операции**. Всегда консультируйтесь с командой и тестируйте изменения перед применением на production!
