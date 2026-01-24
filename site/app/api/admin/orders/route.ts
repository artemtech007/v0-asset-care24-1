import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, handleSupabaseError } from '@/lib/supabase'
import { mapOrdersFromDB } from '@/lib/utils/admin-mapping'
import { APIResponse } from '@/lib/types/database'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/admin/orders/migrate
 * Выполнение миграций базы данных
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create_function') {
      // Пытаемся создать функцию через прямой SQL
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Обновляем view_dispatcher_dashboard для добавления client_id
        const { error: viewError } = await supabase.rpc('exec', {
          sql: `
            DROP VIEW IF EXISTS public.view_dispatcher_dashboard;
            CREATE VIEW public.view_dispatcher_dashboard AS
            SELECT
              r.id as request_id,
              r.client_id,
              r.status as request_status,
              r.created_at as request_created,
              r.urgency,
              r.category,
              r.description,
              r.postal_code,
              r.address_snapshot as address,
              r.published_at as request_published_at,
              r.telegram_message_id as request_telegram_message_id,

              -- Информация о клиенте
              CONCAT(c.first_name, ' ', c.last_name) as client_name,
              c.phone as client_phone,
              c.category as client_category,
              c.subcategory as client_subcategory,

              -- Информация о адресе
              ca.name as address_name,
              ca.postal_code as address_postal_code,

              -- Информация о назначенном мастере
              CONCAT(m.first_name, ' ', m.last_name) as master_name,
              m.phone as master_phone,
              m.rating as master_rating,
              r.assigned_at,

              -- Статистика кандидатов
              COALESCE(rc.candidates_count, 0) as candidates_count,

              -- Сроки
              EXTRACT(EPOCH FROM (now() - r.created_at))/3600 as hours_since_created,
              CASE
                  WHEN r.status IN ('scheduled', 'in_progress', 'completed') THEN
                      EXTRACT(EPOCH FROM (now() - r.assigned_at))/3600
                  ELSE NULL
              END as hours_since_assigned

            FROM public.requests r
            JOIN public.clients c ON r.client_id = c.id
            LEFT JOIN public.client_addresses ca ON r.address_id = ca.id
            LEFT JOIN public.masters m ON r.master_id = m.id
            LEFT JOIN (
                SELECT
                    request_id,
                    COUNT(*) as candidates_count
                FROM public.request_candidates
                GROUP BY request_id
            ) rc ON r.id = rc.request_id
            WHERE r.status NOT IN ('completed', 'canceled', 'feedback_received')
            ORDER BY
                CASE r.status
                    WHEN 'waiting_candidates' THEN 1
                    WHEN 'candidates_collecting' THEN 2
                    WHEN 'master_selection' THEN 3
                    WHEN 'master_assigned' THEN 4
                    WHEN 'scheduled' THEN 5
                    WHEN 'in_progress' THEN 6
                    WHEN 'paused' THEN 7
                    WHEN 'feedback_pending' THEN 8
                    ELSE 9
                END,
                r.urgency DESC,
                r.created_at DESC;
          `
        })

        if (viewError) {
          throw viewError
        }

        const result: APIResponse<any> = {
          data: { message: 'View updated successfully' }
        }

        return NextResponse.json(result)

      } catch (error) {
        console.error('Migration error:', error)
        const errorResponse: APIResponse<null> = {
          data: null,
          error: error instanceof Error ? error.message : 'Failed to update view'
        }
        return NextResponse.json(errorResponse, { status: 500 })
      }
    }

    if (action === 'get_client_id') {
      const { request_id } = body

      if (!request_id) {
        return NextResponse.json(
          { data: null, error: 'Request ID is required' },
          { status: 400 }
        )
      }

      try {
        const { data, error } = await supabaseAdmin
          .from('requests')
          .select('client_id')
          .eq('id', request_id)
          .single()

        if (error) {
          throw handleSupabaseError(error)
        }

        const result: APIResponse<any> = {
          data: { client_id: data?.client_id }
        }

        return NextResponse.json(result)

      } catch (error) {
        console.error('Get client_id error:', error)
        const errorResponse: APIResponse<null> = {
          data: null,
          error: error instanceof Error ? error.message : 'Failed to get client_id'
        }
        return NextResponse.json(errorResponse, { status: 500 })
      }
    }

    if (action === 'create_test_requests') {
      try {
        // Создаем 10 тестовых заявок
        const testRequests = [
          {
            client_id: 'cid_wa_49123456789', // Anna Müller
            category: 'Elektrik',
            description: 'Замена старой электропроводки в квартире',
            address_snapshot: 'Berlin, Mitte, Friedrichstraße 123',
            postal_code: '10115',
            urgency: 'high'
          },
          {
            client_id: 'cid_wa_49123456790', // Max Schmidt
            category: 'Sanitär',
            description: 'Установка нового смесителя в ванной',
            address_snapshot: 'Berlin, Prenzlauer Berg, Schönhauser Allee 45',
            postal_code: '10435',
            urgency: 'normal'
          },
          {
            client_id: 'cid_wa_49123456791', // Peter Wagner
            category: 'Heizung',
            description: 'Ремонт системы отопления',
            address_snapshot: 'Berlin, Charlottenburg, Kurfürstendamm 78',
            postal_code: '10719',
            urgency: 'urgent'
          },
          {
            client_id: 'cid_wa_49123456792', // Maria Koch
            category: 'Maler',
            description: 'Покраска стен в гостиной и спальне',
            address_snapshot: 'Berlin, Kreuzberg, Oranienstraße 23',
            postal_code: '10999',
            urgency: 'low'
          },
          {
            client_id: 'cid_wa_79196811458', // Unbekannt
            category: 'Elektrik',
            description: 'Установка розеток и выключателей',
            address_snapshot: 'Berlin, Neukölln, Karl-Marx-Straße 67',
            postal_code: '12043',
            urgency: 'normal'
          },
          {
            client_id: 'cid_wa_49123456789', // Anna Müller
            category: 'Sanitär',
            description: 'Замена труб в кухне',
            address_snapshot: 'Berlin, Mitte, Torstraße 89',
            postal_code: '10119',
            urgency: 'high'
          },
          {
            client_id: 'cid_wa_49123456790', // Max Schmidt
            category: 'Heizung',
            description: 'Установка теплого пола',
            address_snapshot: 'Berlin, Prenzlauer Berg, Kastanienallee 12',
            postal_code: '10435',
            urgency: 'normal'
          },
          {
            client_id: 'cid_wa_49123456791', // Peter Wagner
            category: 'Maler',
            description: 'Покраска фасада дома',
            address_snapshot: 'Berlin, Charlottenburg, Leibnizstraße 34',
            postal_code: '10625',
            urgency: 'low'
          },
          {
            client_id: 'cid_wa_49123456792', // Maria Koch
            category: 'Elektrik',
            description: 'Установка системы умного дома',
            address_snapshot: 'Berlin, Kreuzberg, Bergmannstraße 56',
            postal_code: '10961',
            urgency: 'urgent'
          },
          {
            client_id: 'cid_wa_79196811458', // Unbekannt
            category: 'Sanitär',
            description: 'Ремонт сантехники в ванной',
            address_snapshot: 'Berlin, Neukölln, Hermannstraße 201',
            postal_code: '12049',
            urgency: 'high'
          }
        ]

        const createdRequests = []

        for (const requestData of testRequests) {
          // Generate unique request code
          const requestCode = `REQ-${String(1000 + createdRequests.length + 1).slice(-3)}-${new Date().getFullYear()}`

          const { data, error } = await supabaseAdmin
            .from('requests')
            .insert({
              client_id: requestData.client_id,
              category: requestData.category,
              description: requestData.description,
              address_snapshot: requestData.address_snapshot,
              postal_code: requestData.postal_code,
              urgency: requestData.urgency,
              status: 'waiting_candidates',
              request_code: requestCode
            })
            .select()
            .single()

          if (error) {
            console.error('Error creating request:', error)
            continue
          }

          createdRequests.push(data)

          // Добавляем кандидатов для каждой заявки
          const candidates = [
            { master_id: 'mid_wa_49987654321', comment: 'Опыт работы более 5 лет' }, // Hans Meier
            { master_id: 'mid_wa_49987654322', comment: 'Готов выполнить срочно' }, // Fritz Schulz
            { master_id: 'mid_wa_49987654323', comment: 'Специализируюсь на этом виде работ' } // Werner Becker
          ]

          for (const candidate of candidates) {
            try {
              await supabaseAdmin
                .from('request_candidates')
                .insert({
                  request_id: data.id,
                  master_id: candidate.master_id,
                  master_comment: candidate.comment,
                  status: 'pending'
                })
            } catch (err) {
              console.error('Error creating candidate:', err)
            }
          }
        }

        const result: APIResponse<any> = {
          data: {
            message: `Created ${createdRequests.length} test requests with candidates`,
            requests: createdRequests
          }
        }

        return NextResponse.json(result)

      } catch (error) {
        console.error('Create test requests error:', error)
        const errorResponse: APIResponse<null> = {
          data: null,
          error: error instanceof Error ? error.message : 'Failed to create test requests'
        }
        return NextResponse.json(errorResponse, { status: 500 })
      }
    }

    return NextResponse.json({ data: null, error: 'Unknown action' }, { status: 400 })

  } catch (error) {
    console.error('Migration API Error:', error)

    const errorResponse: APIResponse<null> = {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

/**
 * GET /api/admin/orders
 * Получение списка заказов для админки
 *
 * Query параметры:
 * - status: 'all' | 'new' | 'assigned' | 'in_progress' | 'completed' | 'canceled' (фильтр по статусу)
 * - urgency: 'all' | 'low' | 'normal' | 'high' | 'urgent' (фильтр по срочности)
 * - dateFrom: string (дата от, формат YYYY-MM-DD)
 * - dateTo: string (дата до, формат YYYY-MM-DD)
 * - page: number (номер страницы, default: 1)
 * - limit: number (количество на странице, default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Параметры фильтрации
    const status = searchParams.get('status') || 'all'
    const urgency = searchParams.get('urgency') || 'all'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const offset = (page - 1) * limit

    // Запрос к view_dispatcher_dashboard (уже содержит JOIN с пользователями)
    let query = supabaseAdmin
      .from('view_dispatcher_dashboard')
      .select('*', { count: 'exact' })

    // Фильтры по статусу
    if (status !== 'all') {
      // Маппинг статусов из админки в БД
      let dbStatus: string
      switch (status) {
        case 'new':
          dbStatus = 'new'
          break
        case 'assigned':
          dbStatus = 'assigned'
          break
        case 'in_progress':
          dbStatus = 'in_progress'
          break
        case 'completed':
          dbStatus = 'completed'
          break
        case 'canceled':
          dbStatus = 'canceled'
          break
        default:
          dbStatus = status
      }
      query = query.eq('request_status', dbStatus)
    }

    // Фильтры по срочности
    if (urgency !== 'all') {
      query = query.eq('urgency', urgency)
    }

    // Фильтры по дате создания
    if (dateFrom) {
      query = query.gte('request_created', dateFrom)
    }
    if (dateTo) {
      query = query.lte('request_created', dateTo)
    }

    // Пагинация и сортировка
    // Сначала самые срочные и новые
    query = query
      .order('urgency', { ascending: false }) // urgent -> low
      .order('request_created', { ascending: false }) // новые сверху
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw handleSupabaseError(error)
    }

    // Маппинг данных в формат админки
    const mappedOrders = data ? mapOrdersFromDB(data) : []

    const response: APIResponse<any> & {
      pagination: {
        page: number
        limit: number
        total: number
        hasMore: boolean
      }
    } = {
      data: mappedOrders,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('API Error /api/admin/orders:', error)

    const errorResponse: APIResponse<null> = {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
