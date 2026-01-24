import { DBUserView, DBRequestView } from '@/lib/types/database'

// =============================================================================
// МАППИНГ ДАННЫХ ИЗ БД В ФОРМАТ АДМИНСКОЙ ПАНЕЛИ
// =============================================================================

// Типы для AdminDashboard компонента (текущие)
export interface UserData {
  id: string                    // Из БД: id
  name: string                  // Вычисляемое: first_name + last_name
  email?: string
  phone: string
  type: "kunde" | "handwerker"  // Из БД: user_type ('client' -> 'kunde', 'master' -> 'handwerker')
  status: "aktiv" | "inaktiv" | "gesperrt"  // Из БД: status (нужен маппинг)
  registeredDate: string        // Из БД: registered_at (формат dd.mm.yyyy)
  lastActive: string           // Из БД: last_active (формат dd.mm.yyyy)
  verified: boolean            // Из БД: verified (wa_verified для совместимости)
  ordersCount: number          // Из БД: orders_count
  rating?: number              // Из БД: rating (только для мастеров)
}

export interface OrderData {
  id: number                   // Из БД: request_id
  title: string                // Из БД: description (или category + description)
  customer: string             // Из БД: client_name
  handwerker?: string          // Из БД: master_name
  status: "offen" | "zugewiesen" | "in_bearbeitung" | "abgeschlossen" | "storniert"
  date: string                 // Из БД: request_created (формат dd.mm.yyyy)
  category?: string            // Из БД: category
  address?: string             // Из БД: address
  price?: number               // Пока не определено в БД
  candidates_count?: number    // Количество кандидатов
  detailed_status?: string     // Подробный статус из БД
}

// =============================================================================
// МАППИНГ ФУНКЦИИ
// =============================================================================

/**
 * Маппинг статуса из БД в формат админки
 */
export function mapStatusFromDB(dbStatus: string): "aktiv" | "inaktiv" | "gesperrt" {
  switch (dbStatus) {
    case 'active':
      return 'aktiv'
    case 'inactive':
      return 'inaktiv'
    case 'blocked':
    case 'suspended':
      return 'gesperrt'
    default:
      return 'aktiv'
  }
}

/**
 * Маппинг типа пользователя из БД в формат админки
 */
export function mapUserTypeFromDB(userType: string): "kunde" | "handwerker" {
  switch (userType) {
    case 'client':
      return 'kunde'
    case 'master':
      return 'handwerker'
    default:
      return 'kunde'
  }
}

/**
 * Маппинг статуса заявки из БД в формат админки
 */
export function mapOrderStatusFromDB(dbStatus: string): OrderData['status'] {
  switch (dbStatus) {
    case 'waiting_candidates':
    case 'candidates_collecting':
      return 'offen'
    case 'master_selection':
      return 'offen'
    case 'master_assigned':
      return 'zugewiesen'
    case 'scheduled':
      return 'zugewiesen'
    case 'in_progress':
      return 'in_bearbeitung'
    case 'paused':
      return 'offen'
    case 'completed':
      return 'abgeschlossen'
    case 'feedback_pending':
      return 'abgeschlossen'
    case 'feedback_received':
      return 'abgeschlossen'
    case 'canceled':
      return 'storniert'
    default:
      return 'offen'
  }
}

/**
 * Форматирование даты для админки (dd.mm.yyyy)
 */
export function formatDateForAdmin(dateString: string): string {
  try {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  } catch {
    return dateString // fallback к оригинальной строке
  }
}

/**
 * Маппинг пользователя из БД view в формат админки
 */
export function mapUserFromDB(dbUser: DBUserView): UserData {
  return {
    id: dbUser.id,
    name: [dbUser.first_name, dbUser.last_name].filter(Boolean).join(' ') || 'Unbekannt',
    email: dbUser.email,
    phone: dbUser.phone,
    type: mapUserTypeFromDB(dbUser.user_type),
    status: mapStatusFromDB(dbUser.status),
    registeredDate: formatDateForAdmin(dbUser.registered_at),
    lastActive: formatDateForAdmin(dbUser.last_active),
    verified: dbUser.verified,
    ordersCount: dbUser.orders_count || 0,
    rating: dbUser.rating
  }
}

/**
 * Маппинг массива пользователей из БД
 */
export function mapUsersFromDB(dbUsers: DBUserView[]): UserData[] {
  return dbUsers.map(mapUserFromDB)
}

/**
 * Маппинг заявки из БД view в формат админки
 */
export function mapOrderFromDB(dbOrder: DBRequestView): OrderData {
  return {
    id: dbOrder.request_id,
    title: dbOrder.description || `${dbOrder.category || 'Unbekannt'} - ${dbOrder.client_name}`,
    customer: dbOrder.client_name || 'Unbekannt',
    handwerker: dbOrder.master_name || undefined,
    status: mapOrderStatusFromDB(dbOrder.request_status),
    date: formatDateForAdmin(dbOrder.request_created),
    category: dbOrder.category,
    address: dbOrder.address,
    price: undefined, // Пока не определено в БД
    candidates_count: dbOrder.candidates_count || 0,
    detailed_status: dbOrder.request_status
  }
}

/**
 * Маппинг массива заявок из БД
 */
export function mapOrdersFromDB(dbOrders: DBRequestView[]): OrderData[] {
  return dbOrders.map(mapOrderFromDB)
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Безопасное извлечение строкового значения
 */
export function safeString(value: any, fallback: string = ''): string {
  if (value === null || value === undefined) return fallback
  return String(value)
}

/**
 * Безопасное извлечение числового значения
 */
export function safeNumber(value: any, fallback: number = 0): number {
  if (value === null || value === undefined) return fallback
  const num = Number(value)
  return isNaN(num) ? fallback : num
}

/**
 * Безопасное извлечение булевого значения
 */
export function safeBoolean(value: any, fallback: boolean = false): boolean {
  if (value === null || value === undefined) return fallback
  return Boolean(value)
}
