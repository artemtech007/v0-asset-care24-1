import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, handleSupabaseError } from '@/lib/supabase'
import { APIResponse } from '@/lib/types/database'

/**
 * GET /api/admin/orders/[id]
 * Получение полной информации о конкретной заявке
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params

    const { data, error } = await supabaseAdmin
      .from('view_dispatcher_dashboard')
      .select('*')
      .eq('request_id', requestId)
      .single()

    if (error) {
      throw handleSupabaseError(error)
    }

    const response: APIResponse<any> = {
      data: data || null
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('API Error /api/admin/orders/[id]:', error)

    const errorResponse: APIResponse<null> = {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
