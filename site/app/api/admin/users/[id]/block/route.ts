import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, handleSupabaseError } from '@/lib/supabase'
import { APIResponse } from '@/lib/types/database'

/**
 * POST /api/admin/users/[id]/block
 * Блокировка или разблокировка пользователя
 *
 * Тело запроса:
 * {
 *   "action": "block" | "unblock"
 * }
 *
 * Возвращает обновленные данные пользователя
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    if (!userId) {
      return NextResponse.json(
        { data: null, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (!action || !['block', 'unblock'].includes(action)) {
      return NextResponse.json(
        { data: null, error: 'Invalid action. Must be "block" or "unblock"' },
        { status: 400 }
      )
    }

    // Определяем целевой статус
    const targetStatus = action === 'block' ? 'blocked' : 'active'

    // Определяем, это клиент или мастер по префиксу ID
    const isClient = userId.startsWith('cid_')
    const isMaster = userId.startsWith('mid_')

    if (!isClient && !isMaster) {
      return NextResponse.json(
        { data: null, error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    // Обновляем статус в соответствующей таблице
    const table = isClient ? 'clients' : 'masters'
    const { data, error } = await supabaseAdmin
      .from(table)
      .update({
        status: targetStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw handleSupabaseError(error)
    }

    if (!data) {
      return NextResponse.json(
        { data: null, error: 'User not found' },
        { status: 404 }
      )
    }

    // Возвращаем обновленные данные
    const response: APIResponse<any> = {
      data: {
        id: data.id,
        status: data.status,
        updated_at: data.updated_at
      },
      message: `User ${action}ed successfully`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('API Error /api/admin/users/[id]/block:', error)

    const errorResponse: APIResponse<null> = {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
