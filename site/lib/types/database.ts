// Database Types для AssetCare24 MVP
// Основан на схеме БД из 03_database_schema_mvp.md

// =============================================================================
// ОСНОВНЫЕ ТАБЛИЦЫ
// =============================================================================

// Клиенты
export interface DBClient {
  id: string                    // cid_{channel}_{identifier}
  phone: string
  email?: string
  whatsapp_id?: string
  telegram_id?: string
  first_name?: string
  last_name?: string
  status: 'active' | 'inactive' | 'blocked'
  category: 'existing_client' | 'new_client' | 'unknown'
  subcategory?: string
  source: 'qr_code' | 'advertisement' | 'website' | 'referral'
  wa_verified: boolean
  email_verified: boolean
  phone_verified: boolean
  cod_value?: string
  thread_id?: string
  first_contact_at: string
  last_activity_at: string
  meta_data: Record<string, any>
  created_at: string
  updated_at: string
}

// Мастера
export interface DBMaster {
  id: string                    // mid_{channel}_{identifier}
  phone: string
  email?: string
  whatsapp_id?: string
  telegram_id?: string
  first_name: string
  last_name: string
  status: 'pending_approval' | 'verified' | 'approved' | 'active' | 'suspended' | 'blocked'
  wa_norm?: string
  wa_verified: boolean
  email_verified: boolean
  phone_verified: boolean
  code_source?: string
  code_master_type?: string
  code_value?: string
  thread_id?: string
  last_activity_at: string
  meta_data: Record<string, any>
  created_at: string
  updated_at: string
}

// Администраторы
export interface DBAdminUser {
  id: string                    // aid_{channel}_{identifier}
  phone: string
  email: string
  whatsapp_id?: string
  telegram_id?: string
  first_name: string
  last_name: string
  role: 'admin' | 'manager' | 'support'
  permissions: Record<string, any>
  last_login_at?: string
  created_at: string
}

// Заявки
export interface DBRequest {
  id: number
  parent_request_id?: number
  client_id: string
  address_id?: string
  address_snapshot?: string
  postal_code?: string
  master_id?: string
  status: 'new' | 'assigned' | 'in_progress' | 'completed' | 'canceled' | 'paused'
  category?: string
  description?: string
  urgency: 'low' | 'normal' | 'high' | 'urgent'
  admin_comment?: string
  assigned_at?: string
  started_at?: string
  scheduled_date?: string
  created_at: string
  completed_at?: string
}

// Адреса клиентов
export interface DBClientAddress {
  id: string
  client_id: string
  name?: string
  postal_code?: string
  address_text: string
  location?: any              // PostGIS geography
  is_default: boolean
  created_at: string
}

// =============================================================================
// VIEWS ДЛЯ АДМИНКИ
// =============================================================================

// Объединенный view пользователей для админки
export interface DBUserView {
  user_type: 'client' | 'master'
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone: string
  status: string
  registered_at: string
  last_active: string
  verified: boolean
  orders_count: number
  rating?: number
}

// View для заявок в админке
export interface DBRequestView {
  request_id: number
  request_status: string
  request_created: string
  urgency: string
  category?: string
  description?: string
  postal_code?: string
  address?: string
  request_published_at?: string
  request_telegram_message_id?: string

  // Информация о клиенте
  client_name?: string
  client_phone: string
  client_category: string
  client_subcategory?: string

  // Информация о адресе
  address_name?: string
  address_postal_code?: string

  // Информация о назначенном мастере
  master_name?: string
  master_phone?: string
  master_rating?: number
  assigned_at?: string

  // Статистика кандидатов
  candidates_count?: number

  // Сроки
  hours_since_created: number
  hours_since_assigned?: number
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface APIResponse<T> {
  data: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// =============================================================================
// ADMIN DASHBOARD SPECIFIC TYPES
// =============================================================================

export interface AdminStats {
  totalUsers: number
  totalKunden: number
  totalHandwerker: number
  activeUsers: number
  blockedUsers: number
  totalOrders: number
  openOrders: number
  completedOrders: number
  totalRevenue: number
}

export interface AdminUserFilters {
  type: 'all' | 'client' | 'master'
  status: 'all' | 'active' | 'inactive' | 'blocked'
  search: string
}

export interface AdminOrderFilters {
  status: 'all' | 'new' | 'assigned' | 'in_progress' | 'completed' | 'canceled'
  urgency: 'all' | 'low' | 'normal' | 'high' | 'urgent'
  dateFrom?: string
  dateTo?: string
}
