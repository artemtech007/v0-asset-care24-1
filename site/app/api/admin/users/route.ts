import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, handleSupabaseError } from '@/lib/supabase'
import { mapUsersFromDB } from '@/lib/utils/admin-mapping'
import { APIResponse, AdminUserFilters } from '@/lib/types/database'

/**
 * GET /api/admin/users
 * Получение списка пользователей для админки
 *
 * Query параметры:
 * - type: 'all' | 'client' | 'master' (фильтр по типу)
 * - status: 'all' | 'active' | 'inactive' | 'blocked' (фильтр по статусу)
 * - search: string (поиск по имени/телефону/email)
 * - page: number (номер страницы, default: 1)
 * - limit: number (количество на странице, default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Параметры фильтрации
    const type = searchParams.get('type') || 'all'
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const offset = (page - 1) * limit

    // Базовый запрос к view
    let query = supabaseAdmin
      .from('view_all_users')
      .select('*', { count: 'exact' })

    // Фильтры
    if (type !== 'all') {
      query = query.eq('user_type', type)
    }

    if (status !== 'all') {
      // Маппинг статусов из админки в БД
      let dbStatus: string
      switch (status) {
        case 'active':
          dbStatus = 'active'
          break
        case 'inactive':
          dbStatus = 'inactive'
          break
        case 'blocked':
          dbStatus = 'blocked'
          break
        default:
          dbStatus = status
      }
      query = query.eq('status', dbStatus)
    }

    // Поиск
    if (search.trim()) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      )
    }

    // Пагинация и сортировка
    query = query
      .range(offset, offset + limit - 1)
      .order('registered_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw handleSupabaseError(error)
    }

    // Маппинг данных в формат админки
    const mappedUsers = data ? mapUsersFromDB(data) : []

    const response: APIResponse<any> & {
      pagination: {
        page: number
        limit: number
        total: number
        hasMore: boolean
      }
    } = {
      data: mappedUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('API Error /api/admin/users:', error)

    const errorResponse: APIResponse<null> = {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
