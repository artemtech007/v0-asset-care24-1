# Схема Базы Данных MVP (Supabase / PostgreSQL) v2.0

**Цель:** Архитектура с разделенными таблицами для клиентов и мастеров, поддержка множественных ролей и каналов коммуникации.

## 1. Основные Таблицы (Tables)

### 1.1 `clients` (Клиенты)
Таблица для всех клиентских профилей с составными ID.

| Column | Type | Constraints | Описание |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | Составной ID: `cid_{channel}_{identifier}` (cid_wa_491510416555) |
| `phone` | text | | Номер телефона для связи |
| `email` | text | | Email адрес |
| `whatsapp_id` | text | | Технический ID в WhatsApp/Twilio |
| `telegram_id` | text | | ID пользователя в Telegram |
| `first_name` | text | NOT NULL | Имя клиента |
| `last_name` | text | NOT NULL | Фамилия клиента |
| `status` | text | default 'active' | Статус: `active`, `inactive`, `blocked` |
| `category` | text | | Категория: `existing_client`, `new_client`, `unknown` |
| `subcategory` | text | | Подкатегория: `house_1`, `complex_a`, `ad_google` и т.д. |
| `source` | text | | Источник привлечения: `qr_code`, `advertisement`, `website`, `referral` |
| `first_contact_at` | timestamptz | default `now()` | Дата первого контакта |
| `last_activity_at` | timestamptz | default `now()` | Последняя активность |
| `meta_data` | jsonb | default '{}' | Дополнительные данные (адреса, предпочтения) |
| `created_at` | timestamptz | default `now()` | Дата создания профиля |
| `updated_at` | timestamptz | default `now()` | Дата последнего обновления |

### 1.2 `masters` (Мастера)
Таблица для всех мастерских профилей с составными ID.

| Column | Type | Constraints | Описание |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | Составной ID: `mid_{channel}_{identifier}` (mid_wa_491510416555) |
| `phone` | text | | Номер телефона для связи |
| `email` | text | | Email для уведомлений |
| `whatsapp_id` | text | | Технический ID в WhatsApp/Twilio |
| `telegram_id` | text | | ID пользователя в Telegram |
| `first_name` | text | NOT NULL | Имя мастера |
| `last_name` | text | NOT NULL | Фамилия мастера |
| `status` | text | default 'pending_approval' | Статус: `pending_approval`, `approved`, `active`, `suspended`, `blocked` |
| `rating` | numeric(3,2) | default 0 | Рейтинг от 0 до 5 |
| `completed_jobs` | integer | default 0 | Количество выполненных работ |
| `specializations` | text[] | | Массив специализаций: ['elektrik', 'sanitär', 'maler'] |
| `working_hours` | jsonb | | График работы: {"start": "08:00", "end": "18:00"} |
| `working_days` | text[] | | Рабочие дни: ['mo', 'di', 'mi', 'do', 'fr'] |
| `service_area` | text | | Зона обслуживания (текст) |
| `has_vehicle` | boolean | default false | Наличие транспорта |
| `experience_years` | integer | | Стаж работы в годах |
| `qualifications` | text | | Квалификация и сертификаты |
| `documents_verified` | boolean | default false | Документы проверены |
| `approval_date` | timestamptz | | Дата одобрения администратором |
| `admin_comment` | text | | Комментарий администратора |
| `last_activity_at` | timestamptz | default `now()` | Последняя активность |
| `meta_data` | jsonb | default '{}' | Дополнительные данные |
| `created_at` | timestamptz | default `now()` | Дата создания профиля |
| `updated_at` | timestamptz | default `now()` | Дата последнего обновления |

### 1.3 `user_links` (Связи между профилями)
Таблица для связывания клиентских и мастерских профилей одного человека.

| Column | Type | Constraints | Описание |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PK, default `gen_random_uuid()` | Уникальный ID связи |
| `client_id` | text | FK -> `clients.id` | ID клиентского профиля |
| `master_id` | text | FK -> `masters.id` | ID мастерского профиля |
| `link_type` | text | default 'same_person' | Тип связи: `same_person`, `family_member`, `company_employee`, `related` |
| `confidence` | numeric(3,2) | default 1.0 | Уверенность в связи (0-1) |
| `linked_by` | text | | Кто создал связь: `system`, `admin`, `user` |
| `linked_at` | timestamptz | default `now()` | Дата создания связи |
| `notes` | text | | Комментарии к связи |

### 1.4 `admin_users` (Администраторы)
Таблица для администраторов системы.

| Column | Type | Constraints | Описание |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | Составной ID: `aid_{channel}_{identifier}` |
| `phone` | text | | Номер телефона для связи |
| `email` | text | UNIQUE NOT NULL | Email администратора |
| `whatsapp_id` | text | | Технический ID в WhatsApp/Twilio |
| `telegram_id` | text | | ID пользователя в Telegram |
| `first_name` | text | NOT NULL | Имя администратора |
| `last_name` | text | NOT NULL | Фамилия администратора |
| `role` | text | default 'admin' | Роль: `admin`, `manager`, `support` |
| `permissions` | jsonb | default '{}' | Права доступа |
| `last_login_at` | timestamptz | | Последний вход |
| `created_at` | timestamptz | default `now()` | Дата создания |

### 1.5 `client_addresses` (Адреса клиентов)
Замена user_addresses - теперь только для клиентов.

| Column | Type | Constraints | Описание |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PK, default `gen_random_uuid()` | ID адреса |
| `client_id` | text | FK -> `clients.id` | Владелец адреса |
| `name` | text | | Название метки (напр. "Дом", "Офис") |
| `postal_code` | text | | Почтовый индекс (ZIP) |
| `address_text` | text | NOT NULL | Полный текстовый адрес |
| `location` | geography | | GPS координаты (Point) |
| `is_default` | boolean | default false | Адрес по умолчанию |
| `created_at` | timestamptz | default `now()` | Дата создания |

### 1.6 `requests` (Заявки)
Ядро системы - связь клиентов и мастеров. Поддержка разделения на дочерние заявки.

| Column | Type | Constraints | Описание |
| :--- | :--- | :--- | :--- |
| `id` | bigint | PK, GENERATED BY DEFAULT AS IDENTITY | Номер заявки (напр. 101, 101-1, 101-2) |
| `parent_request_id` | bigint | FK -> `requests.id` (nullable) | ID основной заявки (NULL для основных заявок) |
| `client_id` | text | FK -> `clients.id` | Кто создал заявку (Клиент) |
| `address_id` | uuid | FK -> `client_addresses.id` | Ссылка на объект клиента |
| `address_snapshot` | text | NOT NULL | Копия адреса для истории |
| `postal_code` | text | | ZIP-код места выполнения |
| `master_id` | text | FK -> `masters.id` (nullable) | Кто выполняет (Мастер) |
| `status` | text | default 'new' | Статус: `new`, `assigned`, `in_progress`, `completed`, `canceled` |
| `category` | text | | Категория проблемы (Сантехника, Электрика) |
| `description` | text | | Текст описания проблемы |
| `urgency` | text | default 'normal' | Срочность: `low`, `normal`, `high`, `urgent` |
| `admin_comment` | text | | Внутренние заметки администратора |
| `assigned_at` | timestamptz | | Дата назначения мастера |
| `started_at` | timestamptz | | Дата начала работ |
| `created_at` | timestamptz | default `now()` | Время создания заявки |
| `completed_at` | timestamptz | | Время завершения |

### 1.7 `request_media` (Медиа файлы)
Связка файлов (в MinIO) с заявками.

| Column | Type | Constraints | Описание |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PK, default `gen_random_uuid()` | ID записи |
| `request_id` | bigint | FK -> `requests.id` | К какой заявке относится |
| `uploaded_by` | text | FK -> `clients.id` OR `masters.id` | Кто загрузил (клиент или мастер) |
| `type` | text | | Тип: `problem_photo`, `problem_audio`, `before_photo`, `after_photo`, `receipt` |
| `bucket_path` | text | NOT NULL | Путь в MinIO: `requests/101/problem.jpg` |
| `public_url` | text | | Публичная ссылка для доступа |
| `file_name` | text | | Оригинальное имя файла |
| `file_size` | integer | | Размер файла в байтах |
| `mime_type` | text | | MIME тип файла |
| `created_at` | timestamptz | default `now()` | Дата загрузки |

### 1.8 `client_status` (Статусы клиентов)
Машина состояний для диалогов с клиентами.

| Column | Type | Constraints | Описание |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PK, default `gen_random_uuid()` | ID статуса |
| `client_id` | text | FK -> `clients.id` | Клиент |
| `session_id` | uuid | default `gen_random_uuid()` | ID сессии диалога |
| `current_state` | text | NOT NULL | Текущее состояние бота: `start`, `waiting_address`, `waiting_category`, `request_created`, `feedback_pending` |
| `state_data` | jsonb | default '{}' | Данные состояния (временные данные диалога) |
| `last_message_at` | timestamptz | default `now()` | Последнее сообщение |
| `is_active` | boolean | default true | Активная ли сессия |
| `created_at` | timestamptz | default `now()` | Дата создания сессии |
| `updated_at` | timestamptz | default `now()` | Дата обновления |

### 1.9 `master_status` (Статусы мастеров)
Машина состояний для диалогов с мастерами.

| Column | Type | Constraints | Описание |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PK, default `gen_random_uuid()` | ID статуса |
| `master_id` | text | FK -> `masters.id` | Мастер |
| `session_id` | uuid | default `gen_random_uuid()` | ID сессии диалога |
| `current_state` | text | NOT NULL | Текущее состояние: `start`, `waiting_acceptance`, `job_started`, `job_completed`, `feedback_given` |
| `state_data` | jsonb | default '{}' | Данные состояния (активные заявки, временные данные) |
| `last_message_at` | timestamptz | default `now()` | Последнее сообщение |
| `is_active` | boolean | default true | Активная ли сессия |
| `current_location` | geography | | Последнее известное местоположение (Point) |
| `is_on_shift` | boolean | default false | На смене ли мастер |
| `created_at` | timestamptz | default `now()` | Дата создания сессии |
| `updated_at` | timestamptz | default `now()` | Дата обновления |

### 1.10 `reviews` (Отзывы клиентов)
Оценки качества работы мастеров.

| Column | Type | Constraints | Описание |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PK, default `gen_random_uuid()` | ID отзыва |
| `request_id` | bigint | FK -> `requests.id` | Заявка |
| `client_id` | text | FK -> `clients.id` | Кто оставил отзыв |
| `master_id` | text | FK -> `masters.id` | Кому отзыв |
| `rating` | integer | CHECK (rating >= 1 AND rating <= 5) | Оценка от 1 до 5 |
| `comment` | text | | Текст отзыва |
| `response_from_master` | text | | Ответ мастера (опционально) |
| `is_public` | boolean | default true | Публиковать ли отзыв |
| `created_at` | timestamptz | default `now()` | Дата создания |
| `updated_at` | timestamptz | default `now()` | Дата обновления |

---

## 2. Представления (Views) для Админки

### 2.1 `view_dispatcher_dashboard`
Дашборд диспетчера с информацией о заявках.

```sql
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

### 2.2 `view_master_performance`
Статистика работы мастеров.

```sql
CREATE OR REPLACE VIEW view_master_performance AS
SELECT
    m.id as master_id,
    CONCAT(m.first_name, ' ', m.last_name) as full_name,
    m.phone,
    m.status,
    m.rating,
    m.completed_jobs,
    COUNT(r.id) as total_requests,
    COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_requests,
    COUNT(CASE WHEN r.status = 'in_progress' THEN 1 END) as active_requests,
    AVG(rv.rating) as avg_client_rating,
    MAX(r.completed_at) as last_completed_job
FROM masters m
LEFT JOIN requests r ON m.id = r.master_id
LEFT JOIN reviews rv ON r.id = rv.request_id
GROUP BY m.id, m.full_name, m.phone, m.status, m.rating, m.completed_jobs;
```

### 2.3 `view_client_history`
История взаимодействия с клиентами.

```sql
CREATE OR REPLACE VIEW view_client_history AS
SELECT
    c.id as client_id,
    CONCAT(c.first_name, ' ', c.last_name) as full_name,
    c.phone,
    c.category,
    c.subcategory,
    COUNT(r.id) as total_requests,
    COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_requests,
    MAX(r.created_at) as last_request_date,
    AVG(rv.rating) as avg_rating_given
FROM clients c
LEFT JOIN requests r ON c.id = r.client_id
LEFT JOIN reviews rv ON r.id = rv.request_id
GROUP BY c.id, c.full_name, c.phone, c.category, c.subcategory;
```

---

## 3. SQL скрипт инициализации (Init Script)

**Внимание:** Этот скрипт пересоздает всю базу данных. Выполнять только на пустой БД!

```sql
-- =====================================================
-- AssetCare24 MVP Database Schema v2.0
-- Separate tables for clients and masters
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CLIENTS TABLE (Составные ID как PK)
-- =====================================================
CREATE TABLE public.clients (
    id text PRIMARY KEY,                    -- cid_wa_491510416555, cid_tg_123456789
    phone text,
    email text,
    whatsapp_id text,                       -- Технический ID WhatsApp
    telegram_id text,                       -- ID в Telegram
    first_name text NOT NULL,
    last_name text NOT NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    category text CHECK (category IN ('existing_client', 'new_client', 'unknown')),
    subcategory text,                       -- house_1, complex_a, ad_google
    source text,                            -- qr_code, advertisement, website
    first_contact_at timestamptz DEFAULT now(),
    last_activity_at timestamptz DEFAULT now(),
    meta_data jsonb DEFAULT '{}'::jsonb,    -- Доп. данные (адреса, предпочтения)
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. MASTERS TABLE (Составные ID как PK)
-- =====================================================
CREATE TABLE public.masters (
    id text PRIMARY KEY,                    -- mid_wa_491510416556, mid_web_user@email
    phone text,
    email text,
    whatsapp_id text,                       -- Технический ID WhatsApp
    telegram_id text,                       -- ID в Telegram
    first_name text NOT NULL,
    last_name text NOT NULL,
    status text DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'active', 'suspended', 'blocked')),
    rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    completed_jobs integer DEFAULT 0,
    specializations text[],                 -- ['elektrik', 'sanitär', 'maler']
    working_hours jsonb,                    -- {"start": "08:00", "end": "18:00"}
    working_days text[],                   -- ['mo', 'di', 'mi', 'do', 'fr']
    service_area text,                     -- Текстовое описание зоны
    has_vehicle boolean DEFAULT false,
    experience_years integer,
    qualifications text,
    documents_verified boolean DEFAULT false,
    approval_date timestamptz,
    admin_comment text,
    last_activity_at timestamptz DEFAULT now(),
    meta_data jsonb DEFAULT '{}'::jsonb,    -- Доп. данные (график, зоны)
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 3. USER LINKS TABLE (connections between profiles)
-- =====================================================
CREATE TABLE public.user_links (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id text REFERENCES public.clients(id) ON DELETE CASCADE,
    master_id text REFERENCES public.masters(id) ON DELETE CASCADE,
    link_type text DEFAULT 'same_person' CHECK (link_type IN ('same_person', 'family_member', 'company_employee', 'related')),
    confidence numeric(3,2) DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1.0),
    linked_by text DEFAULT 'system',
    linked_at timestamptz DEFAULT now(),
    notes text,
    UNIQUE(client_id, master_id)
);

-- =====================================================
-- 4. ADMIN USERS TABLE (Составные ID как PK)
-- =====================================================
CREATE TABLE public.admin_users (
    id text PRIMARY KEY,                    -- aid_web_admin@company.com, aid_wa_491510416557
    phone text,
    email text UNIQUE NOT NULL,
    whatsapp_id text,                       -- Технический ID WhatsApp
    telegram_id text,                       -- ID в Telegram
    first_name text NOT NULL,
    last_name text NOT NULL,
    role text DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'support')),
    permissions jsonb DEFAULT '{}'::jsonb,  -- Права доступа
    last_login_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 5. CLIENT ADDRESSES TABLE
-- =====================================================
CREATE TABLE public.client_addresses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id text REFERENCES public.clients(id) ON DELETE CASCADE,
    name text,
    postal_code text,
    address_text text NOT NULL,
    location geography,
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 6. REQUESTS TABLE
-- =====================================================
CREATE TABLE public.requests (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    parent_request_id bigint REFERENCES public.requests(id) ON DELETE SET NULL,
    client_id text REFERENCES public.clients(id) ON DELETE SET NULL,
    address_id uuid REFERENCES public.client_addresses(id) ON DELETE SET NULL,
    address_snapshot text NOT NULL,
    postal_code text,
    master_id text REFERENCES public.masters(id) ON DELETE SET NULL,
    status text DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'in_progress', 'completed', 'canceled')),
    category text,
    description text,
    urgency text DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
    admin_comment text,
    assigned_at timestamptz,
    started_at timestamptz,
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- =====================================================
-- 7. REQUEST MEDIA TABLE
-- =====================================================
CREATE TABLE public.request_media (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id bigint REFERENCES public.requests(id) ON DELETE CASCADE,
    uploaded_by text,  -- Can reference clients.id or masters.id
    type text CHECK (type IN ('problem_photo', 'problem_audio', 'before_photo', 'after_photo', 'receipt')),
    bucket_path text NOT NULL,
    public_url text,
    file_name text,
    file_size integer,
    mime_type text,
    created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 8. CLIENT STATUS TABLE (State Machine for Clients)
-- =====================================================
CREATE TABLE public.client_status (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id text REFERENCES public.clients(id) ON DELETE CASCADE,
    session_id uuid DEFAULT gen_random_uuid(),
    current_state text NOT NULL CHECK (current_state IN ('start', 'waiting_address', 'waiting_category', 'request_created', 'feedback_pending', 'completed')),
    state_data jsonb DEFAULT '{}'::jsonb,
    last_message_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 9. MASTER STATUS TABLE (State Machine for Masters)
-- =====================================================
CREATE TABLE public.master_status (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    master_id text REFERENCES public.masters(id) ON DELETE CASCADE,
    session_id uuid DEFAULT gen_random_uuid(),
    current_state text NOT NULL CHECK (current_state IN ('start', 'waiting_acceptance', 'job_started', 'job_completed', 'feedback_given', 'idle')),
    state_data jsonb DEFAULT '{}'::jsonb,
    last_message_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    current_location geography,
    is_on_shift boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 10. REVIEWS TABLE
-- =====================================================
CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id bigint REFERENCES public.requests(id) ON DELETE CASCADE,
    client_id text REFERENCES public.clients(id) ON DELETE CASCADE,
    master_id text REFERENCES public.masters(id) ON DELETE CASCADE,
    rating integer CHECK (rating >= 1 AND rating <= 5),
    comment text,
    response_from_master text,
    is_public boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES for performance
-- =====================================================

-- Clients indexes
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_category ON clients(category);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_last_activity ON clients(last_activity_at);

-- Masters indexes
CREATE INDEX idx_masters_phone ON masters(phone);
CREATE INDEX idx_masters_status ON masters(status);
CREATE INDEX idx_masters_rating ON masters(rating);
CREATE INDEX idx_masters_specializations ON masters USING gin(specializations);
CREATE INDEX idx_masters_last_activity ON masters(last_activity_at);

-- User links indexes
CREATE INDEX idx_user_links_client ON user_links(client_id);
CREATE INDEX idx_user_links_master ON user_links(master_id);
CREATE INDEX idx_user_links_confidence ON user_links(confidence);

-- Client addresses indexes
CREATE INDEX idx_client_addresses_client ON client_addresses(client_id);
CREATE INDEX idx_client_addresses_postal_code ON client_addresses(postal_code);

-- Requests indexes
CREATE INDEX idx_requests_client ON requests(client_id);
CREATE INDEX idx_requests_master ON requests(master_id);
CREATE INDEX idx_requests_parent ON requests(parent_request_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_created_at ON requests(created_at);
CREATE INDEX idx_requests_urgency_status ON requests(urgency, status);

-- Request media indexes
CREATE INDEX idx_request_media_request ON request_media(request_id);
CREATE INDEX idx_request_media_type ON request_media(type);

-- Client status indexes
CREATE INDEX idx_client_status_client ON client_status(client_id);
CREATE INDEX idx_client_status_session ON client_status(session_id);
CREATE INDEX idx_client_status_state ON client_status(current_state);
CREATE INDEX idx_client_status_active ON client_status(is_active);
CREATE INDEX idx_client_status_last_message ON client_status(last_message_at);

-- Master status indexes
CREATE INDEX idx_master_status_master ON master_status(master_id);
CREATE INDEX idx_master_status_session ON master_status(session_id);
CREATE INDEX idx_master_status_state ON master_status(current_state);
CREATE INDEX idx_master_status_active ON master_status(is_active);
CREATE INDEX idx_master_status_shift ON master_status(is_on_shift);
CREATE INDEX idx_master_status_last_message ON master_status(last_message_at);

-- Reviews indexes
CREATE INDEX idx_reviews_request ON reviews(request_id);
CREATE INDEX idx_reviews_client ON reviews(client_id);
CREATE INDEX idx_reviews_master ON reviews(master_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - for Supabase
-- =====================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- BASIC RLS POLICIES (to be expanded)
-- =====================================================

-- Allow admins to read all clients
CREATE POLICY "Admins can read all clients" ON public.clients
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND role IN ('admin', 'manager')
    )
);

-- Allow masters to read their own profile
CREATE POLICY "Masters can read own profile" ON public.masters
FOR SELECT USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Similar policies needed for other tables...
-- (Detailed RLS policies to be defined based on security requirements)

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

-- Sample admin user
INSERT INTO public.admin_users (id, email, whatsapp_id, first_name, last_name, role)
VALUES ('aid_web_admin_at_assetcare_dot_org', 'admin@assetcare.org', 'whatsapp_admin_789', 'System', 'Admin', 'admin');

-- Sample client status (новая сессия)
INSERT INTO public.client_status (client_id, current_state, state_data)
VALUES ('cid_wa_491510416555', 'start', '{"last_action": "greeting_sent"}'::jsonb);

-- Sample master status (активный мастер)
INSERT INTO public.master_status (master_id, current_state, is_on_shift, state_data)
VALUES ('mid_wa_491510416556', 'idle', true, '{"available_for_jobs": true}'::jsonb);

-- Sample client
INSERT INTO public.clients (id, phone, whatsapp_id, first_name, last_name, category, subcategory, source)
VALUES ('cid_wa_491510416555', '+491510416555', 'whatsapp_user_123', 'Иван', 'Петров', 'existing_client', 'house_1', 'qr_code');

-- Sample master
INSERT INTO public.masters (id, phone, whatsapp_id, first_name, last_name, status, specializations)
VALUES ('mid_wa_491510416556', '+491510416556', 'whatsapp_master_456', 'Алексей', 'Мастеров', 'active', ARRAY['elektrik', 'sanitär']);

-- =====================================================
-- END OF SCHEMA
-- =====================================================
```
