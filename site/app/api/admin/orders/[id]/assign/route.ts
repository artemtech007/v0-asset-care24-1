import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, handleSupabaseError } from '@/lib/supabase'
import { APIResponse } from '@/lib/types/database'

/**
 * Send webhooks to n8n
 */
async function sendWebhooks(webhookData: any) {
  const webhookUrls = [
    'https://assetcare24.org/webhook/c9a4721c-7ced-4a82-a672-b1d9e51fce65',
    'https://assetcare24.org/webhook-test/c9a4721c-7ced-4a82-a672-b1d9e51fce65'
  ]

  const promises = webhookUrls.map(url =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookData)
    }).catch(err => {
      console.error(`Webhook error for ${url}:`, err)
      // Don't throw error, just log it
    })
  )

  await Promise.all(promises)
}

/**
 * POST /api/admin/orders/[id]/assign
 * Назначение мастера на заявку из списка кандидатов
 *
 * Body: {
 *   "master_id": "mid_wa_49987654321",
 *   "admin_comment": "Выбран за опыт работы"
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params
    const body = await request.json()
    const { master_id, admin_comment } = body

    if (!master_id) {
      return NextResponse.json(
        { data: null, error: 'Master ID is required' },
        { status: 400 }
      )
    }

    const requestIdNum = parseInt(requestId)
    if (isNaN(requestIdNum)) {
      return NextResponse.json(
        { data: null, error: 'Invalid request ID' },
        { status: 400 }
      )
    }

    // Реализуем логику назначения мастера без PostgreSQL функции
    // Проверяем статус заявки
    const { data: requestData, error: requestError } = await supabaseAdmin
      .from('requests')
      .select('status')
      .eq('id', requestIdNum)
      .single()

    if (requestError || !requestData) {
      return NextResponse.json(
        { data: null, error: 'Request not found' },
        { status: 404 }
      )
    }

    if (!['waiting_candidates', 'candidates_collecting', 'master_selection'].includes(requestData.status)) {
      return NextResponse.json(
        { data: null, error: `Cannot assign master to request with status ${requestData.status}` },
        { status: 400 }
      )
    }

    // Проверяем, существует ли кандидат
    const { data: existingCandidate, error: candidateError } = await supabaseAdmin
      .from('request_candidates')
      .select('id')
      .eq('request_id', requestIdNum)
      .eq('master_id', master_id)
      .single()

    if (candidateError && candidateError.code !== 'PGRST116') { // PGRST116 = not found
      return NextResponse.json(
        { data: null, error: `Database error: ${candidateError.message}` },
        { status: 500 }
      )
    }

    // Создаем или обновляем кандидата
    if (!existingCandidate) {
      const { error: insertError } = await supabaseAdmin
        .from('request_candidates')
        .insert({
          request_id: requestIdNum,
          master_id,
          status: 'selected',
          admin_comment: admin_comment || 'Мастер назначен администратором',
          selected_at: new Date().toISOString()
        })

      if (insertError) {
        return NextResponse.json(
          { data: null, error: `Failed to create candidate: ${insertError.message}` },
          { status: 500 }
        )
      }
    } else {
      const { error: updateError } = await supabaseAdmin
        .from('request_candidates')
        .update({
          status: 'selected',
          admin_comment: admin_comment || 'Мастер назначен администратором',
          selected_at: new Date().toISOString()
        })
        .eq('request_id', requestIdNum)
        .eq('master_id', master_id)

      if (updateError) {
        return NextResponse.json(
          { data: null, error: `Failed to update candidate: ${updateError.message}` },
          { status: 500 }
        )
      }
    }

    // Отклоняем остальных кандидатов
    const { error: rejectError } = await supabaseAdmin
      .from('request_candidates')
      .update({ status: 'rejected' })
      .eq('request_id', requestIdNum)
      .neq('master_id', master_id)

    if (rejectError) {
      return NextResponse.json(
        { data: null, error: `Failed to reject other candidates: ${rejectError.message}` },
        { status: 500 }
      )
    }

    // Обновляем заявку
    const { error: updateRequestError } = await supabaseAdmin
      .from('requests')
      .update({
        master_id,
        status: 'master_assigned',
        assigned_at: new Date().toISOString(),
        admin_comment: admin_comment || 'Мастер назначен администратором'
      })
      .eq('id', requestIdNum)

    if (updateRequestError) {
      return NextResponse.json(
        { data: null, error: `Failed to update request: ${updateRequestError.message}` },
        { status: 500 }
      )
    }

    const result = {
      request_id: requestIdNum,
      master_id,
      status: 'master_assigned',
      assigned_at: new Date().toISOString(),
      admin_comment: admin_comment || 'Мастер назначен администратором'
    }

    // Send webhooks to n8n
    try {
      // Get full request data for webhook
      const { data: requestData, error: requestFetchError } = await supabaseAdmin
        .from('requests')
        .select(`
          id,
          client_id,
          request_code,
          category,
          description,
          address_snapshot,
          postal_code
        `)
        .eq('id', requestIdNum)
        .single()

      if (!requestFetchError && requestData) {
        const webhookData = {
          request_id: requestData.id,
          request_code: requestData.request_code,
          client_id: requestData.client_id,
          master_id: master_id,
          request_title: requestData.description || `Заявка #${requestData.id}`,
          request_description: requestData.description || `Заявка #${requestData.id}`,
          category: requestData.category,
          address: requestData.address_snapshot,
          postal_code: requestData.postal_code,
          assigned_at: result.assigned_at,
          admin_comment: admin_comment || 'Мастер назначен администратором'
        }

        // Send webhooks asynchronously (don't wait for completion)
        sendWebhooks(webhookData)
      }
    } catch (webhookError) {
      console.error('Webhook preparation error:', webhookError)
      // Don't fail the assignment if webhook fails
    }

    const response: APIResponse<any> = {
      data: result,
      message: 'Master assigned successfully'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('API Error POST /api/admin/orders/[id]/assign:', error)

    const errorResponse: APIResponse<null> = {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
