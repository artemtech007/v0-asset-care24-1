import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, handleSupabaseError } from '@/lib/supabase'
import { APIResponse, AdminStats } from '@/lib/types/database'

/**
 * GET /api/admin/stats
 * Получение общей статистики для админской панели
 *
 * Возвращает агрегированные данные:
 * - totalUsers: общее количество пользователей
 * - totalKunden: количество клиентов
 * - totalHandwerker: количество мастеров
 * - activeUsers: активные пользователи
 * - blockedUsers: заблокированные пользователи
 * - totalOrders: общее количество заказов
 * - openOrders: открытые заказы
 * - completedOrders: завершенные заказы
 * - totalRevenue: общая выручка (пока 0, так как поле price не определено)
 */
export async function GET(request: NextRequest) {
  try {
    // Получаем статистику пользователей
    const { data: userStats, error: userError } = await supabaseAdmin
      .rpc('get_admin_user_stats') // Создадим эту функцию в БД
      .single()

    if (userError) {
      console.warn('User stats RPC not found, falling back to separate queries')

      // Fallback: отдельные запросы
      const [clientsResult, mastersResult, ordersResult] = await Promise.all([
        // Статистика клиентов
        supabaseAdmin
          .from('clients')
          .select('status', { count: 'exact' }),

        // Статистика мастеров
        supabaseAdmin
          .from('masters')
          .select('status', { count: 'exact' }),

        // Статистика заказов
        supabaseAdmin
          .from('requests')
          .select('status', { count: 'exact' })
      ])

      if (clientsResult.error) throw handleSupabaseError(clientsResult.error)
      if (mastersResult.error) throw handleSupabaseError(mastersResult.error)
      if (ordersResult.error) throw handleSupabaseError(ordersResult.error)

      // Подсчет клиентов
      const clients = clientsResult.data || []
      const totalKunden = clients.length
      const activeKunden = clients.filter(c => c.status === 'active').length
      const blockedKunden = clients.filter(c => c.status === 'blocked').length

      // Подсчет мастеров
      const masters = mastersResult.data || []
      const totalHandwerker = masters.length
      const activeHandwerker = masters.filter(m =>
        ['active', 'approved', 'verified'].includes(m.status)
      ).length
      const blockedHandwerker = masters.filter(m =>
        ['blocked', 'suspended'].includes(m.status)
      ).length

      // Подсчет заказов
      const orders = ordersResult.data || []
      const totalOrders = orders.length
      const openOrders = orders.filter(o =>
        ['new', 'assigned', 'in_progress'].includes(o.status)
      ).length
      const completedOrders = orders.filter(o => o.status === 'completed').length

      const stats: AdminStats = {
        totalUsers: totalKunden + totalHandwerker,
        totalKunden,
        totalHandwerker,
        activeUsers: activeKunden + activeHandwerker,
        blockedUsers: blockedKunden + blockedHandwerker,
        totalOrders,
        openOrders,
        completedOrders,
        totalRevenue: 0 // Пока не определено поле price
      }

      const response: APIResponse<AdminStats> = {
        data: stats
      }

      return NextResponse.json(response)
    }

    // Если RPC функция существует, используем ее результат
    const stats: AdminStats = {
      totalUsers: userStats.total_users || 0,
      totalKunden: userStats.total_clients || 0,
      totalHandwerker: userStats.total_masters || 0,
      activeUsers: userStats.active_users || 0,
      blockedUsers: userStats.blocked_users || 0,
      totalOrders: userStats.total_orders || 0,
      openOrders: userStats.open_orders || 0,
      completedOrders: userStats.completed_orders || 0,
      totalRevenue: userStats.total_revenue || 0
    }

    const response: APIResponse<AdminStats> = {
      data: stats
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('API Error /api/admin/stats:', error)

    const errorResponse: APIResponse<null> = {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
