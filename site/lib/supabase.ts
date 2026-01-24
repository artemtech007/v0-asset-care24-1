import { createClient } from '@supabase/supabase-js'

// Environment variables для Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Клиент для клиентской стороны (с Row Level Security)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Клиент для серверной стороны (с полными правами для админ API)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Типы для ответов API
export interface SupabaseResponse<T> {
  data: T | null
  error: Error | null
}

// Утилита для обработки ошибок
export function handleSupabaseError(error: any): Error {
  if (error?.message) {
    return new Error(error.message)
  }
  return new Error('Unknown database error')
}
