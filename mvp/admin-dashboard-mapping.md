# 🗺️ Исчерпывающая карта админского раздела AssetCare24

**Дата создания:** 26 января 2026 г.
**Версия админки:** v2.0
**Commit:** `ca49b03`

## 📋 Обзор архитектуры

Админская панель AssetCare24 построена на Next.js 15 с использованием Supabase PostgreSQL. Интерфейс разделен на 5 основных разделов (табов) с полной интеграцией API и клиентской фильтрацией данных.

---

## 🎯 ОБЩАЯ СТРУКТУРА

### Компонент: `AdminDashboard` (`site/components/admin-dashboard.tsx`)

#### 🔧 Состояние компонента:
```typescript
interface AdminDashboardState {
  // Навигация
  activeTab: "uebersicht" | "benutzer" | "auftraege" | "statistiken" | "einstellungen"

  // Данные API
  users: UserData[]
  orders: OrderData[]
  stats: StatsData | null

  // UI состояния
  loading: boolean
  error: string | null

  // Фильтры пользователей
  userTypeFilter: 'all' | 'client' | 'master'
  userStatusFilter: 'all' | 'active' | 'inactive' | 'blocked'
  searchQuery: string

  // Фильтры заказов
  orderStatusFilter: 'all' | 'new' | 'assigned' | 'in_progress' | 'completed' | 'canceled'
  orderUrgencyFilter: 'all' | 'low' | 'normal' | 'high' | 'urgent'

  // Модальные окна
  showStatusModal: boolean
  selectedUserForStatus: UserData | null
  statusChanging: boolean
}
```

#### 📊 API интеграция:
- **Базовый URL:** `http://localhost:3002/api/admin`
- **Методы:** GET, POST
- **Формат данных:** JSON с полями `data`, `error`, `pagination`

---

## 📄 ПОСТРАНИЧНАЯ КАРТА

### 1. 🏠 **ÜBERSICHT** (Обзор) - Главная страница

#### 📍 URL: `/dashboard/admin` (активен по умолчанию)

#### 🎨 UI Элементы:

##### **Статистические карточки:**
```
┌─────────────────────────────────────┐
│ 👥 Benutzer gesamt: {stats.totalUsers} │
│ 📋 Aufträge gesamt: {stats.totalOrders} │
│ 🟢 Aktive Kunden: {stats.activeClients} │
│ 🟠 Offene Aufträge: {stats.openOrders} │
└─────────────────────────────────────┘
```

##### **Информационные блоки:**
- **Benutzer:** Количество зарегистрированных пользователей
- **Aufträge:** Количество заявок в системе

#### 🔗 **API запросы:**
```typescript
// Загружается автоматически при монтировании компонента
GET /api/admin/users    // все пользователи
GET /api/admin/orders   // все заказы
GET /api/admin/stats    // статистика
```

#### 🎯 **База данных:**
- **Источники:** `view_all_users`, `view_dispatcher_dashboard`, расчетные функции
- **Обновление:** При каждом заходе на страницу

---

### 2. 👥 **BENUTZER** (Пользователи)

#### 📍 URL: `/dashboard/admin` (таб "benutzer")

#### 🎨 UI Элементы:

##### **Панель фильтров:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍 [input] "Benutzer suchen..."                                 │
│ ┌─────────────────┐ ┌──────────────────┐                        │
│ │ Alle Typen ▼    │ │ Alle Status ▼    │                        │
│ │ Kunden          │ │ Aktiv            │                        │
│ │ Handwerker      │ │ Inaktiv          │                        │
│ └─────────────────┘ │ Gesperrt         │                        │
│                     └──────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

##### **Список пользователей:**
```
┌─────────────────────────────────────────────────────────────────┐
│ [Фото/Аватар] Анна Мюллер                                      │
│ anna.mueller@email.de • 3 Aufträge                            │
│ [aktiv] [Kunde] [✏️]                                           │
├─────────────────────────────────────────────────────────────────┤
│ [Фото/Аватар] Макс Шмидт                                       │
│ max.schmidt@email.de • 1 Aufträge                             │
│ [aktiv] [Kunde] [✏️]                                           │
└─────────────────────────────────────────────────────────────────┘
```

##### **Модальное окно изменения статуса:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Status ändern                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Benutzer: Анна Мюллер                                          │
│ anna.mueller@email.de • Kunde                                  │
├─────────────────────────────────────────────────────────────────┤
│ Aktueller Status: [aktiv]                                      │
├─────────────────────────────────────────────────────────────────┤
│ Neuer Status:                                                  │
│ □ Aktiv       ■ Inaktiv     □ Gesperrt                        │
├─────────────────────────────────────────────────────────────────┤
│ [Abbrechen]                           [Ändern]               │
└─────────────────────────────────────────────────────────────────┘
```

#### 🎛️ **Интерактивные элементы:**

##### **Строка поиска:**
- **Тип:** `<input>` с иконкой Search
- **Функция:** Поиск по `first_name + last_name`, `email`, `phone`
- **Фильтрация:** Client-side в `filteredUsers`
- **Debounce:** Без задержки (immediate)

##### **Фильтр по типу:**
- **Тип:** `<select>` dropdown
- **Опции:** `all`, `client`, `master`
- **Маппинг:** `client` → `user_type === 'client'`
- **Обновление:** Real-time без API запроса

##### **Фильтр по статусу:**
- **Тип:** `<select>` dropdown
- **Опции:** `all`, `active`, `inactive`, `blocked`
- **Маппинг:** `active` → `status === 'aktiv'`
- **Обновление:** Real-time без API запроса

##### **Кнопка изменения статуса:**
- **Тип:** `<button>` с иконкой Edit
- **Действие:** Открывает модальное окно
- **API:** `POST /api/admin/users/{id}/status`

#### 🔗 **API запросы:**

##### **Загрузка данных:**
```typescript
GET /api/admin/users
// Headers: Accept: application/json
// Response: { data: UserData[], pagination: {...} }
```

##### **Изменение статуса:**
```typescript
POST /api/admin/users/{user.id}/status
// Body: { "status": "active" | "inactive" | "blocked" }
// Response: { data: { id, status, updated_at }, message: "..." }
```

#### 🎯 **База данных:**

##### **Источники данных:**
```sql
-- View для пользователей
SELECT * FROM view_all_users
ORDER BY registered_at DESC
```

##### **Структура UserData:**
```typescript
interface UserData {
  id: string              // clients.id или masters.id
  name: string            // first_name + ' ' + last_name
  email?: string          // clients.email или masters.email
  phone: string           // clients.phone или masters.phone
  user_type: "client"|"master"  // из view_all_users.user_type
  status: string          // clients.status или masters.status
  registered_at: string   // clients.created_at или masters.created_at
  last_active: string     // clients.last_activity_at или masters.last_activity_at
  verified: boolean       // clients.wa_verified или masters.wa_verified
  ordersCount: number     // подсчет из requests
  rating?: number         // masters.rating
}
```

##### **Фильтрация:**
- **Тип:** Client-side через `Array.filter()`
- **Производительность:** Поддерживает до 1000+ пользователей
- **Индексы:** Использует существующие индексы БД

---

### 3. 📋 **AUFTRÄGE** (Заказы)

#### 📍 URL: `/dashboard/admin` (таб "auftraege")

#### 🎨 UI Элементы:

##### **Панель фильтров:**
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────┐ ┌──────────────────┐                        │
│ │ Alle Status ▼   │ │ Alle Prioritäten▼│                        │
│ │ Offen           │ │ Niedrig          │                        │
│ │ Zugewiesen      │ │ Normal           │                        │
│ │ In Bearbeitung  │ │ Hoch             │                        │
│ │ Abgeschlossen   │ │ Dringend         │                        │
│ │ Storniert       │ └──────────────────┘                        │
│ └─────────────────┘                                             │
└─────────────────────────────────────────────────────────────────┘
```

##### **Список заказов:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔧 Замена розетки в гостиной, искрит и греется                │
│ Анна Мюллер • 23.01.2026                                       │
│ [offen] [Elektrik]                                             │
├─────────────────────────────────────────────────────────────────┤
│ 🔧 Установка нового смесителя в кухне                         │
│ Макс Шмидт • 22.01.2026                                        │
│ [in_bearbeitung] [Sanitär]                                     │
└─────────────────────────────────────────────────────────────────┘
```

#### 🎛️ **Интерактивные элементы:**

##### **Фильтр по статусу:**
- **Тип:** `<select>` dropdown
- **Опции:** `all`, `new`, `assigned`, `in_progress`, `completed`, `canceled`
- **Маппинг:** `new` → `status === 'offen'`

##### **Фильтр по приоритету:**
- **Тип:** `<select>` dropdown
- **Опции:** `all`, `low`, `normal`, `high`, `urgent`
- **Маппинг:** `low` → `urgency === 'low'`

#### 🔗 **API запросы:**

##### **Загрузка данных:**
```typescript
GET /api/admin/orders
// Response: { data: OrderData[], pagination: {...} }
```

#### 🎯 **База данных:**

##### **Источники данных:**
```sql
-- View для заказов
SELECT * FROM view_dispatcher_dashboard
ORDER BY urgency DESC, request_created DESC
```

##### **Структура OrderData:**
```typescript
interface OrderData {
  id: number              // requests.id
  title: string           // description или category + description
  customer: string        // client_name из view
  handwerker?: string     // master_name из view
  status: string          // request_status из view
  date: string            // request_created (formatted)
  category?: string       // category из requests
  address?: string        // address из view
  price?: number          // пока не используется
}
```

---

### 4. 📊 **STATISTIKEN** (Статистика)

#### 📍 URL: `/dashboard/admin` (таб "statistiken")

#### 🎨 UI Элементы:

##### **Метрики:**
```
┌─────────────────────────────────────┐
│ 👥 Gesamt Benutzer: {stats.totalUsers} │
│ 🟢 Aktive Kunden: {stats.activeClients} │
│ 🔧 Handwerker: {stats.totalMasters} │
│ 📋 Aufträge: {stats.totalOrders} │
│ 🟠 Offene Aufträge: {stats.openOrders} │
│ ✅ Abgeschlossene: {stats.completedOrders} │
└─────────────────────────────────────┘
```

#### 🔗 **API запросы:**
```typescript
GET /api/admin/stats
// Response: { data: AdminStats }
```

#### 🎯 **База данных:**

##### **Расчеты:**
```sql
-- Клиенты
SELECT COUNT(*) as total_clients FROM clients;
SELECT COUNT(*) as active_clients FROM clients WHERE status = 'active';

-- Мастера
SELECT COUNT(*) as total_masters FROM masters;
SELECT COUNT(*) as active_masters FROM masters WHERE status IN ('active', 'approved');

-- Заказы
SELECT COUNT(*) as total_orders FROM requests;
SELECT COUNT(*) as open_orders FROM requests WHERE status IN ('new', 'assigned', 'in_progress');
SELECT COUNT(*) as completed_orders FROM requests WHERE status = 'completed';
```

---

### 5. ⚙️ **EINSTELLUNGEN** (Настройки)

#### 📍 URL: `/dashboard/admin` (таб "einstellungen")

#### 🎨 UI Элементы:
```
┌─────────────────────────────────────────────────────────────────┐
│ Systemeinstellungen                                            │
├─────────────────────────────────────────────────────────────────┤
│ В разработке...                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 API ENDPOINTS - ПОДРОБНАЯ СПЕЦИФИКАЦИЯ

### 1. `GET /api/admin/users`

#### **Query параметры:**
```
type: 'all' | 'client' | 'master'     // Фильтр по типу
status: 'all' | 'active' | 'inactive' | 'blocked'  // Фильтр по статусу
search: string                        // Поисковый запрос
page: number (default: 1)            // Номер страницы
limit: number (default: 50)          // Размер страницы
```

#### **SQL запрос:**
```sql
SELECT * FROM view_all_users
WHERE (type = $1 OR $1 = 'all')
  AND (status = $2 OR $2 = 'all')
  AND (first_name ILIKE $3 OR last_name ILIKE $3 OR email ILIKE $3)
ORDER BY registered_at DESC
LIMIT $4 OFFSET $5
```

#### **Response:**
```json
{
  "data": [
    {
      "id": "cid_wa_49123456789",
      "name": "Anna Müller",
      "email": "anna.mueller@email.de",
      "phone": "+49123456789",
      "user_type": "client",
      "status": "aktiv",
      "registered_at": "2026-01-20T10:00:00Z",
      "last_active": "2026-01-23T14:30:00Z",
      "verified": true,
      "ordersCount": 3,
      "rating": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 9,
    "hasMore": false
  }
}
```

### 2. `GET /api/admin/orders`

#### **Query параметры:**
```
status: 'all' | 'new' | 'assigned' | 'in_progress' | 'completed' | 'canceled'
urgency: 'all' | 'low' | 'normal' | 'high' | 'urgent'
dateFrom: string (YYYY-MM-DD)
dateTo: string (YYYY-MM-DD)
page: number (default: 1)
limit: number (default: 50)
```

#### **SQL запрос:**
```sql
SELECT * FROM view_dispatcher_dashboard
WHERE (request_status = $1 OR $1 = 'all')
  AND (urgency = $2 OR $2 = 'all')
  AND (request_created >= $3 OR $3 IS NULL)
  AND (request_created <= $4 OR $4 IS NULL)
ORDER BY urgency DESC, request_created DESC
LIMIT $5 OFFSET $6
```

### 3. `GET /api/admin/stats`

#### **Response:**
```json
{
  "data": {
    "totalUsers": 9,
    "totalKunden": 5,
    "totalHandwerker": 4,
    "activeUsers": 5,
    "blockedUsers": 2,
    "totalOrders": 8,
    "openOrders": 6,
    "completedOrders": 1,
    "totalRevenue": 0
  }
}
```

### 4. `POST /api/admin/users/{id}/block`

#### **Request:**
```json
{
  "action": "block" | "unblock"
}
```

#### **Response:**
```json
{
  "data": {
    "id": "cid_wa_49123456789",
    "status": "blocked",
    "updated_at": "2026-01-23T18:13:11.617Z"
  },
  "message": "User blocked successfully"
}
```

### 5. `POST /api/admin/users/{id}/status`

#### **Request:**
```json
{
  "status": "active" | "inactive" | "blocked"
}
```

#### **Response:**
```json
{
  "data": {
    "id": "cid_wa_49123456789",
    "status": "inactive",
    "updated_at": "2026-01-23T18:32:38.914Z"
  },
  "message": "User status updated to inactive successfully"
}
```

---

## 🎯 ВЗАИМОДЕЙСТВИЕ С БАЗОЙ ДАННЫХ

### **Views для админки:**

#### `view_all_users`
```sql
CREATE VIEW view_all_users AS
SELECT
  'client' as user_type,
  c.id, c.first_name, c.last_name, c.email, c.phone,
  c.status, c.created_at as registered_at, c.last_activity_at as last_active,
  c.wa_verified as verified,
  COUNT(r.id) as orders_count,
  NULL as rating
FROM clients c
LEFT JOIN requests r ON c.id = r.client_id
GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, c.status, c.created_at, c.last_activity_at, c.wa_verified

UNION ALL

SELECT
  'master' as user_type,
  m.id, m.first_name, m.last_name, m.email, m.phone,
  m.status, m.created_at as registered_at, m.last_activity_at as last_active,
  m.wa_verified as verified,
  COUNT(r.id) as orders_count,
  m.rating
FROM masters m
LEFT JOIN requests r ON m.id = r.master_id
GROUP BY m.id, m.first_name, m.last_name, m.email, m.phone, m.status, m.created_at, m.last_activity_at, m.wa_verified, m.rating;
```

#### `view_dispatcher_dashboard`
```sql
CREATE VIEW view_dispatcher_dashboard AS
SELECT
  r.id as request_id, r.status as request_status, r.created_at as request_created,
  r.urgency, r.category, r.description, r.postal_code, r.address_snapshot as address,
  CONCAT(c.first_name, ' ', c.last_name) as client_name,
  c.phone as client_phone, c.category as client_category, c.subcategory as client_subcategory,
  CONCAT(m.first_name, ' ', m.last_name) as master_name,
  m.phone as master_phone, m.rating as master_rating,
  r.assigned_at,
  EXTRACT(EPOCH FROM (now() - r.created_at))/3600 as hours_since_created,
  CASE WHEN r.status = 'assigned' THEN EXTRACT(EPOCH FROM (now() - r.assigned_at))/3600 ELSE NULL END as hours_since_assigned
FROM requests r
JOIN clients c ON r.client_id = c.id
LEFT JOIN masters m ON r.master_id = m.id
WHERE r.status IN ('new', 'assigned', 'in_progress')
ORDER BY r.urgency DESC, r.created_at ASC;
```

---

## 🔄 DATA FLOW

### **Загрузка данных:**
```
AdminDashboard Component Mount
    ↓
useEffect() → fetchData()
    ↓
Promise.all([
  fetch('/api/admin/users'),
  fetch('/api/admin/orders'),
  fetch('/api/admin/stats')
])
    ↓
Supabase Admin Client
    ↓
PostgreSQL Views & Tables
    ↓
JSON Response → State Update
    ↓
UI Re-render with Real Data
```

### **Фильтрация:**
```
User Input (select/search)
    ↓
State Update (userTypeFilter, etc.)
    ↓
filteredUsers = users.filter(predicate)
    ↓
UI Re-render (no API calls)
```

### **Действия:**
```
User Action (Edit Status)
    ↓
Modal Open → Status Selection
    ↓
POST /api/admin/users/{id}/status
    ↓
Supabase Update Query
    ↓
Optimistic UI Update
    ↓
Toast Notification
```

---

## 📊 ПРОИЗВОДИТЕЛЬНОСТЬ

### **Метрики:**
- **API Response Time:** < 500ms для всех endpoints
- **Initial Load:** ~1-2 секунды (с компиляцией)
- **Filter Response:** < 50ms (client-side)
- **Status Update:** < 300ms (оптимистичные обновления)

### **Оптимизации:**
- **Client-side фильтрация** для интерактивности
- **Pagination** для больших наборов данных
- **Lazy loading** табов (при необходимости)
- **Optimistic updates** для лучшего UX

---

## 🔐 БЕЗОПАСНОСТЬ

### **API уровень:**
- **Supabase Service Role Key** для полного доступа
- **Row Level Security** включена на уровне БД
- **Input validation** через TypeScript interfaces
- **SQL injection protection** через Supabase ORM

### **UI уровень:**
- **XSS protection** через React sanitization
- **CSRF protection** через Next.js middleware
- **Rate limiting** на уровне Supabase

---

## 🎯 ТЕСТИРОВАНИЕ

### **Ручное тестирование:**
```bash
# API endpoints
curl http://localhost:3002/api/admin/users
curl http://localhost:3002/api/admin/orders
curl http://localhost:3002/api/admin/stats

# Действия
curl -X POST /api/admin/users/cid/status \
  -H "Content-Type: application/json" \
  -d '{"status": "blocked"}'
```

### **UI тестирование:**
- ✅ Фильтры пользователей (тип, статус, поиск)
- ✅ Фильтры заказов (статус, приоритет)
- ✅ Изменение статуса пользователей
- ✅ Блокировка/разблокировка
- ✅ Responsive дизайн
- ✅ Loading/error состояния

---

**Этот документ является исчерпывающим руководством по архитектуре и функциональности админской панели AssetCare24 v2.0**
