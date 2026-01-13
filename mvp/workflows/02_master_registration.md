# n8n Workflow 2: Регистрация Мастеров (Master Registration)

**Назначение:** Обработка регистрации новых мастеров через веб-форму. Создает профиль мастера, инициализирует хранилище и отправляет подтверждение.

**Триггер:** Webhook POST от веб-формы регистрации мастеров.

---

## Общая архитектура workflow

### Цель MVP
Обеспечить быструю регистрацию мастеров через WhatsApp с минимальным набором обязательных данных, достаточным для начала работы в системе.

### Основные отличия от веб-регистрации
- **Канал:** WhatsApp вместо веб-формы
- **Процесс:** Пошаговый диалог вместо единой формы
- **Данные:** Минимальный набор для старта (имя, телефон, специализации)
- **Валидация:** Ручная проверка администратором

---

## Структура Workflow

### 1. Webhook (Trigger)
**Method:** `POST`
**Path:** `/webhook/whatsapp/master-registration`
**Authentication:** Basic Auth (рекомендуется)

**Входные данные от Twilio:**
```json
{
  "From": "+491510416555",
  "Body": "Хочу зарегистрироваться как мастер",
  "MessageSid": "SM123456789",
  "MediaUrl0": "https://api.twilio.com/..."
}
```

### 2. Code Node (Обработка входящих данных)
**Назначение:** Обработать входящий JSON из веб-формы, разобрать timestamp, нормализовать WhatsApp номер и создать дополнительные переменные.

**Файл с кодом:** [`02_master_registration_code.js`](./02_master_registration_code.js)

**Использование:**
- В n8n Code Node нажмите "Load from File"
- Выберите файл: `02_master_registration_code.js`
- Или скопируйте содержимое файла в поле Code

**Input:** JSON от webhook с данными формы регистрации:
```json
[
  {
    "headers": {...},
    "params": {},
    "query": {},
    "body": {
      "vorname": "Alex",
      "nachname": "Hanssen",
      "email": "ahans@gmail.com",
      "whatsapp": "+49123456789",
      "specializations": ["elektrik", "sanitaer", "heizung"],
      "workingHours": {"start": "08:00", "end": "18:00"},
      "workingDays": {
        "mo": true,
        "di": true,
        "mi": true,
        "do": true,
        "fr": true,
        "sa": false,
        "so": false
      },
      "serviceArea": "10115, 10123",
      "hasVehicle": true,
      "experience": "beruf1\nberuf2",
      "qualifications": "zert1, zert2\nzert3",
      "registrationType": "einzelhandwerker",
      "timestamp": "2026-01-12T13:41:31.853Z",
      "source": "website_registration"
    },
    "webhookUrl": "...",
    "executionMode": "test"
  }
]
```

**Code (JavaScript):**
```javascript
// Code нода для обработки данных веб-регистрации мастера
// Адаптировано для ISO timestamp формата

// === КОНФИГУРАЦИЯ ===
const CONFIG = {
  // Входное поле с ISO timestamp
  inputTimestampField: 'body.timestamp',
  // Выходные поля для timestamp
  outputTimestampFields: {
    date: 'registration_date',           // дата YYYY-MM-DD
    month: 'registration_month',         // месяц (1-12)
    day: 'registration_day',             // день (1-31)
    time: 'registration_time'            // время HH:MM:SS
  },
  // Поле с WhatsApp номером
  whatsappField: 'body.whatsapp',
  // Выходные поля для WhatsApp
  outputWhatsappFields: {
    normalized: 'wa_norm',               // нормализованный номер без +
    masterId: 'master_id'                // полный ID мастера
  },
  // Локаль для форматирования
  locale: 'ru-RU'
};
// === КОНЕЦ КОНФИГУРАЦИИ ===

// Функция для преобразования ISO timestamp в читаемые компоненты
function parseISOTimestamp(isoString, config) {
  const date = new Date(isoString);

  // Проверяем валидность даты
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO timestamp: ${isoString}`);
  }

  return {
    [config.outputTimestampFields.date]: date.toISOString().split('T')[0], // YYYY-MM-DD
    [config.outputTimestampFields.month]: date.getMonth() + 1, // 1-12
    [config.outputTimestampFields.day]: date.getDate(), // 1-31
    [config.outputTimestampFields.time]: date.toISOString().split('T')[1].split('.')[0] // HH:MM:SS
  };
}

// Функция для нормализации WhatsApp номера
function normalizeWhatsappNumber(whatsappNumber) {
  if (!whatsappNumber || typeof whatsappNumber !== 'string') {
    throw new Error(`Invalid WhatsApp number: ${whatsappNumber}`);
  }

  // Убираем + в начале и любые не-цифровые символы
  const normalized = whatsappNumber.replace(/^\+/, '').replace(/\D/g/, '');

  if (normalized.length < 10) {
    throw new Error(`WhatsApp number too short: ${normalized}`);
  }

  return normalized;
}

// Основная логика обработки
for (let i = 0; i < $input.all().length; i++) {
  const item = $input.all()[i];

  // 1. Обрабатываем timestamp
  if (item.json.body && item.json.body.timestamp) {
    const isoTimestamp = item.json.body.timestamp;
    try {
      const timestampFields = parseISOTimestamp(isoTimestamp, CONFIG);
      // Добавляем поля к body
      Object.assign(item.json.body, timestampFields);
    } catch (error) {
      console.error(`Error parsing timestamp ${isoTimestamp}:`, error.message);
      // В случае ошибки добавляем пустые значения
      Object.assign(item.json.body, {
        [CONFIG.outputTimestampFields.date]: null,
        [CONFIG.outputTimestampFields.month]: null,
        [CONFIG.outputTimestampFields.day]: null,
        [CONFIG.outputTimestampFields.time]: null
      });
    }
  }

  // 2. Обрабатываем WhatsApp номер
  if (item.json.body && item.json.body.whatsapp) {
    const whatsappNumber = item.json.body.whatsapp;
    try {
      const normalizedNumber = normalizeWhatsappNumber(whatsappNumber);
      const masterId = `mid_wa_${normalizedNumber}`;

      // Добавляем поля к body
      Object.assign(item.json.body, {
        [CONFIG.outputWhatsappFields.normalized]: normalizedNumber,
        [CONFIG.outputWhatsappFields.masterId]: masterId
      });
    } catch (error) {
      console.error(`Error processing WhatsApp number ${whatsappNumber}:`, error.message);
      // В случае ошибки добавляем пустые значения
      Object.assign(item.json.body, {
        [CONFIG.outputWhatsappFields.normalized]: null,
        [CONFIG.outputWhatsappFields.masterId]: null
      });
    }
  }
}

// Возвращаем обработанные данные (сохраняя всю структуру)
return $input.all();
```

**Output:** Исходный JSON с добавленными полями в `body`:
```json
{
  "headers": {...},
  "params": {},
  "query": {},
  "body": {
    "vorname": "Alex",
    "nachname": "Hanssen",
    "email": "ahans@gmail.com",
    "whatsapp": "+49123456789",
    "specializations": ["elektrik", "sanitaer", "heizung"],
    "workingHours": {"start": "08:00", "end": "18:00"},
    "work_mo": true,
    "work_di": true,
    "work_mi": true,
    "work_do": true,
    "work_fr": true,
    "work_sa": false,
    "work_so": false,
    "serviceArea": "10115, 10123",
    "hasVehicle": true,
    "experience": "beruf1\nberuf2",
    "qualifications": "zert1, zert2\nzert3",
    "registrationType": "einzelhandwerker",
    "timestamp": "2026-01-12T13:41:31.853Z",
    "source": "website_registration",
    // Новые поля timestamp:
    "registration_date": "2026-01-12",
    "registration_month": 1,
    "registration_day": 12,
    "registration_time": "13:41:31",
    "registration_year": 2026,
    // Новые поля WhatsApp:
    "wa_norm": "49123456789",
    "master_id": "mid_wa_49123456789",
    // Новые поля специализаций (булевы):
    "spec_elektrik": true,
    "spec_sanitaer": true,
    "spec_heizung": true,
    "spec_maler": false,
    "spec_elektriker": false,
    "spec_klempner": false,
    "spec_schlosser": false,
    "spec_garten": false,
    "spec_reinigung": false,
    "spec_other": false,
    // Рабочие дни уже приходят в булевом формате:
    "work_mo": true,
    "work_di": true,
    "work_mi": true,
    "work_do": true,
    "work_fr": true,
    "work_sa": false,
    "work_so": false
  },
  "webhookUrl": "...",
  "executionMode": "test"
}
```

### 3. Set Node (Нормализация данных)
**Назначение:** Привести данные к единому формату и подготовить переменные для дальнейшей обработки.

**Конфигурация:**
- **MasterId:** `{{ $json.body.master_id }}`
- **Phone:** `{{ $json.body.whatsapp }}`
- **Email:** `{{ $json.body.email }}`
- **FirstName:** `{{ $json.body.vorname }}`
- **LastName:** `{{ $json.body.nachname }}`
- **Specializations:** `{{ $json.body.specializations }}`
- **ServiceArea:** `{{ $json.body.serviceArea }}`
- **RegistrationType:** `{{ $json.body.registrationType }}`
- **Timestamp:** `{{ $json.body.timestamp }}`
- **Source:** `{{ $json.body.source }}`

**Output:**
```json
{
  "master_id": "mid_wa_49123456789",
  "phone": "+49123456789",
  "email": "ahans@gmail.com",
  "first_name": "Alex",
  "last_name": "Hanssen",
  "specializations": ["elektrik", "sanitaer", "heizung"],
  "service_area": "10115, 10123",
  "registration_type": "einzelhandwerker",
  "timestamp": "2026-01-12T13:41:31.853Z",
  "source": "website_registration"
}
```

### 4. PostgreSQL Node (Проверка существования мастера)
**Назначение:** Проверить, зарегистрирован ли уже мастер с таким ID.

**Почему по ID, а не по телефону:**
- **Уникальность:** ID гарантированно уникален для каждого мастера
- **Составной ID:** Формат `mid_wa_{номер}` учитывает канал связи
- **Избежание коллизий:** Один телефон может иметь несколько профилей в разных каналах

**Query:**
```sql
SELECT EXISTS(
    SELECT 1 FROM masters
    WHERE id = '{{ $json.body.master_id }}'
) as master_exists;
```

**Конфигурация:**
- **Database:** Supabase
- **Operation:** Select
- **Query Parameters:** `{{ $json.body.master_id }}`

**Output:**
```json
{
  "master_exists": false
}
```

### 5. Switch Node (Маршрутизация)
**Условия:**
- **Case 1:** `master_exists = true` → **Мастер существует**
- **Case 2:** `master_exists = false` → **Новый мастер**

---

## Ветка "Новый мастер" (Master Exists = false)

### 6. PostgreSQL Node (Создание записи в masters)
**Назначение:** Создать базовую запись мастера с минимальными данными.

**Query:**
```sql
INSERT INTO masters (
    id,
    phone,
    email,
    whatsapp_id,
    first_name,
    last_name,
    status,
    created_at,
    last_activity_at
) VALUES (
    '{{ $json.body.master_id }}',
    '{{ $json.body.whatsapp }}',
    '{{ $json.body.email }}',
    '{{ $json.body.wa_norm }}',
    '{{ $json.body.vorname }}',
    '{{ $json.body.nachname }}',
    'pending_approval',
    '{{ $json.body.timestamp }}',
    '{{ $json.body.timestamp }}'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    last_activity_at = EXCLUDED.last_activity_at;
```

### 7. PostgreSQL Node (Создание записи в master_settings)
**Назначение:** Создать расширенные настройки мастера с графиком работы, специализациями и зоной обслуживания.

**Query:**
```sql
INSERT INTO master_settings (
    master_id,
    -- Профиль мастера
    has_vehicle,
    experience_years,
    qualifications,
    -- Зона обслуживания и график работы
    service_area,
    working_hours,
    working_days,
    -- Рабочие дни (булевы поля)
    work_mo, work_di, work_mi, work_do, work_fr, work_sa, work_so,
    -- Время работы (используем общее время из формы для всех рабочих дней)
    work_start_mo, work_end_mo,
    work_start_di, work_end_di,
    work_start_mi, work_end_mi,
    work_start_do, work_end_do,
    work_start_fr, work_end_fr,
    work_start_sa, work_end_sa,
    work_start_so, work_end_so,
    -- Специализации (булевы поля)
    spec_elektrik, spec_sanitaer, spec_heizung, spec_maler,
    spec_elektriker, spec_klempner, spec_schlosser, spec_garten, spec_reinigung, spec_other
) VALUES (
    '{{ $json.body.master_id }}',
    -- Профиль мастера
    {{ $json.body.hasVehicle }},
    CASE WHEN '{{ $json.body.experience }}' != '' THEN '{{ $json.body.experience }}'::integer ELSE NULL END,
    CASE WHEN '{{ $json.body.qualifications }}' != '' THEN '{{ $json.body.qualifications }}' ELSE NULL END,
    -- Зона обслуживания и график работы
    '{{ $json.body.serviceArea }}',
    '{{ $json.body.workingHours }}'::jsonb,
    ARRAY(
        SELECT CASE
            WHEN {{ $json.body.work_mo }} THEN 'mo'
            WHEN {{ $json.body.work_di }} THEN 'di'
            WHEN {{ $json.body.work_mi }} THEN 'mi'
            WHEN {{ $json.body.work_do }} THEN 'do'
            WHEN {{ $json.body.work_fr }} THEN 'fr'
            WHEN {{ $json.body.work_sa }} THEN 'sa'
            WHEN {{ $json.body.work_so }} THEN 'so'
        END
        WHERE CASE
            WHEN {{ $json.body.work_mo }} THEN true
            WHEN {{ $json.body.work_di }} THEN true
            WHEN {{ $json.body.work_mi }} THEN true
            WHEN {{ $json.body.work_do }} THEN true
            WHEN {{ $json.body.work_fr }} THEN true
            WHEN {{ $json.body.work_sa }} THEN true
            WHEN {{ $json.body.work_so }} THEN true
            ELSE false
        END
    ),
    -- Рабочие дни (булевы значения)
    {{ $json.body.work_mo }}, {{ $json.body.work_di }}, {{ $json.body.work_mi }},
    {{ $json.body.work_do }}, {{ $json.body.work_fr }}, {{ $json.body.work_sa }}, {{ $json.body.work_so }},
    -- Время работы (для всех дней используем общее время из формы)
    CASE WHEN {{ $json.body.work_mo }} THEN '{{ $json.body.workingHours.start }}:00'::time ELSE NULL END,
    CASE WHEN {{ $json.body.work_mo }} THEN '{{ $json.body.workingHours.end }}:00'::time ELSE NULL END,
    CASE WHEN {{ $json.body.work_di }} THEN '{{ $json.body.workingHours.start }}:00'::time ELSE NULL END,
    CASE WHEN {{ $json.body.work_di }} THEN '{{ $json.body.workingHours.end }}:00'::time ELSE NULL END,
    CASE WHEN {{ $json.body.work_mi }} THEN '{{ $json.body.workingHours.start }}:00'::time ELSE NULL END,
    CASE WHEN {{ $json.body.work_mi }} THEN '{{ $json.body.workingHours.end }}:00'::time ELSE NULL END,
    CASE WHEN {{ $json.body.work_do }} THEN '{{ $json.body.workingHours.start }}:00'::time ELSE NULL END,
    CASE WHEN {{ $json.body.work_do }} THEN '{{ $json.body.workingHours.end }}:00'::time ELSE NULL END,
    CASE WHEN {{ $json.body.work_fr }} THEN '{{ $json.body.workingHours.start }}:00'::time ELSE NULL END,
    CASE WHEN {{ $json.body.work_fr }} THEN '{{ $json.body.workingHours.end }}:00'::time ELSE NULL END,
    CASE WHEN {{ $json.body.work_sa }} THEN '{{ $json.body.workingHours.start }}:00'::time ELSE NULL END,
    CASE WHEN {{ $json.body.work_sa }} THEN '{{ $json.body.workingHours.end }}:00'::time ELSE NULL END,
    CASE WHEN {{ $json.body.work_so }} THEN '{{ $json.body.workingHours.start }}:00'::time ELSE NULL END,
    CASE WHEN {{ $json.body.work_so }} THEN '{{ $json.body.workingHours.end }}:00'::time ELSE NULL END,
    -- Специализации (булевы значения)
    {{ $json.body.spec_elektrik }}, {{ $json.body.spec_sanitaer }}, {{ $json.body.spec_heizung }}, {{ $json.body.spec_maler }},
    {{ $json.body.spec_elektriker }}, {{ $json.body.spec_klempner }}, {{ $json.body.spec_schlosser }}, {{ $json.body.spec_garten }}, {{ $json.body.spec_reinigung }}, {{ $json.body.spec_other }}
) ON CONFLICT (master_id) DO UPDATE SET
    has_vehicle = EXCLUDED.has_vehicle,
    experience_years = EXCLUDED.experience_years,
    qualifications = EXCLUDED.qualifications,
    service_area = EXCLUDED.service_area,
    working_hours = EXCLUDED.working_hours,
    working_days = EXCLUDED.working_days,
    work_mo = EXCLUDED.work_mo, work_di = EXCLUDED.work_di, work_mi = EXCLUDED.work_mi,
    work_do = EXCLUDED.work_do, work_fr = EXCLUDED.work_fr, work_sa = EXCLUDED.work_sa, work_so = EXCLUDED.work_so,
    work_start_mo = EXCLUDED.work_start_mo, work_end_mo = EXCLUDED.work_end_mo,
    work_start_di = EXCLUDED.work_start_di, work_end_di = EXCLUDED.work_end_di,
    work_start_mi = EXCLUDED.work_start_mi, work_end_mi = EXCLUDED.work_end_mi,
    work_start_do = EXCLUDED.work_start_do, work_end_do = EXCLUDED.work_end_do,
    work_start_fr = EXCLUDED.work_start_fr, work_end_fr = EXCLUDED.work_end_fr,
    work_start_sa = EXCLUDED.work_start_sa, work_end_sa = EXCLUDED.work_end_sa,
    work_start_so = EXCLUDED.work_start_so, work_end_so = EXCLUDED.work_end_so,
    spec_elektrik = EXCLUDED.spec_elektrik, spec_sanitaer = EXCLUDED.spec_sanitaer,
    spec_heizung = EXCLUDED.spec_heizung, spec_maler = EXCLUDED.spec_maler,
    spec_elektriker = EXCLUDED.spec_elektriker, spec_klempner = EXCLUDED.spec_klempner,
    spec_schlosser = EXCLUDED.spec_schlosser, spec_garten = EXCLUDED.spec_garten,
    spec_reinigung = EXCLUDED.spec_reinigung, spec_other = EXCLUDED.spec_other,
    updated_at = now();
```

### 9. PostgreSQL Node (Создание записи в master_status)
**Назначение:** Создать запись в машине состояний для маршрутизации пользователя.

**Query:**
```sql
INSERT INTO master_status (
    master_id,
    current_state,
    state_data,
    last_message_at,
    is_active,
    rating,
    completed_jobs,
    created_at
) VALUES (
    '{{ $json.body.master_id }}',
    'registration_started',
    '{
        "registration_step": "name_requested",
        "registration_channel": "website",
        "source": "{{ $json.body.source }}",
        "registration_date": "{{ $json.body.registration_date }}",
        "timestamp": "{{ $json.body.timestamp }}"
    }'::jsonb,
    '{{ $json.body.timestamp }}',
    true,
    0,  -- Начальный рейтинг
    0,  -- Начальное количество работ
    '{{ $json.body.timestamp }}'
) ON CONFLICT (master_id) DO UPDATE SET
    current_state = EXCLUDED.current_state,
    state_data = EXCLUDED.state_data,
    last_message_at = EXCLUDED.last_message_at;
```

**Почему это критически важно:**
Без записи в `master_status` система маршрутизации (Router Workflow) не сможет определить, что этот пользователь - мастер и в каком состоянии находится его диалог.

### 8. AWS S3 Node (Создание директорий в MinIO)
**Назначение:** Создать структуру папок для хранения файлов нового мастера.

**Конфигурация:**
- **Service:** Custom Service
- **Region:** `us-east-1` (или ваш регион)
- **Bucket:** `assetcare-mvp`
- **Access Key ID:** `{{ $env.MINIO_ACCESS_KEY }}`
- **Secret Access Key:** `{{ $env.MINIO_SECRET_KEY }}`
- **Endpoint:** `{{ $env.MINIO_ENDPOINT }}` (например: `https://minio.assetcare24.org`)

**Создание директорий (нужно 3 отдельных ноды или цикл):**

**Нода 8.1: registration_pending/**
- **Operation:** Create Folder
- **Folder Path:** `users/{{ $json.body.master_id }}/registration_pending/`

**Нода 8.2: documents/**
- **Operation:** Create Folder
- **Folder Path:** `users/{{ $json.body.master_id }}/documents/`

**Нода 8.3: portfolio/**
- **Operation:** Create Folder
- **Folder Path:** `users/{{ $json.body.master_id }}/portfolio/`

**Нода 8.4: requests/**
- **Operation:** Create Folder
- **Folder Path:** `users/{{ $json.body.master_id }}/requests/`

**Почему это важно:**
- Структура папок создается заранее для предотвращения ошибок при первой загрузке файлов
- Четкая организация хранения по категориям файлов
- Возможность мониторинга использования хранилища

### 10. PostgreSQL Node (Логирование регистрации)
**Назначение:** Создать запись в логе о начале регистрации для аудита.

**Query:**
```sql
-- Опционально: можно создать отдельную таблицу audit_log
-- Или использовать существующую структуру

-- Вариант 1: Обновить master_status с дополнительной информацией
UPDATE master_status
SET state_data = state_data || '{
    "storage_initialized": true,
    "folders_created": ["registration_pending", "documents", "portfolio", "requests"],
    "registration_started_at": "{{ $json.body.timestamp }}"
}'::jsonb
WHERE master_id = '{{ $json.body.master_id }}';

-- Вариант 2: Создать таблицу master_registration_log (если существует)
-- INSERT INTO master_registration_log (master_id, action, details, created_at)
-- VALUES ('{{ $json.master_id }}', 'registration_started', '{"channel": "whatsapp"}'::jsonb, '{{ $json.timestamp }}');
```

### 11. Twilio Node (Отправка приветственного сообщения)
**Назначение:** Отправить подтверждение регистрации мастеру по WhatsApp.

**Конфигурация:**
- **To:** `{{ $json.body.whatsapp }}`
- **Body:**
```
Здравствуйте, {{ $json.body.vorname }}! Спасибо за регистрацию на AssetCare24.

✅ Ваша заявка принята и находится на проверке администратором.
📋 Мы проверим предоставленные данные и документы.
📞 В ближайшее время с вами свяжется наш менеджер для верификации.

Ваш регистрационный ID: {{ $json.body.master_id }}
Дата регистрации: {{ $json.body.registration_date }}

По вопросам звоните: +49 123 456 789
```

### 12. PostgreSQL Node (Обновление состояния)
**Назначение:** Зафиксировать завершение регистрации.

**Query:**
```sql
UPDATE master_status
SET
    current_state = 'registration_completed',
    state_data = state_data || '{
        "last_action": "registration_completed",
        "registration_completed_at": "{{ $json.body.timestamp }}",
        "registration_success": true
    }'::jsonb,
    last_message_at = '{{ $json.body.timestamp }}'
WHERE master_id = '{{ $json.body.master_id }}';
```

### 13. HTTP Request Node (Отправка успешного ответа)
**Назначение:** Вернуть успешный ответ веб-форме регистрации.

**Конфигурация:**
- **Method:** POST
- **URL:** `{{ $json.webhookUrl }}`
- **Body:**
```json
{
  "success": true,
  "message": "Мастер успешно зарегистрирован",
  "master_id": "{{ $json.body.master_id }}",
  "registration_date": "{{ $json.body.registration_date }}",
  "status": "pending_approval",
  "next_steps": [
    "Ожидайте проверки документов",
    "Администратор свяжется с вами",
    "Проверьте WhatsApp для дальнейших инструкций"
  ]
}
```

**Response:** Подтверждает успешную регистрацию в веб-форму.

---

## Дополнительные действия в рамках регистрации

### Что еще можно/нужно сделать:

#### 1. Проверка на дубликаты по email (если email уже известен)
```sql
-- Если мастер предоставил email в сообщении или из других источников
SELECT EXISTS(
    SELECT 1 FROM masters
    WHERE email = '{{ extracted_email }}'
    AND email IS NOT NULL
) as email_exists;
```

#### 2. Отправка уведомления администратору
**Telegram Node или Email Node:**
```
🆕 Новый мастер зарегистрировался!

📱 Телефон: {{ $json.phone }}
🆔 ID: {{ $json.master_id }}
📅 Время: {{ $json.timestamp }}
📂 Хранилище: инициализировано

Ожидает проверки документов.
```

#### 3. Создание записи в таблице уведомлений (опционально)
```sql
-- Если есть таблица notifications для администраторов
INSERT INTO admin_notifications (
    type,
    title,
    message,
    related_master_id,
    priority,
    created_at
) VALUES (
    'master_registration',
    'Новый мастер ожидает проверки',
    'Мастер {{ $json.master_id }} зарегистрировался через WhatsApp',
    '{{ $json.master_id }}',
    'normal',
    '{{ $json.timestamp }}'
);
```

#### 4. Геокодирование зоны обслуживания (если указана)
```sql
-- Если мастер указал город/район, можно геокодировать
-- Использовать внешний API для получения координат
-- И сохранить в master_status.state_data
```

#### 5. Создание начального профиля специализаций
```sql
-- Создать временную запись специализаций (пустую)
UPDATE masters
SET specializations = ARRAY[]::text[]
WHERE id = '{{ $json.master_id }}';
```

---

## Ветка "Мастер существует" (Master Exists = true)

### 14. HTTP Request Node (Отправка ответа на webhook)
**Назначение:** Вернуть ответ форме регистрации о том, что пользователь уже существует.

**Конфигурация:**
- **Method:** POST
- **URL:** `{{ $json.webhookUrl }}`
- **Body:**
```json
{
  "success": false,
  "error": "Master already exists",
  "message": "Пользователь с таким WhatsApp номером уже зарегистрирован",
  "existing_email": "{{ $json.body.email }}",
  "master_id": "{{ $json.body.master_id }}"
}
```

**Response:** Возвращает информацию об ошибке в веб-форму.

**Дополнительно:** Можно добавить запрос статуса мастера из таблицы masters.

---

## Дополнительные соображения

### Что создается при регистрации нового мастера

#### 1. База данных:
- **`masters`** - основная информация о мастере
  - Обязательные поля: `id`, `phone`, `status`
  - Остальные поля заполняются позже в диалоге

- **`master_status`** - машина состояний (КРИТИЧЕСКИ ВАЖНО!)
  - Управляет маршрутизацией в Router workflow
  - Хранит текущее состояние диалога регистрации
  - Без этой записи мастер "невидим" для системы

- **`user_links`** - связь с клиентским профилем (опционально)
  - Если мастер был ранее клиентом
  - Создается отдельным запросом на основе phone matching

#### 2. Хранилище MinIO:
Структура папок создается заранее для организации файлов:
- `users/{master_id}/registration_pending/` - документы на проверке
- `users/{master_id}/documents/` - лицензии и сертификаты
- `users/{master_id}/portfolio/` - портфолио работ
- `users/{master_id}/requests/` - файлы выполненных работ

#### 3. Системные ресурсы:
- Запись в логе аудита состояния регистрации
- Уведомление администраторам о новой регистрации (рекомендуется)

### Почему именно эти таблицы

- **`masters`**: Хранит профиль мастера
- **`master_status`**: Включает мастера в систему маршрутизации
- **`user_links`**: Связывает профили одного человека (клиент + мастер)

### Продолжение регистрации

После создания базовых записей, процесс продолжается в отдельных workflow'ах:
- Сбор имени и фамилии
- Выбор специализаций
- Определение зоны обслуживания
- Загрузка документов
- Одобрение администратором

---

## Переменные окружения

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=your_whatsapp_number

# MinIO S3 Storage
MINIO_ACCESS_KEY=your_minio_access_key
MINIO_SECRET_KEY=your_minio_secret_key
MINIO_ENDPOINT=https://minio.assetcare24.org
MINIO_BUCKET=assetcare-mvp

# Webhook Configuration
WEBHOOK_SUCCESS_URL=https://assetcare24.org/webhook/success
WEBHOOK_ERROR_URL=https://assetcare24.org/webhook/error
```

## Тестирование

**Test Case 1: Новый мастер**
- Input: Сообщение от неизвестного номера
- Expected: Создание записей в `masters` и `master_status`, отправка запроса имени

**Test Case 2: Существующий мастер**
- Input: Сообщение от зарегистрированного номера
- Expected: Информационное сообщение без создания новых записей

---

## Следующие шаги

1. Реализовать продолжение диалога (сбор имени, специализаций)
2. Добавить валидацию данных
3. Интегрировать с процессом одобрения администратором
4. Добавить обработку медиафайлов (документы, фото)
