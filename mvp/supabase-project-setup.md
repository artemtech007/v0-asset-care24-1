# 🗄️ Настройка Supabase проекта для AssetCare24

## 📋 Обзор
Этот документ содержит инструкции по созданию и настройке Supabase проекта для админской панели AssetCare24.

## 🎯 Что нужно сделать

### 1. Создать Supabase проект
### 2. Настроить переменные окружения
### 3. Инициализировать базу данных
### 4. Создать необходимые views
### 5. Протестировать подключение

---

## 🚀 Пошаговая инструкция

### Шаг 1: Создание Supabase проекта

#### 1.1 Перейти на Supabase
```
https://supabase.com/dashboard
```

#### 1.2 Создать новый проект
```
1. Нажать "New Project"
2. Organization: Выбрать вашу организацию
3. Name: AssetCare24-Admin
4. Database Password: Придумать надежный пароль
5. Region: EU West (London) или ближайший регион
6. Pricing Plan: Free (для начала)
```

#### 1.3 Подождать создания проекта
```
⏱️ Процесс занимает 2-3 минуты
```

### Шаг 2: Получение API ключей

#### 2.1 Перейти в Settings → API
```
Project URL: https://abcdefghijklmnop.supabase.co
```

#### 2.2 Скопировать ключи
```bash
# Project URL
https://abcdefghijklmnop.supabase.co

# API Keys
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Шаг 3: Настройка переменных окружения

#### 3.1 Создать файл `.env.local`
```bash
cd site
touch .env.local
```

#### 3.2 Добавить переменные
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Шаг 4: Инициализация базы данных

#### 4.1 Перейти в Supabase SQL Editor
```
Dashboard → SQL Editor
```

#### 4.2 Выполнить SQL скрипт
```sql
-- Скопировать содержимое файла init_database_v2.3.sql
-- Вставить в SQL Editor и выполнить
```

#### 4.3 Проверить создание таблиц
```sql
-- В Dashboard → Table Editor проверить наличие таблиц:
-- clients, masters, requests, client_addresses,
-- reviews, processed_messages, admin_users, etc.
```

### Шаг 5: Создание Views для админки

#### 5.1 Создать view_all_users
```sql
-- В SQL Editor выполнить:
CREATE OR REPLACE VIEW view_all_users AS
SELECT
    'client' as user_type,
    id, first_name, last_name, email, phone, status,
    created_at as registered_at, last_activity_at as last_active,
    wa_verified as verified, email_verified, phone_verified,
    COALESCE((SELECT COUNT(*) FROM requests WHERE client_id = c.id), 0) as orders_count,
    NULL as rating
FROM clients c

UNION ALL

SELECT
    'master' as user_type,
    id, first_name, last_name, email, phone, status,
    created_at as registered_at, last_activity_at as last_active,
    wa_verified as verified, email_verified, phone_verified,
    completed_jobs as orders_count,
    rating
FROM masters m;
```

#### 5.2 Создать view_dispatcher_dashboard
```sql
-- Из файла 03_database_schema_mvp.md, раздел Views
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
```

### Шаг 6: Настройка Row Level Security (RLS)

#### 6.1 Включить RLS для таблиц
```sql
-- Для админских таблиц (если нужны ограничения)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Создать политику для admin доступа
CREATE POLICY "Admin full access" ON clients
FOR ALL USING (auth.role() = 'admin');

CREATE POLICY "Admin full access" ON masters
FOR ALL USING (auth.role() = 'admin');

CREATE POLICY "Admin full access" ON requests
FOR ALL USING (auth.role() = 'admin');
```

### Шаг 7: Тестирование подключения

#### 7.1 Перезапустить dev сервер
```bash
cd site
npm run dev
```

#### 7.2 Проверить API endpoints
```bash
# Тест пользователей
curl "http://localhost:3000/api/admin/users?limit=1"

# Тест заказов
curl "http://localhost:3000/api/admin/orders?limit=1"

# Тест статистики
curl "http://localhost:3000/api/admin/stats"
```

#### 7.3 Проверить админку
```
http://localhost:3000/dashboard/admin
```

---

## 🔧 Быстрый старт (для тестирования)

Если нужно быстро протестировать без создания реального проекта:

### Вариант 1: Использовать Supabase CLI
```bash
# Установить Supabase CLI
npm install -g supabase

# Инициализировать проект
supabase init

# Запустить локально
supabase start

# Создать таблицы из SQL скриптов
supabase db reset
```

### Вариант 2: Тестовые данные
Если подключение не работает, админка автоматически переключается на демо-данные для разработки.

---

## 🚨 Troubleshooting

### Ошибка: "Missing Supabase environment variables"
```
✅ Решение: Проверить .env.local файл
✅ Проверить корректность URL и ключей
✅ Перезапустить dev сервер
```

### Ошибка: "Table does not exist"
```
✅ Решение: Выполнить SQL скрипт инициализации
✅ Проверить в Supabase Dashboard → Table Editor
```

### Ошибка: "RLS policy violation"
```
✅ Решение: Отключить RLS для тестирования
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
```

---

## 📞 Поддержка

Если возникнут проблемы:
1. Проверить логи сервера разработки
2. Проверить Supabase Dashboard
3. Проверить корректность SQL скриптов

**Готово к настройке Supabase проекта! 🚀**
