# Архитектура пользователей: Отдельные таблицы + Составные ID

**Дата:** 11 января 2026 г.
**Версия:** 1.0
**Статус:** Предложено (требует реализации)
**Ответственный:** AI Assistant

## 🎯 Обзор

Альтернативная архитектура базы данных AssetCare24 с отдельными таблицами для клиентов и мастеров, использующая составные идентификаторы для поддержки множественных ролей и каналов коммуникации.

## 🏗️ Принципы архитектуры

### Ключевые требования
- **Разделение сущностей:** Клиенты и мастера - разные бизнес-сущности
- **Множественные роли:** Один человек может быть и клиентом и мастером
- **Множественные каналы:** WhatsApp, Telegram, Web, Mobile App
- **Гибкость связей:** Возможность связывать профили (один человек, семья, компания)

### Основные решения
- **Отдельные таблицы:** `clients` и `masters` вместо единой `users`
- **Составные ID:** `{role}_{channel}_{identifier}` формат
- **Таблица связей:** `user_links` для соединения профилей

---

## 🆔 Система составных ID

### Формат идентификатора
```
{role_prefix}_{channel_prefix}_{normalized_identifier}
```

### Префиксы ролей
- **cid_** = Client ID (клиент)
- **mid_** = Master ID (мастер)
- **aid_** = Admin ID (администратор)

### Префиксы каналов
- **wa_** = WhatsApp
- **tg_** = Telegram
- **web_** = Web (email/форма)
- **app_** = Mobile App (device_id)

### Нормализация идентификаторов
```javascript
function normalizeIdentifier(identifier) {
  // Телефон: убираем + и пробелы
  if (identifier.startsWith('+')) {
    return identifier.substring(1).replace(/\s/g, '');
  }

  // Email: заменяем @ на _at_
  if (identifier.includes('@')) {
    return identifier.replace('@', '_at_').replace(/\./g, '_dot_');
  }

  // Telegram ID: как есть (числовой)
  if (/^\d+$/.test(identifier)) {
    return identifier;
  }

  // Device ID: как есть
  return identifier.replace(/[^a-zA-Z0-9]/g, '_');
}
```

### Примеры ID
```
cid_wa_491510416555        # Клиент через WhatsApp
mid_wa_491510416555        # Мастер через WhatsApp (тот же человек!)
cid_tg_123456789           # Клиент через Telegram
mid_web_user_at_email_dot_com  # Мастер зарегистрировался по email
cid_app_abc123def456       # Клиент через мобильное приложение
```

---

## 🗄️ Структура базы данных

### Таблица: clients
```sql
CREATE TABLE clients (
  id text PRIMARY KEY,                    -- cid_wa_491510416555
  phone text,                             -- Для поиска и группировки
  email text,
  full_name text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  category text,                          -- existing_client, new_client, unknown
  subcategory text,                       -- house_1, complex_a, ad_google, etc.
  source text,                            -- qr_code, advertisement, website, referral
  first_contact_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now(),
  meta_data jsonb DEFAULT '{}'::jsonb,    -- Дополнительные данные
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Индексы
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_category ON clients(category);
CREATE INDEX idx_clients_status ON clients(status);
```

### Таблица: masters
```sql
CREATE TABLE masters (
  id text PRIMARY KEY,                    -- mid_wa_491510416555
  phone text,
  email text,
  full_name text NOT NULL,
  status text DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'active', 'suspended', 'blocked')),
  rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  completed_jobs integer DEFAULT 0,
  specializations text[],                -- ['elektrik', 'sanitär', 'maler']
  working_hours jsonb,                   -- {"start": "08:00", "end": "18:00"}
  working_days text[],                   -- ['mo', 'di', 'mi', 'do', 'fr']
  service_area text,                     -- Текстовое описание зоны
  has_vehicle boolean DEFAULT false,
  experience_years integer,
  qualifications text,
  documents_verified boolean DEFAULT false,
  approval_date timestamptz,
  admin_comment text,
  last_activity_at timestamptz DEFAULT now(),
  meta_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Индексы
CREATE INDEX idx_masters_phone ON masters(phone);
CREATE INDEX idx_masters_status ON masters(status);
CREATE INDEX idx_masters_rating ON masters(rating);
CREATE INDEX idx_masters_specializations ON masters USING gin(specializations);
```

### Таблица: user_links (связи между профилями)
```sql
CREATE TABLE user_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text REFERENCES clients(id) ON DELETE CASCADE,
  master_id text REFERENCES masters(id) ON DELETE CASCADE,
  link_type text DEFAULT 'same_person' CHECK (link_type IN ('same_person', 'family_member', 'company_employee', 'related')),
  confidence numeric(3,2) DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1.0),
  linked_by text,                        -- Система, админ, пользователь
  linked_at timestamptz DEFAULT now(),
  notes text,                            -- Комментарии к связи
  UNIQUE(client_id, master_id)
);

-- Индексы
CREATE INDEX idx_user_links_client ON user_links(client_id);
CREATE INDEX idx_user_links_master ON user_links(master_id);
CREATE INDEX idx_user_links_confidence ON user_links(confidence);
```

### Таблица: admin_users (расширяемость)
```sql
CREATE TABLE admin_users (
  id text PRIMARY KEY,                    -- aid_web_admin_at_company_dot_com
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'support')),
  permissions jsonb DEFAULT '{}'::jsonb,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

---

## 🔄 Логика маршрутизации

### Основной принцип
1. **Входящее сообщение** → Определение канала и идентификатора
2. **Поиск профилей** → Во всех таблицах (clients, masters, admin_users)
3. **Применение бизнес-логики** → Определение активного профиля
4. **Маршрутизация** → В соответствующий workflow

### Алгоритм определения активного профиля
```javascript
function determineActiveProfile(phone, channel, message) {
  // 1. Ищем все профили по телефону
  const clientProfiles = findClientsByPhone(phone);
  const masterProfiles = findMastersByPhone(phone);

  // 2. Если есть активный мастер - приоритет ему
  const activeMaster = masterProfiles.find(m => m.status === 'active');
  if (activeMaster) {
    return { type: 'master', profile: activeMaster };
  }

  // 3. Иначе ищем активного клиента
  const activeClient = clientProfiles.find(c => c.status === 'active');
  if (activeClient) {
    return { type: 'client', profile: activeClient };
  }

  // 4. Если профилей нет - новый контакт
  if (clientProfiles.length === 0 && masterProfiles.length === 0) {
    return { type: 'new_contact', profile: null };
  }

  // 5. Если есть профили, но неактивные - спросить уточнение
  return { type: 'clarification_needed', profiles: { clients: clientProfiles, masters: masterProfiles } };
}
```

### Примеры сценариев

#### Сценарий 1: Новый клиент с QR-кода
```
Входящее: "house_1_request" от +491510416555
Действие: Создать cid_wa_491510416555, category="existing_client"
Результат: Обработка как клиент дома №1
```

#### Сценарий 2: Мастер пишет в рабочее время
```
Входящее: "Готов работать" от +491510416555
Действие: Найден mid_wa_491510416555 со статусом 'active'
Результат: Обработка как мастер
```

#### Сценарий 3: Один человек - и клиент и мастер
```
Входящее: "Нужен ремонт" от +491510416555
Действие: Найдены оба профиля, мастер активен
Результат: Обработка как мастер (приоритет)
```

#### Сценарий 4: Неоднозначная ситуация
```
Входящее: "Привет" от +491510416555
Действие: Найдены профили клиента и мастера (оба неактивны)
Результат: Запрос уточнения "Вы пишете как клиент или мастер?"
```

---

## 🔗 Управление связями

### Автоматическое связывание
```sql
-- При регистрации мастера проверяем, есть ли клиент с таким же телефоном
INSERT INTO user_links (client_id, master_id, link_type, confidence, linked_by)
SELECT
  c.id, $new_master_id, 'same_person', 0.9, 'system'
FROM clients c
WHERE c.phone = $phone AND c.status = 'active';
```

### Ручное связывание (админ)
- В админке: просмотр потенциальных связей
- Confidence score: 1.0 = точно один человек, 0.5 = вероятно
- Типы связей: same_person, family_member, company_employee

### Разрыв связей
- При блокировке профиля
- По запросу пользователя
- При обнаружении ошибки

---

## 📊 Аналитика и отчетность

### Метрики по профилям
```sql
-- Общая статистика
SELECT
  'clients' as type, COUNT(*) as count, AVG(EXTRACT(EPOCH FROM (now() - created_at))/86400) as avg_age_days
FROM clients
UNION ALL
SELECT
  'masters' as type, COUNT(*) as count, AVG(EXTRACT(EPOCH FROM (now() - created_at))/86400) as avg_age_days
FROM masters
UNION ALL
SELECT
  'links' as type, COUNT(*) as count, AVG(confidence) as avg_confidence
FROM user_links;
```

### Конверсия клиент → мастер
```sql
SELECT
  COUNT(DISTINCT ul.client_id) as converted_clients,
  COUNT(DISTINCT c.id) as total_clients,
  ROUND(COUNT(DISTINCT ul.client_id)::numeric / COUNT(DISTINCT c.id) * 100, 2) as conversion_rate
FROM clients c
LEFT JOIN user_links ul ON c.id = ul.client_id;
```

---

## 🔄 Миграция с текущей архитектуры

### Текущая структура (users)
```sql
users {
  id uuid,
  role text,  -- 'client' | 'master'
  phone text,
  email text,
  full_name text,
  status text,
  meta_data jsonb
}
```

### План миграции
```sql
-- Шаг 1: Создание новых таблиц
-- (clients, masters, user_links, admin_users)

-- Шаг 2: Миграция клиентов
INSERT INTO clients (
  id, phone, email, full_name, status, category, meta_data, created_at
)
SELECT
  CONCAT('cid_wa_', REPLACE(REPLACE(phone, '+', ''), ' ', '')),
  phone, email, full_name, status,
  meta_data->>'client_category',
  meta_data,
  created_at
FROM users WHERE role = 'client';

-- Шаг 3: Миграция мастеров
INSERT INTO masters (
  id, phone, email, full_name, status, meta_data, created_at
)
SELECT
  CONCAT('mid_wa_', REPLACE(REPLACE(phone, '+', ''), ' ', '')),
  phone, email, full_name, status, meta_data, created_at
FROM users WHERE role = 'master';

-- Шаг 4: Создание связей для пользователей с двойными ролями
-- (пока пропустим, создадим отдельный скрипт)

-- Шаг 5: Тестирование
-- (параллельная работа старой и новой систем)

-- Шаг 6: Переключение
-- (обновление всех workflow и интерфейсов)
```

---

## ⚠️ Важные замечания

### Требует реализации
- **Эта архитектура еще НЕ РЕАЛИЗОВАНА**
- **Текущая система работает на старой архитектуре** (`users` таблица)
- **Миграция потребует тщательного тестирования**
- **Все workflow нужно переписать**

### Риски и сложности
- **Сложность запросов:** Нужно искать в нескольких таблицах
- **Дублирование данных:** Имя, телефон, email в разных таблицах
- **Синхронизация:** Обновление данных в связанных профилях
- **Производительность:** Дополнительные JOIN для связей

### Преимущества
- **Четкое разделение:** Клиентская и мастерская логика полностью разделены
- **Гибкость:** Легко добавлять новые каналы и роли
- **Масштабируемость:** Разные команды могут развивать клиентскую/мастерскую части независимо
- **Аналитика:** Четкая сегментация по ролям

---

## 🎯 Следующие шаги

1. **Анализ текущих workflow** - оценка сложности переписывания
2. **Прототип миграции** - тестовый перенос части данных
3. **Обновление документации** - описание новых структур
4. **План внедрения** - поэтапный переход
5. **Риски и откат** - план возврата к старой архитектуре

---

## ❓ Открытые вопросы

1. **Объем миграции:** Сколько пользователей нужно перенести?
2. **Тестирование:** Как тестировать без остановки текущей системы?
3. **Резервная копия:** Как обеспечить возможность отката?
4. **Временная совместимость:** Поддерживать старую систему во время перехода?

**Эта архитектура дает отличную базу для роста, но требует тщательного планирования внедрения.**
