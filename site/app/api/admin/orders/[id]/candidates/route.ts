import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, handleSupabaseError } from '@/lib/supabase'
import { APIResponse } from '@/lib/types/database'

/**
 * GET /api/admin/orders/[id]/candidates
 * Получение списка кандидатов на заявку
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params

    // Сначала получаем кандидатов с базовой информацией
    const { data: candidatesData, error } = await supabaseAdmin
      .from('request_candidates')
      .select(`
        id,
        applied_at,
        status,
        master_comment,
        admin_comment,
        selected_at,
        masters (
          id,
          first_name,
          last_name,
          phone,
          email,
          rating,
          master_settings (
            experience,
            qualifications,
            service_area,
            spec_elektrik,
            spec_sanitaer,
            spec_heizung,
            spec_maler
          )
        )
      `)
      .eq('request_id', requestId)
      .order('applied_at', { ascending: false })

    if (error) {
      throw handleSupabaseError(error)
    }

    // Для каждого мастера добавляем статистику работ
    const candidatesWithStats = await Promise.all(
      (candidatesData || []).map(async (candidate: any) => {
        if (!candidate.masters) return candidate

        const masterId = candidate.masters.id

        // Считаем завершенные работы
        const { count: completedJobs, error: completedError } = await supabaseAdmin
          .from('requests')
          .select('*', { count: 'exact', head: true })
          .eq('master_id', masterId)
          .eq('status', 'completed')

        // Считаем работы в процессе
        const { count: activeJobs, error: activeError } = await supabaseAdmin
          .from('requests')
          .select('*', { count: 'exact', head: true })
          .eq('master_id', masterId)
          .in('status', ['assigned', 'in_progress', 'scheduled'])

        return {
          ...candidate,
          masters: {
            ...candidate.masters,
            completed_jobs: completedJobs || 0,
            active_jobs: activeJobs || 0
          }
        }
      })
    )

    if (error) {
      throw handleSupabaseError(error)
    }

    const response: APIResponse<any> = {
      data: candidatesWithStats || []
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('API Error /api/admin/orders/[id]/candidates:', error)

    const errorResponse: APIResponse<null> = {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

/**
 * POST /api/admin/orders/[id]/candidates
 * Добавление кандидата на заявку (для тестирования или ручного добавления)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params
    const body = await request.json()
    const { master_id, master_comment } = body

    if (!master_id) {
      return NextResponse.json(
        { data: null, error: 'Master ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('request_candidates')
      .insert({
        request_id: requestId,
        master_id,
        master_comment,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      throw handleSupabaseError(error)
    }

    const response: APIResponse<any> = {
      data,
      message: 'Candidate added successfully'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('API Error POST /api/admin/orders/[id]/candidates:', error)

    const errorResponse: APIResponse<null> = {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
